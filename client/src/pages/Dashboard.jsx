import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'scheduled', 'cancelled', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

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
      const res = await axios.get(
        'http://localhost:5000/api/appointments/getAppointments',
        { withCredentials: true }
      );
      setAppointments(res.data);
    } catch {
      console.log('Could not fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      navigate('/login');
    } catch {
      console.log('Logout failed');
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/cancel/${id}`,
        {},
        { withCredentials: true }
      );
      fetchAppointments();
    } catch (err) {
      console.log('Cancel failed:', err.response?.data?.message || err.message);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Do you want to delete this cancelled appointment?')) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/deleteAppointment/${id}`,
        { withCredentials: true }
      );
      fetchAppointments();
    } catch (err) {
      console.log('Delete failed:', err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(
    (a) =>
      a.userId === user?._id &&
      a.date === selectedDate &&
      (statusFilter === 'all' || a.status === statusFilter) &&
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-8 relative font-[Poppins]">
      {/* User greeting & logout */}
      {user && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-10 z-20">
          <div
            className="cursor-pointer font-semibold text-blue-800 bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow hover:bg-blue-100 transition flex items-center"
            onClick={() => setShowLogout(!showLogout)}
          >
            <span className="truncate max-w-[120px] sm:max-w-xs">Hi, {user.name}</span>
            <span className="ml-2">▼</span>
          </div>
          {showLogout && (
            <div
              onClick={logout}
              className="mt-2 px-5 py-2 bg-white border border-red-200 rounded shadow text-red-600 hover:bg-red-50 cursor-pointer transition text-center"
            >
              Logout
            </div>
          )}
        </div>
      )}

      <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-blue-800 mb-6 sm:mb-10 drop-shadow">
        Your Dashboard
      </h1>

      {/* Date Picker */}
      <div className="max-w-md mx-auto mb-6 text-center">
        <label className="block font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {['all', 'scheduled', 'cancelled', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-700 border-blue-300'
            } hover:bg-blue-100 transition`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by Doctor Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Appointments Grid */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="grid gap-4 sm:gap-6 max-w-3xl mx-auto grid-cols-1 md:grid-cols-2">
          {filteredAppointments.map((a) => (
            <div
              key={a._id}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition relative"
            >
              {/* Delete button for cancelled */}
              {a.status === 'cancelled' && (
                <button
                  onClick={() => deleteAppointment(a._id)}
                  className="absolute top-2 right-4 text-red-500 hover:bg-red-100 rounded-full transition"
                  title="Delete Appointment"
                >
                  <Trash2 size={20} />
                </button>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 truncate">
                    Dr. {a.doctorName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      a.status === 'cancelled'
                        ? 'bg-red-100 text-red-600'
                        : a.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-1">
                  <span>
                    <span className="font-medium">Date:</span> {a.date}
                  </span>
                  <span className="hidden sm:inline">|</span>
                  <span>
                    <span className="font-medium">Booking Time:</span> {a.time}
                  </span>
                </div>

                {a.reason && (
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    <span className="font-medium">Reason:</span> {a.reason}
                  </p>
                )}

                {a.token && (
                  <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">
                    Token Number: {a.token}
                  </p>
                )}

                {a.reportingTime && (
                  <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">
                    Reporting Time: {a.reportingTime}
                  </p>
                )}
              </div>

              {/* Cancel Button */}
              {a.status === 'scheduled' && (
                <button
                  onClick={() => cancelAppointment(a._id)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-full font-semibold shadow hover:from-red-600 hover:to-red-700 transition w-full"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No appointments */}
      {!loading && filteredAppointments.length === 0 && (
        <div className="text-center text-gray-500 mt-20 text-base sm:text-lg">
          No appointments found for the selected filters.
        </div>
      )}
    </div>
  );
}
