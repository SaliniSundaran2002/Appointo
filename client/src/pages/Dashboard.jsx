import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        withCredentials: true,
      });
      setUser(res.data);
    } catch {
      navigate('/login');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments', {
        withCredentials: true,
      });
      setAppointments(res.data);
    } catch {
      console.log('Could not fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch {
      console.log('Logout failed');
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {user && (
        <div className="absolute top-4 right-6">
          <div
            className="cursor-pointer font-semibold text-blue-700"
            onClick={() => setShowLogout(!showLogout)}
          >
            Hi, {user.name} v
          </div>
          {showLogout && (
            <div
              onClick={logout}
              className="mt-2 px-4 py-2 bg-white border rounded shadow text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Logout
            </div>
          )}
        </div>
      )}

      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        Your Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-600">No appointments found.</p>
      ) : (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white p-4 rounded-xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-blue-800">Dr. {a.doctorName}</h3>
              <p className="text-sm text-gray-600">Date: {a.date} | Time: {a.time}</p>
              {a.reason && <p className="text-sm text-gray-500">Reason: {a.reason}</p>}
              <p className={`text-sm mt-2 font-medium ${
                a.status === 'cancelled'
                  ? 'text-red-500'
                  : a.status === 'completed'
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                Status: {a.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
