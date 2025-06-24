import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-xl font-bold">Appointo</span>
        <div className="space-x-4">
          <a href="#" className="hover:underline">Login</a>
          <a href="#" className="hover:underline">Signup</a>
          <Link to="/appointment" className="hover:underline">Book Appointment</Link>
        </div>
      </div>
    </nav>
  );
}
