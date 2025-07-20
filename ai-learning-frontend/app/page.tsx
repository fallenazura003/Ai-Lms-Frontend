'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    BrainCog, Zap, UsersRound, UserPlus, Lightbulb, Route,
    Twitter, Github, Rocket, Menu, X // Thêm Menu, X cho mobile nav
} from 'lucide-react'; // Import icons từ lucide-react
import { useState, useEffect } from 'react'; // Để quản lý state cho mobile nav và carousel

// Dữ liệu mẫu cho testimonials
const testimonials = [
    {
        id: 1,
        quote: "Học thông minh đã thay đổi cách mình học kỹ năng mới. Cá nhân hóa từ AI thật sự ấn tượng – mình tự tin hơn bao giờ hết!",
        author: "Michael B.",
        title: "Sinh viên ngành Phát triển Phần mềm",
        image: "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
    },
    {
        id: 2,
        quote: "Nền tảng này vượt xa mong đợi của tôi. Phản hồi tức thì và lộ trình học tập tùy chỉnh giúp tôi đạt được mục tiêu nhanh hơn.",
        author: "Nguyễn Thị Hoa",
        title: "Chuyên gia Marketing",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM5Nzd8MHwxfHNlYXJjaHw3fHxhc2lhbiUyMHdvbWFufGVufDB8fHx8MTcwMTcwNzgyMXww&ixlib=rb-4.0.3&q=80&w=400", // Example image
    },
    {
        id: 3,
        quote: "Tôi đã thử nhiều khóa học trực tuyến, nhưng không gì sánh bằng Học thông minh. AI đồng hành thực sự là một lợi thế lớn!",
        author: "Trần Văn Nam",
        title: "Quản lý dự án",
        image: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Example image
    },
];

