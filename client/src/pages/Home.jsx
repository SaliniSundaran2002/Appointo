import { Link } from "react-router-dom";
import bg from "../assets/bg-hospital.jpeg"
export default function Home() {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundBlendMode: "overlay",
                background: "linear-gradient(135deg, #e0f7fa99 0%, #80deea99 50%, #00bcd499 100%), url(" + bg + ")",
            }}
        >
            <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl text-center max-w-xl p-10 pt-28 relative">
                {/* Logo */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <img
                        src="/logo192.png"
                        alt="Hospital Appointo Logo"
                        className="w-24 h-24 rounded-full shadow-lg border-4 border-white bg-white object-contain"
                    />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-800 mb-4 drop-shadow">
                    Welcome to Hospital Appointo
                </h1>
                <p className="text-lg text-cyan-700 mb-6 font-medium">
                    Book your hospital appointments, view doctors, and manage your medical visits with ease and confidence.
                </p>
                <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent text-lg font-semibold italic px-4 py-2 rounded">
                        "Positive Mind, Healthy Life, Caring Hands"
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/login"
                        className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white px-8 py-2 rounded shadow hover:from-cyan-700 hover:to-teal-600 transition font-semibold"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="border-2 border-cyan-600 text-cyan-700 px-8 py-2 rounded shadow hover:bg-cyan-600 hover:text-white transition font-semibold"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
