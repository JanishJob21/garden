import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersList } from '../../services/api';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersList();
      
      if (response && Array.isArray(response.users)) {
        // Filter out the current user from the list
        const filteredUsers = response.users.filter(user => user._id !== currentUser?._id);
        setUsers(filteredUsers);
      } else {
        setError('No user data available or unexpected response format');
      }
    } catch (err) {
      // Handle errors from our enhanced API client
      if (err.response) {
        const { status, data } = err.response;
        if (status === 403) {
          setError(data.message || 'You do not have permission to view users.');
        } else if (status === 401) {
          setError('Your session has expired. Please log in again.');
          // Optionally redirect to login
          // navigate('/login', { replace: true });
        } else {
          setError(data.message || `Error: ${status} - ${data.statusText || 'Unknown error'}`);
        }
      } else if (err.isNetworkError) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Manage Users
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          View and manage all registered users in the system
        </p>
      </div>

      {error ? (
        <div className="error-message" style={{
          background: '#fef3f2',
          color: '#b91c1c',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem auto',
          maxWidth: '600px',
          textAlign: 'center',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Unable to load users
          </div>
          <p style={{ 
            marginBottom: '1.5rem',
            color: '#7f1d1d',
            lineHeight: '1.5'
          }}>
            {error}
          </p>
          <button
            onClick={fetchUsers}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9375rem',
              transition: 'all 0.2s ease-in-out',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      ) : null}

      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Loading users...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tableCellStyle}>{user.name || '-'}</td>
                    <td style={tableCellStyle}>{user.email || '-'}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        background: user.role === 'Admin' ? '#dbeafe' : user.role === 'Manager' ? '#d1fae5' : '#f3f4f6',
                        color: user.role === 'Admin' ? '#1e40af' : user.role === 'Manager' ? '#065f46' : '#4b5563',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        color: !user.status || user.status === 'active' ? '#065f46' : '#991b1b',
                        background: !user.status || user.status === 'active' ? '#d1fae5' : '#fee2e2',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <button 
                        style={{
                          background: '#f3f4f6',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                        onClick={() => {
                          // TODO: Implement edit functionality
                          console.log('Edit user:', user._id);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="5" 
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: '600',
  color: '#4b5563',
  borderBottom: '1px solid #e5e7eb',
};

const tableCellStyle = {
  padding: '1rem',
  color: '#1f2937',
  borderBottom: '1px solid #e5e7eb',
};