export default function LandingPage() {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

    // JavaScript cho banner (carousel testimonials)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonialIndex((prevIndex) =>
                (prevIndex + 1) % testimonials.length
            );
        }, 5000); // Chuyển đổi mỗi 5 giây

        return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
    }, []);

    const handleDotClick = (index: number) => {
        setCurrentTestimonialIndex(index);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#1A1A2E] text-[#F4F4F4] font-sans relative">
            {/* Background Gradient Animation */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                {/* Thay thế màu cụ thể */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#004D40] via-[#009688]  to-[#FFC1B6]
 opacity-20 animate-gradient-flow"></div>

            </div>

            {/* Navbar */}
            <nav className="bg-[#1A1A2E]/80 backdrop-blur-md fixed w-full z-20 top-0 start-0 border-b border-gray-700/50 shadow-xl py-3 md:py-4">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 md:px-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-[#06D6A0] h-7 w-7 md:h-8 md:w-8" // Responsive icon size
                        >
                            <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V12h9V6.5A4.5 4.5 0 0 0 12 2Z"></path>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M12 12v2.5a4.5 4.5 0 1 1-4.5 4.5V19a4.5 4.5 0 0 0 4.5-4.5Z"></path>
                            <path d="M12 12h4.5a4.5 4.5 0 1 1-4.5 4.5V19a4.5 4.5 0 0 1 4.5-4.5Z"></path>
                        </svg>
                        <span className="self-center text-xl md:text-2xl font-header font-semibold whitespace-nowrap text-[#F4F4F4]">
                            Học thông minh
                        </span>
                    </Link>

                    {/* Mobile Nav Toggle */}
                    <button
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        aria-controls="navbar-sticky"
                        aria-expanded={isMobileNavOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Desktop Nav Links */}
                    <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                            <li><a href="#home" className="block py-2 px-3 text-[#F4F4F4] rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-[#06D6A0] md:p-0 transition-colors duration-200 group relative">
                                Trang chủ
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#06D6A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </a></li>
                            <li><a href="#features" className="block py-2 px-3 text-[#F4F4F4] rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-[#06D6A0] md:p-0 transition-colors duration-200 group relative">
                                Tính năng
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#06D6A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </a></li>
                            <li><a href="#how-it-works" className="block py-2 px-3 text-[#F4F4F4] rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-[#06D6A0] md:p-0 transition-colors duration-200 group relative">
                                Lộ trình
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#06D6A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </a></li>
                            <li><a href="#testimonials" className="block py-2 px-3 text-[#F4F4F4] rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-[#06D6A0] md:p-0 transition-colors duration-200 group relative">
                                Đánh giá
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#06D6A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </a></li>
                            <li><a href="#contact" className="block py-2 px-3 text-[#F4F4F4] rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-[#06D6A0] md:p-0 transition-colors duration-200 group relative">
                                Liên hệ
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#06D6A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </a></li>
                        </ul>
                    </div>

                    {/* Desktop CTA Button */}
                    <div className="hidden md:flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        <Link href="/login"
                              className="text-[#1A1A2E] bg-[#06D6A0] hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors duration-200"
                        >
                            Bắt đầu miễn phí
                        </Link>
                    </div>
                </div>

                {/* Mobile Nav Content */}
                {isMobileNavOpen && (
                    <div className="md:hidden w-full bg-[#1A1A2E]/90 border-t border-gray-700/50 py-4 px-4">
                        <ul className="flex flex-col gap-3 font-medium">
                            <li><a href="#home" onClick={() => setIsMobileNavOpen(false)} className="block py-2 text-[#F4F4F4] rounded hover:bg-gray-700">Trang chủ</a></li>
                            <li><a href="#features" onClick={() => setIsMobileNavOpen(false)} className="block py-2 text-[#F4F4F4] rounded hover:bg-gray-700">Tính năng</a></li>
                            <li><a href="#how-it-works" onClick={() => setIsMobileNavOpen(false)} className="block py-2 text-[#F4F4F4] rounded hover:bg-gray-700">Lộ trình</a></li>
                            <li><a href="#testimonials" onClick={() => setIsMobileNavOpen(false)} className="block py-2 text-[#F4F4F4] rounded hover:bg-gray-700">Đánh giá</a></li>
                            <li><a href="#contact" onClick={() => setIsMobileNavOpen(false)} className="block py-2 text-[#F4F4F4] rounded hover:bg-gray-700">Liên hệ</a></li>
                            <li>
                                <Link href="/login" onClick={() => setIsMobileNavOpen(false)} className="block w-full text-center text-[#1A1A2E] bg-[#06D6A0] hover:bg-yellow-500 font-medium rounded-lg text-sm px-4 py-2 mt-2 transition-colors duration-200">
                                    Bắt đầu miễn phí
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative flex items-center justify-center min-h-screen py-20 md:py-0">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 -z-10">
                    <Image
                        src="/background1.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" /> {/* overlay tối + làm mờ */}
                </div>

                {/* Content */}
                <div className="text-center text-white px-4 py-10 md:py-20 max-w-4xl mx-auto scroll-animate is-visible">
                    <h1 className="font-header text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-6 leading-tight drop-shadow-lg">
                        Khai phá <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] to-[#FFD166]">
                            Tiềm năng
                        </span> học tập cùng trí tuệ nhân tạo
                    </h1>
                    <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow">
                        Trải nghiệm phương pháp học cá nhân hóa, phù hợp với tốc độ và phong cách của bạn —
                        được hỗ trợ bởi công nghệ AI tiên tiến. Học thông minh là tương lai của việc chinh phục kỹ năng mới. 🧠✨
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/login"
                            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold shadow-md text-lg w-full sm:w-auto"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-black transition font-semibold shadow-md text-lg w-full sm:w-auto"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 md:py-24 bg-[#1A1A2E]/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16 scroll-animate is-visible">
                        <h2 className="font-header text-3xl sm:text-4xl font-bold text-[#F4F4F4] mb-4">
                            Vì sao <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] to-[#FFD166]">Học thông minh</span> khác biệt ✨
                        </h2>
                        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
                            Nền tảng ứng dụng trí tuệ nhân tạo để mang đến trải nghiệm học tập độc đáo và hiệu quả vượt trội.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Responsive grid */}
                        {/* Tính năng 1 */}
                        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-[#FF6B6B]/30 transition-all duration-300 transform hover:-translate-y-1 scroll-animate delay-100 is-visible">
                            <div className="inline-block p-3 bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] rounded-lg mb-4">
                                <BrainCog className="w-8 h-8 text-white" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-xl text-red-500 font-header font-semibold text-[#F4F4F4] mb-2">Lộ trình học cá nhân hóa</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Thuật toán AI xây dựng lộ trình học riêng phù hợp với kỹ năng, mục tiêu và tốc độ học của bạn.
                            </p>
                        </div>

                        {/* Tính năng 2 */}
                        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-[#FF6B6B]/30 transition-all duration-300 transform hover:-translate-y-1 scroll-animate delay-200 is-visible">
                            <div className="inline-block p-3 bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] rounded-lg mb-4">
                                <Zap className="w-8 h-8 text-white" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-xl text-red-500 font-header font-semibold text-[#F4F4F4] mb-2">Phản hồi tức thì</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Nhận phản hồi AI thông minh, mang tính xây dựng ngay lập tức để giúp bạn tiến bộ nhanh hơn.
                            </p>
                        </div>

                        {/* Tính năng 3 */}
                        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-[#FF6B6B]/30 transition-all duration-300 transform hover:-translate-y-1 scroll-animate delay-300 is-visible">
                            <div className="inline-block p-3 bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] rounded-lg mb-4">
                                <UsersRound className="w-8 h-8 text-white" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-xl text-red-500 font-header font-semibold text-[#F4F4F4] mb-2">AI Đồng hành 24/7</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Kết hợp hỗ trợ từ AI 24/7 để bạn luôn có người đồng hành trên hành trình học tập.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16 scroll-animate is-visible">
                        <h2 className="font-header text-3xl sm:text-4xl font-bold text-[#F4F4F4] mb-4">
                            Hành Trình Học Tập Cùng AI 🚀
                        </h2>
                        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
                            Một quy trình đơn giản, trực quan giúp bạn bắt đầu con đường học tập cá nhân hóa.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"> {/* Responsive grid */}
                        {/* Step 1 */}
                        <div className="scroll-animate delay-100 is-visible">
                            <div
                                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] text-[#F4F4F4] shadow-lg"
                                aria-label="Đăng ký và đặt mục tiêu">
                                <UserPlus className="w-9 h-9" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-2xl font-header text-[#F4F4F4] mb-2">1. Đăng ký & Đặt mục tiêu</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Cho chúng tôi biết mục tiêu học tập của bạn. Tham vọng của bạn chính là nhiên liệu để AI cá nhân hóa lộ trình.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="scroll-animate delay-200 is-visible">
                            <div
                                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] text-[#F4F4F4] shadow-lg"
                                aria-label="Đánh giá bằng AI">
                                <Lightbulb className="w-9 h-9" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-2xl font-header text-[#F4F4F4] mb-2">2. Đánh giá thông minh</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Hệ thống AI phân tích trình độ hiện tại để xây dựng chương trình học riêng cho bạn.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="scroll-animate delay-300 is-visible">
                            <div
                                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] text-[#F4F4F4] shadow-lg"
                                aria-label="Học tập theo lộ trình">
                                <Route className="w-9 h-9" /> {/* Use Lucide icon */}
                            </div>
                            <h3 className="text-2xl font-header text-[#F4F4F4] mb-2">3. Học tập & Chinh phục</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Bắt đầu lộ trình học tập được cá nhân hóa, theo dõi tiến độ và làm chủ kiến thức.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 md:py-24 bg-[#1A1A2E]/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16 scroll-animate is-visible">
                        <h2 className="font-header text-3xl sm:text-4xl font-bold text-[#F4F4F4] mb-4">
                            Học viên yêu thích Học thông minh ❤️
                        </h2>
                        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
                            Không chỉ là lời nói từ chúng tôi — hãy xem những gì học viên thực sự chia sẻ!
                        </p>
                    </div>

                    <div className="relative w-full scroll-animate delay-100 is-visible">
                        <div className="relative h-auto overflow-hidden rounded-lg min-h-[300px] flex items-center justify-center">
                            {/* Testimonial Slide */}
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={testimonial.id}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                        index === currentTestimonialIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 bg-gray-800/70 backdrop-blur-sm rounded-lg max-w-3xl mx-auto">
                                        <Image
                                            className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full object-cover shadow-md"
                                            src={testimonial.image}
                                            alt={`Ảnh người dùng ${testimonial.author}`}
                                            width={80}
                                            height={80}
                                            priority={index === currentTestimonialIndex} // Chỉ ưu tiên ảnh hiện tại
                                        />
                                        <p className="text-base md:text-lg italic text-gray-300 text-center mb-3">
                                            "{testimonial.quote}"
                                        </p>
                                        <h4 className="text-md font-semibold text-[#06D6A0]">{testimonial.author}</h4>
                                        <p className="text-sm text-gray-400">{testimonial.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Indicators (dots) */}
                        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`w-3 h-3 rounded-full ${
                                        index === currentTestimonialIndex ? 'bg-white' : 'bg-gray-400 hover:bg-white'
                                    }`}
                                    aria-current={index === currentTestimonialIndex ? 'true' : 'false'}
                                    aria-label={`Slide ${index + 1}`}
                                    onClick={() => handleDotClick(index)}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section id="contact" className="py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div
                        // Thay thế màu cụ thể
                        className="bg-gradient-to-r from-[#004D40] via-[#009688] via-[#FF6F61] to-[#FFC1B6]
 p-8 md:p-12 lg:p-16 rounded-xl shadow-2xl text-center scroll-animate is-visible">
                        <h2 className="font-header text-3xl sm:text-4xl font-bold text-[#F4F4F4] mb-4">
                            Sẵn sàng nâng tầm kỹ năng với AI? 🚀
                        </h2>
                        <p className="text-base md:text-lg text-gray-100 mb-8 max-w-xl mx-auto">
                            Hàng ngàn học viên đã bắt đầu hành trình học tập cùng AI. Bắt đầu lộ trình cá nhân hóa của bạn ngay hôm nay!
                        </p>
                        <Link href={'/login'}
                              className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium text-center text-[#1A1A2E] bg-[#06D6A0] rounded-lg hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 transition-all duration-200 transform hover:scale-105 shadow-lg">
                            Bắt đầu miễn phí
                            <Rocket className="w-5 h-5 ml-2" /> {/* Use Lucide icon */}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
                    {/* Logo and Tagline */}
                    <div className="flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 className="text-[#06D6A0] h-6 w-6">
                                <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V12h9V6.5A4.5 4.5 0 0 0 12 2Z"></path>
                                <circle cx="12" cy="12" r="2"></circle>
                                <path d="M12 12v2.5a4.5 4.5 0 1 1-4.5 4.5V19a4.5 4.5 0 0 0 4.5-4.5Z"></path>
                                <path d="M12 12h4.5a4.5 4.5 0 1 1-4.5 4.5V19a4.5 4.5 0 0 1 4.5-4.5Z"></path>
                            </svg>
                            <span className="self-center text-xl font-header font-semibold whitespace-nowrap text-[#F4F4F4]">
                                AI Learn
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 mt-2">Tương lai của giáo dục cá nhân hóa.</p>
                    </div>

                    {/* Copyright and Legal Links */}
                    <div className="text-sm text-gray-400 text-center">
                        © {new Date().getFullYear()} Học thông minh. Đã đăng ký bản quyền. <br className="sm:hidden" />
                        <div className="mt-2 flex justify-center md:justify-center gap-4"> {/* Responsive gap */}
                            <Link href="#" className="hover:text-[#06D6A0] transition-colors duration-200">Chính sách bảo mật</Link>
                            <span className="text-gray-500">|</span>
                            <Link href="#" className="hover:text-[#06D6A0] transition-colors duration-200">Điều khoản sử dụng</Link>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex justify-center md:justify-end space-x-4 md:space-x-5 rtl:space-x-reverse"> {/* Responsive spacing */}
                        <a href="#" className="text-gray-400 hover:text-[#06D6A0] transition-colors duration-200" aria-label="Twitter">
                            <Twitter className="w-5 h-5" /> {/* Use Lucide icon */}
                        </a>
                        <a href="#" className="text-gray-400 hover:text-[#06D6A0] transition-colors duration-200" aria-label="GitHub">
                            <Github className="w-5 h-5" /> {/* Use Lucide icon */}
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}