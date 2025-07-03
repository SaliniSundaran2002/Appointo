import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import AppointmentForm from './pages/AppointmentForm';
import History from './pages/History';
import AdminDoctors from './pages/AdminDoctors';
import DoctorLogin from './pages/DoctorLogin';
import NotFound from './pages/NotFound';

function AppContent() {
  const location = useLocation();
  const noNavbarPaths = ['/', '/login', '/signup', '/doctor/login'];
  const showNavbar = !noNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/appointment" element={<AppointmentForm />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
