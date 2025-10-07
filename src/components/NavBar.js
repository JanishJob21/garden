import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <nav className="nav">
      <Link className="brand" to="/home">Garden Scheduler</Link>
      {user ? (
        <>
          <div className="nav-links">
            {/* Member user-facing links */}
            {user.role === 'Member' && (
              <>
                <NavLink to="/form/register">Register</NavLink>
                <NavLink to="/form/booking">Book Plot</NavLink>
                <NavLink to="/form/confirm-tools">Tools</NavLink>
                <NavLink to="/form/feedback">Feedback</NavLink>
                <NavLink to="/my-bookings">My Bookings</NavLink>
              </>
            )}
            {/* Manager-specific links */}
            {user.role === 'Manager' && (
              <>
                <NavLink to="/manager">Manager Dashboard</NavLink>
                <NavLink to="/manager/users">Manage Users</NavLink>
                <NavLink to="/manager/plots">Manage Plots</NavLink>
              </>
            )}
            
            {/* Admin-only simplified links */}
            {user.role === 'Admin' && (
              <>
                <NavLink to="/admin/sessions">Sessions</NavLink>
                <NavLink to="/users">Users</NavLink>
              </>
            )}
          </div>
          
          <div className="nav-right">
            <span className="user-name">{user.name} <span className="role-text">({user.role})</span></span>
            <button
              className="btn"
              onClick={() => {
                logout();
                navigate('/home');
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="nav-links">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/signup">Signup</NavLink>
        </div>
      )}
    </nav>
  );
}
