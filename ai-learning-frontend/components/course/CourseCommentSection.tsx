// CourseCommentSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/store/auth';
import { Star } from 'lucide-react';

interface CommentResponse {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    content: string;
    parentId?: string;
    createdAt: string;
    replies?: CommentResponse[];
}

export default function CourseCommentSection({ courseId }: { courseId: string }) {
    const { role, userId } = useAuth(); // userId cũng rất quan trọng
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [alreadyRated, setAlreadyRated] = useState(false);
    const [enrolled, setEnrolled] = useState(false); // Chỉ quan trọng cho STUDENT

    const fetchComments = async () => {
        try {
            // API này giờ đã là permitAll()
            const res = await api.get(`/student/courses/${courseId}/comments`);
            setComments(res.data);
        } catch (err) {
            toast.error('Không thể tải bình luận');
            console.error("Error fetching comments:", err);
        }
    };

    const fetchRatingData = async () => {
        try {
            // API này giờ đã là permitAll()
            const avg = await api.get(`/student/courses/${courseId}/rating/average`);
            setAverageRating(avg.data);
        } catch (err) {
            setAverageRating(null);
            console.error("Error fetching average rating:", err);
        }

        // Chỉ fetch rating của tôi nếu là STUDENT
        if (role === 'STUDENT') {
            try {
                const mine = await api.get(`/student/courses/${courseId}/rating/mine`);
                if (mine.data) {
                    setRating(mine.data.value);
                    setAlreadyRated(true);
                }
            } catch (err) {
                setAlreadyRated(false);
                // Có thể có lỗi 404 nếu chưa đánh giá, không cần toast
                console.error("Error fetching my rating:", err);
            }
        }
    };

    const fetchEnrollment = async () => {
        if (role === 'STUDENT') { // Chỉ kiểm tra enrollment cho STUDENT
            try {
                const res = await api.get(`/student/enrolled/${courseId}`);
                setEnrolled(res.data);
            } catch (err) {
                setEnrolled(false);
                console.error("Error fetching enrollment status:", err);
            }
        } else {
            setEnrolled(true); // Đối với TEACHER, coi như luôn "enrolled" để cho phép bình luận/tương tác
        }
    };

    useEffect(() => {
        fetchComments();
        fetchRatingData();
        fetchEnrollment();
    }, [courseId, role]); // Thêm role vào dependency array

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        // Kiểm tra quyền bình luận: nếu là STUDENT phải enrolled, TEACHER luôn được phép
        if (role === 'STUDENT' && !enrolled) {
            toast.error('Bạn cần mua khóa học để bình luận');
            return;
        }

        try {
            // API này giờ đã là hasAnyRole('STUDENT', 'TEACHER')
            await api.post(`/student/courses/${courseId}/comments`, {
                content: newComment,
            });
            toast.success('Đã gửi bình luận');
            setNewComment('');
            fetchComments();
        } catch {
            toast.error('Gửi bình luận thất bại');
        }
    };

    const handleReplySubmit = async (parentId: string) => {
        if (!replyContent.trim()) return;
        // Kiểm tra quyền trả lời: tương tự như bình luận
        if (role === 'STUDENT' && !enrolled) {
            toast.error('Bạn cần mua khóa học để trả lời bình luận');
            return;
        }

        try {
            // API này giờ đã là hasAnyRole('STUDENT', 'TEACHER')
            await api.post(`/student/courses/${courseId}/comments`, {
                content: replyContent,
                parentId,
            });
            toast.success('Phản hồi thành công');
            setReplyContent('');
            setReplyingTo(null);
            fetchComments();
        } catch {
            toast.error('Không thể gửi phản hồi');
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            // API này giờ đã là hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')
            await api.put(`/student/courses/${courseId}/comments/${commentId}`, {
                content: editContent,
            });
            toast.success('Cập nhật bình luận thành công');
            setEditingCommentId(null);
            fetchComments();
        } catch {
            toast.error('Cập nhật thất bại. Bạn không có quyền hoặc bình luận không tồn tại.');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            // API này giờ đã là hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')
            await api.delete(`/student/courses/${courseId}/comments/${commentId}`);
            toast.success('Đã xóa bình luận');
            fetchComments();
        } catch {
            toast.error('Xóa bình luận thất bại. Bạn không có quyền hoặc bình luận không tồn tại.');
        }
    };

    const handleRate = async (score: number) => {
        if (role !== 'STUDENT') { // Chỉ STUDENT mới được đánh giá
            toast.error('Chỉ học sinh mới có thể đánh giá khóa học.');
            return;
        }
        if (!enrolled) { // STUDENT phải enrolled mới được đánh giá
            toast.error('Bạn cần mua khóa học để đánh giá.');
            return;
        }

        try {
            // API này giờ đã là hasRole('STUDENT')
            await api.post(`/student/courses/${courseId}/rating`, { value: score });
            toast.success(alreadyRated ? 'Đã cập nhật đánh giá' : 'Đã đánh giá thành công');
            setRating(score);
            setAlreadyRated(true);
            fetchRatingData(); // Re-fetch cả average để cập nhật ngay
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền đánh giá khóa học này');
            } else if (error.response?.status === 400) {
                toast.error('Bạn đã đánh giá rồi. Vui lòng cập nhật đánh giá thay vì đánh giá lại.');
            } else {
                toast.error('Đánh giá thất bại');
            }
        }
    };

    // Hàm kiểm tra quyền sửa/xóa bình luận
    const canManageComment = (commentUserId: string) => {
        if (!userId) return false; // Chưa đăng nhập

        // Admin luôn có quyền
        if (role === 'ADMIN') return true;

        // Người tạo bình luận có quyền
        if (commentUserId === userId) return true;

        // Giáo viên của khóa học có thể có quyền quản lý bình luận
        // (Đây là logic bạn cần đảm bảo ở backend, nhưng frontend có thể cho phép hiển thị nút)
        // if (role === 'TEACHER') return true; // Giả định teacher có quyền xóa/sửa comment trong khóa học của mình

        return false;
    };

    return (
        <div className="mt-10 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Đánh giá & Bình luận</h2>

            {averageRating != null && (
                <div className="mb-4 text-yellow-600 font-medium">
                    Điểm trung bình: {Number(averageRating).toFixed(1)} / 5
                </div>
            )}

            {/* Phần đánh giá khóa học */}
            {role === 'STUDENT' && ( // Chỉ hiển thị phần đánh giá cho STUDENT
                <div className="mb-6">
                    <p className="font-medium mb-2">
                        {alreadyRated ? 'Cập nhật đánh giá của bạn:' : 'Đánh giá khóa học:'}
                    </p>
                    {/* Luôn hiển thị sao cho STUDENT, nhưng chỉ cho phép bấm khi enrolled */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-6 h-6 cursor-pointer transition ${
                                    rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                                } ${!enrolled ? 'opacity-50 cursor-not-allowed' : ''}`} // Làm mờ nếu chưa enrolled
                                onClick={() => enrolled && handleRate(star)} // Chỉ gọi handleRate nếu enrolled
                            />
                        ))}
                    </div>
                    {!enrolled && ( // Thông báo nếu STUDENT chưa enrolled
                        <div className="text-sm text-red-500 mt-2">* Bạn cần mua khóa học để đánh giá</div>
                    )}
                </div>
            )}

            {/* Phần gửi bình luận mới */}
            {role && (role === 'STUDENT' || role === 'TEACHER') && ( // Cho phép STUDENT và TEACHER bình luận
                <div className="mb-6">
                    <Textarea
                        placeholder="Nhập bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    {/* Kiểm tra enrolled chỉ cho STUDENT, TEACHER luôn được phép gửi */}
                    {(role === 'STUDENT' && enrolled) || role === 'TEACHER' ? (
                        <Button className="mt-2" onClick={handlePostComment}>
                            Gửi bình luận
                        </Button>
                    ) : (
                        role === 'STUDENT' && !enrolled && (
                            <div className="mt-2 text-sm text-red-500">
                                * Bạn cần mua khóa học để bình luận
                            </div>
                        )
                    )}
                </div>
            )}


            {/* Hiển thị danh sách bình luận */}
            <div>
                {comments.map((comment) => (
                    <div key={comment.id} className="mb-4 border-b pb-3">
                        <div className="font-semibold text-gray-800">{comment.userName}</div>
                        <div className="text-sm text-gray-600">{new Date(comment.createdAt).toLocaleString()}</div>

                        {editingCommentId === comment.id ? (
                            <div className="mt-2">
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="mt-2 flex gap-2">
                                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>Lưu</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-gray-700 whitespace-pre-line">{comment.content}</p>
                        )}

                        {/* Nút chỉnh sửa/xóa cho comment cha */}
                        {canManageComment(comment.userId) && editingCommentId !== comment.id && (
                            <div className="flex gap-2 mt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-600 hover:underline"
                                    onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditContent(comment.content);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-red-600 hover:underline"
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    Xóa
                                </Button>
                            </div>
                        )}

                        {/* Nút trả lời */}
                        {role && (role === 'STUDENT' && enrolled) || role === 'TEACHER' ? ( // Cho phép STUDENT đã enrolled hoặc TEACHER trả lời
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 hover:underline mt-1"
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                Trả lời
                            </Button>
                        ) : null}


                        {/* Hiển thị replies */}
                        {comment.replies?.map((reply) => (
                            <div key={reply.id} className="ml-6 mt-2 border-l pl-4 border-gray-300">
                                <div className="font-semibold text-gray-700">{reply.userName}</div>
                                <div className="text-sm text-gray-500">{new Date(reply.createdAt).toLocaleString()}</div>

                                {editingCommentId === reply.id ? (
                                    <div className="mt-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <Button size="sm" onClick={() => handleEditComment(reply.id)}>Lưu</Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 mt-1">{reply.content}</p>
                                )}

                                {/* Nút chỉnh sửa/xóa cho reply */}
                                {canManageComment(reply.userId) && editingCommentId !== reply.id && (
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-gray-600 hover:underline"
                                            onClick={() => {
                                                setEditingCommentId(reply.id);
                                                setEditContent(reply.content);
                                            }}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-red-600 hover:underline"
                                            onClick={() => handleDeleteComment(reply.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Form trả lời */}
                        {replyingTo === comment.id && (
                            <div className="ml-6 mt-2">
                                <Textarea
                                    placeholder="Phản hồi..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <div className="mt-2 flex gap-2">
                                    <Button size="sm" onClick={() => handleReplySubmit(comment.id)}>
                                        Gửi
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}