import React, { useState, useEffect, useCallback } from 'react';
import { bookingsList, updateBookingStatus } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManagePlots() {
  const [plots, setPlots] = useState([]);
  const [allPlots, setAllPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPlots = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching plots...');
      const response = await bookingsList();
      console.log('API Response:', response);
      
      if (!response || !response.bookings) {
        console.error('No bookings data in response');
        setAllPlots([]);
        setPlots([]);
        return;
      }
      
      // Transform bookings into plot-like objects for display
      const plotData = response.bookings.map((booking, index) => {
        const plot = {
          _id: booking._id || `temp-${index}`,
          plotNumber: booking.plotNumber || `Plot ${index + 1}`,
          size: 'Standard', // Default size
          status: (booking.status || 'pending').toLowerCase(), // Ensure lowercase status
          assignedTo: booking.user ? { 
            name: booking.user.name || 'Unknown User',
            email: booking.user.email
          } : null,
          lastMaintained: booking.updatedAt || new Date().toISOString(),
          requestDate: booking.createdAt
        };
        console.log('Processed plot:', plot);
        return plot;
      });
      
      console.log('All plots:', plotData);
      setAllPlots(plotData);
      setPlots(plotData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch plot data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching plot data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply status filter when it changes
  useEffect(() => {
    if (statusFilter) {
      const filtered = allPlots.filter(plot => 
        plot.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setPlots(filtered);
    } else {
      setPlots(allPlots);
    }
  }, [statusFilter, allPlots]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      console.log(`Updating status for plot ${id} to ${newStatus}`);
      setUpdatingId(id);
      
      // Ensure status is lowercase to match backend expectations
      const status = newStatus.toLowerCase();
      
      const response = await updateBookingStatus(id, status);
      console.log('Update response:', response);
      
      if (response && response.success) {
        // Update local state optimistically
        setPlots(prevPlots => 
          prevPlots.map(plot => 
            plot._id === id 
              ? { 
                  ...plot, 
                  status: status,
                  lastMaintained: new Date().toISOString()
                } 
              : plot
          )
        );
        
        toast.success(`Plot ${status} successfully`);
      } else {
        throw new Error(response?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error in handleStatusUpdate:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         `Failed to update plot status. Please try again.`;
      
      toast.error(errorMessage);
      
      // Re-fetch to ensure consistency
      try {
        await fetchPlots();
      } catch (fetchError) {
        console.error('Error refetching plots:', fetchError);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Manage Plots
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          View and manage all garden plots in the system
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <input
              type="text"
              placeholder="Search plots..."
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                width: '300px',
              }}
            />
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <select
                style={{
                  width: '100%',
                  padding: '0.5rem 2.5rem 0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  background: 'white',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending" style={{ color: '#9a3412', backgroundColor: '#fff7ed' }}>Pending</option>
                <option value="approved" style={{ color: '#166534', backgroundColor: '#f0fdf4' }}>Approved</option>
                <option value="rejected" style={{ color: '#991b1b', backgroundColor: '#fef2f2' }}>Rejected</option>
                <option value="available" style={{ color: '#065f46', backgroundColor: '#ecfdf5' }}>Available</option>
                <option value="occupied" style={{ color: '#92400e', backgroundColor: '#fffbeb' }}>Occupied</option>
                <option value="maintenance" style={{ color: '#1e40af', backgroundColor: '#eff6ff' }}>Maintenance</option>
              </select>
              <div style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#6b7280',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Loading plots...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={tableHeaderStyle}>Plot ID</th>
                  <th style={tableHeaderStyle}>Size (sq ft)</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Assigned To</th>
                  <th style={tableHeaderStyle}>Last Maintained</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plots.length > 0 ? (
                  plots.map((plot) => (
                    <tr key={plot._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tableCellStyle}>#{plot.plotNumber || plot._id.substring(0, 6)}</td>
                      <td style={tableCellStyle}>{plot.size || '-'}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          color: plot.status === 'available' ? '#065f46' : 
                                 plot.status === 'occupied' ? '#92400e' :
                                 plot.status === 'pending' ? '#9a3412' :
                                 plot.status === 'approved' ? '#166534' :
                                 plot.status === 'rejected' ? '#991b1b' : '#6b7280',
                          background: plot.status === 'available' ? '#d1fae5' : 
                                     plot.status === 'occupied' ? '#fef3c7' :
                                     plot.status === 'pending' ? '#ffedd5' :
                                     plot.status === 'approved' ? '#dcfce7' :
                                     plot.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          minWidth: '100px',
                          justifyContent: 'center'
                        }}>
                          {plot.status === 'pending' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {plot.status === 'approved' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {plot.status === 'rejected' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {plot.status || 'unknown'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {plot.assignedTo ? 
                          <span style={{ fontWeight: '500' }}>{plot.assignedTo.name || 'Unknown User'}</span> : 
                          '-'}
                      </td>
                      <td style={tableCellStyle}>
                        {plot.lastMaintained ? 
                          new Date(plot.lastMaintained).toLocaleDateString() : 
                          'Never'}
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {plot.status === 'pending' ? (
                            <>
                              <button 
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  border: '1px solid #bae6fd',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  opacity: updatingId === plot._id ? 0.7 : 1,
                                  pointerEvents: updatingId ? 'none' : 'auto',
                                }}
                                onClick={() => handleStatusUpdate(plot._id, 'approved')}
                                disabled={updatingId === plot._id}
                              >
                                {updatingId === plot._id ? 'Approving...' : 'Approve'}
                              </button>
                              <button 
                                style={{
                                  background: '#fef2f2',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  opacity: updatingId === plot._id ? 0.7 : 1,
                                  pointerEvents: updatingId ? 'none' : 'auto',
                                }}
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to reject this plot request?')) {
                                    handleStatusUpdate(plot._id, 'rejected');
                                  }
                                }}
                                disabled={updatingId === plot._id}
                              >
                                {updatingId === plot._id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                style={{
                                  background: '#f3f4f6',
                                  border: '1px solid #e5e7eb',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                                onClick={() => {
                                  // TODO: Implement view details functionality
                                  console.log('View plot:', plot._id);
                                }}
                              >
                                View
                              </button>
                              {plot.status === 'available' && (
                                <button 
                                  style={{
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to mark this plot for maintenance?')) {
                                      console.log('Mark for maintenance:', plot._id);
                                    }
                                  }}
                                >
                                  Maintenance
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="6" 
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No plots found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
