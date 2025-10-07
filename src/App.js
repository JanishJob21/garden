import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Users from './pages/admin/Users';
import Sessions from './pages/admin/Sessions';
import MyBookings from './pages/me/MyBookings';

// Manager pages
import ManageUsers from './pages/manager/Users';
import ManagePlots from './pages/manager/Plots';


function App() {
  return (
    <div className="App">
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['Admin','Manager','Member']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Forms */}
            <Route path="/form/register" element={<MemberRegistration />} />
            <Route path="/form/booking" element={<PlotBooking />} />
            <Route path="/form/confirm-tools" element={<ConfirmationTools />} />
            <Route path="/form/feedback" element={<FeedbackMaintenance />} />

            {/* Role-specific */}
            <Route element={<ProtectedRoute roles={['Manager','Admin']} />}>
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
            <Route element={<ProtectedRoute roles={['Member','Manager','Admin']} />}>
              <Route path="/my-bookings" element={<MyBookings />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
