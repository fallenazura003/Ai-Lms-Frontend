// components/WelcomeBanner.tsx
import React from 'react';

export default function WelcomeBanner() {
    return (
        <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-900 to-pink-400 rounded-2xl text-white shadow-md">
            <h2 className="font-bold text-2xl">Chào mừng bạn đến với Học thông minh</h2>
            <p className="text-lg opacity-90">Khám phá giới hạn của bản thân</p>
        </div>
    );
}