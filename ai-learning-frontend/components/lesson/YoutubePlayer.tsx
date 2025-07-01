"use client";
import React from 'react';

function YouTubePlayer({ videoId }: { videoId: string | null }) {
    console.log("YouTubePlayer received videoId:", videoId);

    if (!videoId) {
        console.log("YouTubePlayer: No videoId, not rendering.");
        return null;
    }

    // ✅ Đã sửa URL nhúng YouTube chính xác
    const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        // ✅ Loại bỏ các styling thừa ở đây. Component này chỉ nên lo việc hiển thị video responsive.
        // Các padding, border, shadow, title "Video liên quan:" đã được chuyển ra LessonContent.tsx.
        <div className="w-full"> {/* Đảm bảo wrapper chiếm toàn bộ chiều rộng có sẵn */}
            {/* aspect-w-16 aspect-h-9 là cách Tailwind/plugin CSS xử lý responsive aspect ratio.
                Đảm bảo plugin này được cài đặt và cấu hình đúng trong dự án của bạn (ví dụ: @tailwindcss/aspect-ratio).
                Nếu không dùng Tailwind hoặc plugin này, bạn cần sử dụng CSS thuần như đã đề cập trước đó.
            */}
            <div className="w-full aspect-w-16 aspect-h-9">
                <iframe
                    className="w-full h-full rounded-md"
                    src={youtubeEmbedUrl} // Sử dụng URL đã sửa
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

export default YouTubePlayer;