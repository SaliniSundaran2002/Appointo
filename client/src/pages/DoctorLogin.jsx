// DoctorLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DoctorLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/doctor/login', form, {
        withCredentials: true,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-cyan-200 flex justify-center items-center font-[Poppins] px-4 pt-10">
      <div className="bg-white/80 backdrop-blur-xl border border-cyan-200 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo192.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full shadow border-4 border-white bg-white" />
          <h2 className="text-3xl font-extrabold text-cyan-800 mt-4 drop-shadow">Doctor Login</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 text-sm text-center font-medium mb-4">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition shadow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
