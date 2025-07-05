'use client';

import { useEffect, useState } from 'react';
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
        } catch {
            toast.error('Không thể tải bình luận');
        }
    };

    const fetchRating = async () => {
        try {
            const avg = await api.get(`/student/courses/${courseId}/rating/average`);
            setAverageRating(avg.data);
        } catch {
            setAverageRating(null);
        }

        try {
            const mine = await api.get(`/student/courses/${courseId}/rating/mine`);
            if (mine.data) {
                setRating(mine.data.value);
                setAlreadyRated(true);
            }
        } catch {
            setAlreadyRated(false);
        }
    };

    const fetchEnrollment = async () => {
        try {
            const res = await api.get(`/student/enrolled/${courseId}`);
            setEnrolled(res.data);
        } catch {
            setEnrolled(false);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchRating();
        fetchEnrollment();
    }, [courseId]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
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
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await api.delete(`/student/courses/${courseId}/comments/${commentId}`);
            toast.success('Đã xóa bình luận');
            fetchComments();
        } catch {
            toast.error('Xóa bình luận thất bại');
        }
    };

    const handleRate = async (score: number) => {
        try {
            await api.post(`/student/courses/${courseId}/rating`, { value: score });
            toast.success(alreadyRated ? 'Đã cập nhật đánh giá' : 'Đã đánh giá thành công');
            setRating(score);
            setAlreadyRated(true);
            fetchRating();
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


    return (
        <div className="mt-10 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Đánh giá & Bình luận</h2>

            {averageRating != null && (
                <div className="mb-4 text-yellow-600 font-medium">
                    Điểm trung bình: {Number(averageRating).toFixed(1)} / 5
                </div>
            )}

            {role === 'STUDENT' && (
                <div className="mb-6">
                    <p className="font-medium mb-2">
                        {alreadyRated ? 'Cập nhật đánh giá của bạn:' : 'Đánh giá khóa học:'}
                    </p>
                    {enrolled ? (
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer transition ${
                                        rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                                    }`}
                                    onClick={() => handleRate(star)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-red-500">* Bạn cần mua khóa học để đánh giá</div>
                    )}
                </div>
            )}

            {role === 'STUDENT' && (
                <div className="mb-6">
                    <Textarea
                        placeholder="Nhập bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    {enrolled ? (
                        <Button className="mt-2" onClick={handlePostComment}>
                            Gửi bình luận
                        </Button>
                    ) : (
                        <div className="mt-2 text-sm text-red-500">
                            * Bạn cần mua khóa học để bình luận
                        </div>
                    )}
                </div>
            )}

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

                        {comment.userId === userId && editingCommentId !== comment.id && (
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

                        {enrolled && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 hover:underline mt-1"
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                Trả lời
                            </Button>
                        )}

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

                                {reply.userId === userId && editingCommentId !== reply.id && (
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
