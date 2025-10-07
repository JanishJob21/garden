import { useEffect, useState } from 'react';
import { registrationsList, bookingsList, toolsList, feedbackList } from '../../services/api';

function TabBar({ tab, setTab }) {
  const tabs = ['Registrations', 'Bookings', 'Tools', 'Feedback'];
  return (
    <div className="tabs" style={{ margin: '1.5rem 0' }}>
      {tabs.map((t) => (
        <button
          key={t}
          className={`tab ${tab === t ? 'active' : ''}`}
          onClick={() => setTab(t)}
          style={{
            padding: '0.75rem 1.5rem',
            margin: '0 0.5rem 0 0',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            background: tab === t ? '#2563eb' : 'white',
            color: tab === t ? 'white' : '#1f2937',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  const [tab, setTab] = useState('Registrations');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErr('');
        if (tab === 'Registrations') {
          const { registrations } = await registrationsList();
          setData(registrations);
        } else if (tab === 'Bookings') {
          const { bookings } = await bookingsList();
          setData(bookings);
        } else if (tab === 'Tools') {
          const { tools } = await toolsList();
          setData(tools);
        } else if (tab === 'Feedback') {
          const { feedback } = await feedbackList();
          setData(feedback);
        }
      } catch (e) {
        setErr(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tab]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Manager Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Manage and monitor garden activities, bookings, and user feedback
        </p>
      </div>

      <TabBar tab={tab} setTab={setTab} />
      
      {err && (
        <div style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          {err}
        </div>
      )}

      <div className="table-wrap" style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Loading {tab.toLowerCase()}...
          </div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {data[0] ? (
                  Object.keys(data[0])
                    .filter((k) => k !== 'password' && k !== '__v')
                    .slice(0, 6)
                    .map((k) => (
                      <th 
                        key={k}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#4b5563',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))
                ) : (
                  <th style={{ padding: '1rem', textAlign: 'center' }}>No data available</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, i) => (
                  <tr 
                    key={row._id || i}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      '&:hover': { backgroundColor: '#f9fafb' },
                    }}
                  >
                    {Object.keys(row)
                      .filter((k) => k !== 'password' && k !== '__v')
                      .slice(0, 6)
                      .map((k) => (
                        <td 
                          key={k}
                          style={{
                            padding: '1rem',
                            color: '#1f2937',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          {String(row[k]) || '-'}
                        </td>
                      ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="10" 
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    No {tab.toLowerCase()} found
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
