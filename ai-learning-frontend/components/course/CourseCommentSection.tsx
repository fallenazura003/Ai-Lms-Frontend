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
    const { role, userId } = useAuth();
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [alreadyRated, setAlreadyRated] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/student/courses/${courseId}/comments`);
            setComments(res.data);
        } catch (err) {
            toast.error('Không thể tải bình luận');
            console.error("Error fetching comments:", err);
        }
    };

    const fetchRatingData = async () => {
        try {
            const avg = await api.get(`/student/courses/${courseId}/rating/average`);
            setAverageRating(avg.data);
        } catch (err) {
            setAverageRating(null);
            console.error("Error fetching average rating:", err);
        }

        if (role === 'STUDENT') {
            try {
                const mine = await api.get(`/student/courses/${courseId}/rating/mine`);
                if (mine.data) {
                    setRating(mine.data.value);
                    setAlreadyRated(true);
                }
            } catch (err) {
                setAlreadyRated(false);
                console.error("Error fetching my rating:", err);
            }
        }
    };

    const fetchEnrollment = async () => {
        if (role === 'STUDENT') {
            try {
                const res = await api.get(`/student/enrolled/${courseId}`);
                setEnrolled(res.data);
            } catch (err) {
                setEnrolled(false);
                console.error("Error fetching enrollment status:", err);
            }
        } else {
            setEnrolled(true);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchRatingData();
        fetchEnrollment();
    }, [courseId, role]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (role === 'STUDENT' && !enrolled) {
            toast.error('Bạn cần mua khóa học để bình luận');
            return;
        }

        try {
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
        if (role === 'STUDENT' && !enrolled) {
            toast.error('Bạn cần mua khóa học để trả lời bình luận');
            return;
        }

        try {
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
            await api.delete(`/student/courses/${courseId}/comments/${commentId}`);
            toast.success('Đã xóa bình luận');
            fetchComments();
        } catch {
            toast.error('Xóa bình luận thất bại. Bạn không có quyền hoặc bình luận không tồn tại.');
        }
    };

    const handleRate = async (score: number) => {
        if (role !== 'STUDENT') {
            toast.error('Chỉ học sinh mới có thể đánh giá khóa học.');
            return;
        }
        if (!enrolled) {
            toast.error('Bạn cần mua khóa học để đánh giá.');
            return;
        }

        try {
            await api.post(`/student/courses/${courseId}/rating`, { value: score });
            toast.success(alreadyRated ? 'Đã cập nhật đánh giá' : 'Đã đánh giá thành công');
            setRating(score);
            setAlreadyRated(true);
            fetchRatingData();
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

    const canManageComment = (commentUserId: string) => {
        if (!userId) return false;

        if (role === 'ADMIN') return true;
        if (commentUserId === userId) return true;

        return false;
    };

    return (
        <div className="mt-8 md:mt-10 border-t pt-4 md:pt-6 px-4 sm:px-0"> {/* ✅ Responsive padding */}
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Đánh giá & Bình luận</h2> {/* ✅ Responsive font size */}

            {averageRating != null && (
                <div className="mb-3 md:mb-4 text-yellow-600 font-medium text-base md:text-lg"> {/* ✅ Responsive font size and margin */}
                    Điểm trung bình: {Number(averageRating).toFixed(1)} / 5
                </div>
            )}

            {/* Phần đánh giá khóa học */}
            {role === 'STUDENT' && (
                <div className="mb-5 md:mb-6 p-4 border rounded-md bg-gray-50"> {/* ✅ Thêm styling cho phần đánh giá */}
                    <p className="font-medium mb-2 text-base md:text-lg">
                        {alreadyRated ? 'Cập nhật đánh giá của bạn:' : 'Đánh giá khóa học:'}
                    </p>
                    <div className="flex gap-1 sm:gap-2"> {/* ✅ Responsive gap */}
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transition ${ // ✅ Responsive icon size
                                    rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                                } ${!enrolled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => enrolled && handleRate(star)}
                            />
                        ))}
                    </div>
                    {!enrolled && (
                        <div className="text-xs md:text-sm text-red-500 mt-2"> {/* ✅ Responsive font size */}
                            * Bạn cần mua khóa học để đánh giá
                        </div>
                    )}
                </div>
            )}

            {/* Phần gửi bình luận mới */}
            {role && (role === 'STUDENT' || role === 'TEACHER') && (
                <div className="mb-6 p-4 border rounded-md bg-gray-50"> {/* ✅ Thêm styling cho phần bình luận mới */}
                    <Textarea
                        placeholder="Nhập bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full text-sm md:text-base" // ✅ Full width và responsive font size
                        rows={3} // Giới hạn số dòng hiển thị
                    />
                    {(role === 'STUDENT' && enrolled) || role === 'TEACHER' ? (
                        <Button className="mt-3 w-full sm:w-auto" onClick={handlePostComment}> {/* ✅ Full width trên mobile, auto trên desktop */}
                            Gửi bình luận
                        </Button>
                    ) : (
                        role === 'STUDENT' && !enrolled && (
                            <div className="mt-2 text-xs md:text-sm text-red-500">
                                * Bạn cần mua khóa học để bình luận
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Hiển thị danh sách bình luận */}
            <div>
                <h3 className="text-xl font-semibold mb-3 md:mb-4">Tất cả bình luận</h3> {/* ✅ Thêm tiêu đề */}
                {comments.length === 0 && (
                    <p className="text-gray-500 italic text-center py-4">Chưa có bình luận nào.</p>
                )}
                {comments.map((comment) => (
                    <div key={comment.id} className="mb-4 pb-3 border-b border-gray-200 last:border-b-0"> {/* ✅ Responsive margin và border */}
                        <div className="font-semibold text-gray-800 text-base md:text-lg">{comment.userName}</div> {/* ✅ Responsive font size */}
                        <div className="text-xs md:text-sm text-gray-600 mb-1">{new Date(comment.createdAt).toLocaleString()}</div> {/* ✅ Responsive font size */}

                        {editingCommentId === comment.id ? (
                            <div className="mt-2">
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full text-sm md:text-base"
                                    rows={3}
                                />
                                <div className="mt-2 flex gap-2">
                                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>Lưu</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-gray-700 text-sm md:text-base whitespace-pre-line">{comment.content}</p>
                            )}

                        {canManageComment(comment.userId) && editingCommentId !== comment.id && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2"> {/* ✅ Flex wrap cho mobile */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-600 hover:underline px-0 py-0 h-auto" // ✅ Nút nhỏ gọn hơn
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
                                    className="text-xs text-red-600 hover:underline px-0 py-0 h-auto" // ✅ Nút nhỏ gọn hơn
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    Xóa
                                </Button>
                            </div>
                        )}

                        {role && (role === 'STUDENT' && enrolled) || role === 'TEACHER' ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 hover:underline mt-2 px-0 py-0 h-auto" // ✅ Nút nhỏ gọn hơn
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                Trả lời
                            </Button>
                        ) : null}

                        {/* Hiển thị replies */}
                        {comment.replies?.map((reply) => (
                            <div key={reply.id} className="ml-4 sm:ml-6 mt-2 border-l pl-3 sm:pl-4 border-gray-300"> {/* ✅ Responsive margin và padding */}
                                <div className="font-semibold text-gray-700 text-base md:text-lg">{reply.userName}</div> {/* ✅ Responsive font size */}
                                <div className="text-xs md:text-sm text-gray-500 mb-1">{new Date(reply.createdAt).toLocaleString()}</div> {/* ✅ Responsive font size */}

                                {editingCommentId === reply.id ? (
                                    <div className="mt-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full text-sm md:text-base"
                                            rows={3}
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <Button size="sm" onClick={() => handleEditComment(reply.id)}>Lưu</Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 mt-1 text-sm md:text-base whitespace-pre-line">{reply.content}</p>
                                    )}

                                {canManageComment(reply.userId) && editingCommentId !== reply.id && (
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2"> {/* ✅ Flex wrap cho mobile */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-gray-600 hover:underline px-0 py-0 h-auto"
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
                                            className="text-xs text-red-600 hover:underline px-0 py-0 h-auto"
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
                            <div className="ml-4 sm:ml-6 mt-3 p-3 bg-gray-50 border rounded-md"> {/* ✅ Responsive margin và styling */}
                                <Textarea
                                    placeholder="Phản hồi..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="w-full text-sm md:text-base"
                                    rows={2} // Giảm số dòng cho reply
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