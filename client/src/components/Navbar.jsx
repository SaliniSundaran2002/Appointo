import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  const navLinkClass = (path) =>
    `hover:text-blue-200 transition ${isActive(path) ? "underline underline-offset-4" : ""}`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white px-6 py-4 shadow-md font-[Poppins] z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-wide">Appointo</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center text-sm font-medium">
          <Link to="/login" className={navLinkClass("/login")}>Login</Link>
          <Link to="/signup" className={navLinkClass("/signup")}>Signup</Link>
          <Link to="/appointment" className={navLinkClass("/appointment")}>Book</Link>
          <Link to="/dashboard" className={navLinkClass("/dashboard")}>Dashboard</Link>
          <Link to="/admin/doctors" className={navLinkClass("/dashboard")}>Admin Add Doctors</Link>
          <Link to="/" className={navLinkClass("/dashboard")}>Home</Link>
          {user && (
            <>
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden focus:outline-none">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 bg-blue-700 text-white px-6 py-4 rounded shadow space-y-3">
          <Link to="/login" onClick={() => setMenuOpen(false)} className={navLinkClass("/login")}>Login</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className={navLinkClass("/signup")}>Signup</Link>
          <Link to="/appointment" onClick={() => setMenuOpen(false)} className={navLinkClass("/appointment")}>Book Appointment</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass("/dashboard")}>Home</Link>

          {user && (
            <>
              <div className="mt-2 text-sm text-blue-100">
                👤 <span className="font-semibold">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="mt-2 w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
