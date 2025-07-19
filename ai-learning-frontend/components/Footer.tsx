export default function Footer() {
    return (
        <footer className="bg-gray-100 py-4 md:py-6 mt-10"> {/* Thêm padding cho desktop */}
            <div className="container mx-auto px-4 text-center text-sm text-gray-500"> {/* Thêm container và padding ngang */}
                © {new Date().getFullYear()} AI Learning. All rights reserved.
            </div>
        </footer>
    );
}