"use client";
import React from 'react';

function YouTubePlayer({ videoId }: { videoId: string | null }) {
    console.log("YouTubePlayer received videoId:", videoId);

    if (!videoId) {
        console.log("YouTubePlayer: No videoId, not rendering.");
        return null;
    }

    const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className="w-full">
            <div className="relative pt-[56.25%]"> {/* Tạo tỷ lệ 16:9 bằng cách dùng padding-top (56.25% = 9/16) */}
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-md" // Full size trong container tương đối
                    src={youtubeEmbedUrl}
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