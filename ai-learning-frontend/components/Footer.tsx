export default function Footer() {
    return (
        <footer className="bg-gray-100 py-4 mt-10">
            <div className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} AI Learning. All rights reserved.
            </div>
        </footer>
    );
}
