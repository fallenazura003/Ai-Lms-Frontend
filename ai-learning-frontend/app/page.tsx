'use client';

import Image from 'next/image';

export default function LandingPage() {
    return (
        <main className="relative flex items-center justify-center h-screen overflow-hidden">
            {/* Ảnh nền */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/background1.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" /> {/* overlay tối + làm mờ */}
            </div>

            {/* Nội dung */}
            <div className="text-center text-white px-4">
                <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
                    AI Learning Platform
                </h1>
                <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-xl mx-auto">
                    Nền tảng học tập hiện đại với sự hỗ trợ từ AI và giảng viên thực tế.
                    Nâng cao kỹ năng, tiết kiệm thời gian.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href="/login"
                        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold shadow-md"
                    >
                        Đăng nhập
                    </a>
                    <a
                        href="/register"
                        className="px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-black transition font-semibold shadow-md"
                    >
                        Đăng ký
                    </a>
                </div>
            </div>
        </main>
    );
}
