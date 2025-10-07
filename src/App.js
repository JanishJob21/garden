import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';

// Forms
import MemberRegistration from './pages/forms/MemberRegistration';
import PlotBooking from './pages/forms/PlotBooking';
import ConfirmationTools from './pages/forms/ConfirmationTools';
import FeedbackMaintenance from './pages/forms/FeedbackMaintenance';

// Role pages
import Approvals from './pages/manager/Approvals';
import Sessions from './pages/admin/Sessions';
import MyBookings from './pages/me/MyBookings';
import Users from './pages/admin/Users';

// Manager pages
import ManageUsers from './pages/manager/Users';
import ManagePlots from './pages/manager/Plots';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/member-registration" element={<MemberRegistration />} />
              <Route path="/book-plot" element={<PlotBooking />} />
              <Route path="/tools" element={<ConfirmationTools />} />
              <Route path="/feedback" element={<FeedbackMaintenance />} />
              
              <Route element={<ProtectedRoute roles={['Manager', 'Admin']} />}>
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/manager/users" element={<ManageUsers />} />
                <Route path="/manager/plots" element={<ManagePlots />} />
              </Route>
              
              <Route element={<ProtectedRoute roles={['Admin']} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/sessions" element={<Sessions />} />
              </Route>
              
              <Route path="/my-bookings" element={<MyBookings />} />
            </Route>
          </Routes>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;