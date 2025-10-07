import { useEffect, useState, useCallback } from 'react';
import { usersList, sessionsList, sessionsSummary } from '../../services/api';
import { 
  IconUsers as UsersIcon, 
  IconCalendar as CalendarIcon, 
  IconTools as ToolsIcon,
  IconRefresh as RefreshIcon
} from '../../components/Icons';

const MetricCard = ({ icon, title, value = 0, change, isIncrease }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-content">
      <div className="metric-title">{title}</div>
      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : '0'}
      </div>
      {change !== undefined && (
        <div className={`metric-change ${isIncrease ? 'increase' : 'decrease'}`}>
          {isIncrease ? '↑' : '↓'} {change}% from last month
        </div>
      )}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalSessions: 0,
    totalBookings: 0,
    totalTools: 0,
  });
  
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [users, sessions, summary] = await Promise.all([
        usersList(),
        sessionsList({ page: 1, pageSize: 100 }), // Get more sessions to ensure we see all recent activity
        sessionsSummary(),
      ]);
      
      // Get the current user from local storage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user from localStorage:', currentUser);
      
      const usersData = users.users || [];
      const sessionsData = sessions.items || [];
      const summaryData = summary || {};

      // Log detailed user and session info for debugging
      console.log('All users:', usersData);
      console.log('Current sessions:', sessionsData);

      // Calculate active sessions from the sessions data
      const activeSessionsCount = sessionsData.filter(s => s.status === 'Active').length;
      
      // Update metrics with fallback to 0 for all values
      setMetrics({
        totalUsers: usersData?.length || 0,
        activeSessions: activeSessionsCount,
        totalSessions: summaryData?.total || 0,
        totalBookings: 0, // You'll need to implement this if needed
        totalTools: 0,    // You'll need to implement this if needed
      });

      // Format recent sessions with proper user identification and status
      const formattedSessions = sessionsData.map(session => {
        try {
          // Get user details with proper fallbacks
          const userData = session.user || {};
          const userId = session.userId || userData._id || 'unknown';
          
          // Get user info with fallbacks
          const userEmail = (session.email || userData.email || '').toLowerCase();
          const userName = session.username || userData.name || userEmail.split('@')[0] || 'User';
          
          // Get role - prioritize session role, then user role, then check email for admin
          let role = 'member';
          if (userEmail.includes('admin') || userName.toLowerCase().includes('admin')) {
            role = 'admin';
          } else if (userEmail.includes('manager') || userName.toLowerCase().includes('manager')) {
            role = 'manager';
          } else if (userData.role) {
            role = userData.role;
          }
          
          // Ensure we have the most accurate status from the session
          const status = session.status || (session.logoutAt ? 'Logged Out' : 'Active');
          
          // Calculate session status and timestamps
          const loginTime = session.loginAt ? new Date(session.loginAt) : new Date(session.createdAt || new Date());
          const logoutTime = session.logoutAt ? new Date(session.logoutAt) : null;
          // Status is determined by the session status
          
          // Calculate duration in seconds
          const endTime = logoutTime || new Date();
          const durationSec = Math.floor((endTime - loginTime) / 1000);
          
          // Get the current user from localStorage for comparison
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const isCurrentUser = currentUser && (
            currentUser._id === userId || 
            currentUser.email?.toLowerCase() === userEmail
          );
          
          return {
            id: session._id || `session-${Math.random().toString(36).substr(2, 9)}`,
            username: userName,
            email: userEmail,
            role: role,
            loginAt: loginTime,
            logoutAt: logoutTime,
            durationSec: durationSec,
            status: status,
            isCurrentUser: isCurrentUser,
            rawData: session // Keep original data for debugging
          };
        } catch (error) {
          console.error('Error processing session:', error);
          return null;
        }
      });
      
      // Filter out any null values from failed session processing
      const validSessions = formattedSessions.filter(session => session !== null);
      setRecentSessions(validSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setRecentSessions([]);
    }
  }, []); // Removed unnecessary dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="flex items-center gap-4">
          <h1>Dashboard</h1>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
            title="Refresh data"
          >
            <svg 
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard 
          icon={<UsersIcon size={24} />} 
          title="Total Users" 
          value={metrics.totalUsers} 
        />
        <MetricCard 
          icon={<UsersIcon size={24} />} 
          title="Active Users" 
          value={metrics.activeSessions}
        />
        <MetricCard 
          icon={<CalendarIcon size={24} />} 
          title="Total Sessions" 
          value={metrics.totalSessions}
        />
        <MetricCard 
          icon={<ToolsIcon size={24} />} 
          title="Active Now" 
          value={metrics.activeSessions}
        />
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="section-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Recent Activity</h2>
          <button className="btn" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon size={16} style={{ marginRight: '8px' }} /> Refresh
          </button>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>User</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Email</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Login Time</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => {
                if (!session) return null;
                
                // Format date helper
                const formatDate = (date) => {
                  try {
                    if (!date) return '-';
                    const d = new Date(date);
                    return d.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch (e) {
                    console.error('Error formatting date:', date, e);
                    return '-';
                  }
                };

                return (
                  <tr key={session.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 24px' }}>{session.username}</td>
                    <td style={{ padding: '16px 24px' }}>{session.email}</td>
                    <td style={{ padding: '16px 24px' }}>{formatDate(session.loginAt)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: session.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                        color: session.status === 'Active' ? '#166534' : '#6b7280',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {session.status === 'Active' && (
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#16a34a',
                            animation: 'pulse 1.5s infinite'
                          }}></span>
                        )}
                        {session.status === 'Active' ? 'Active Now' : 'Logged Out'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentSessions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Sessions Overview</h2>
          <div className="time-filter">
            <button className="btn-text active">Today</button>
            <button className="btn-text">Week</button>
            <button className="btn-text">Month</button>
          </div>
        </div>
        <div className="sessions-chart">
          <div className="chart-placeholder">
            <p>Sessions chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
