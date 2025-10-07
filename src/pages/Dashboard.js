import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2>Welcome, {user?.name}! <RoleBadge role={user.role} /></h2>
      
      {/* Member-specific content */}
      {user.role === 'Member' && (
        <>
          <p>Use the forms below to complete the workflow:</p>
          <ol className="steps">
            <li><Link to="/form/register">Member Registration</Link></li>
            <li><Link to="/form/booking">Plot Booking</Link></li>
            <li><Link to="/form/confirm-tools">Confirmation & Tools</Link></li>
            <li><Link to="/form/feedback">Feedback & Maintenance</Link></li>
          </ol>
        </>
      )}

      {/* Manager-specific content */}
      {user.role === 'Manager' && (
        <div>
          <p>Manager Dashboard - Quick Actions:</p>
          <div className="grid">
            <Link className="tile" to="/manager/users">Manage Users</Link>
            <Link className="tile" to="/manager/plots">Manage Plots</Link>
          </div>
        </div>
      )}

      {/* Admin-specific content */}
      {user.role === 'Admin' && (
        <div className="grid">
          <Link className="tile" to="/admin/sessions">Manage Sessions</Link>
          <Link className="tile" to="/users">User Management</Link>
        </div>
      )}
    </div>
  );
}
