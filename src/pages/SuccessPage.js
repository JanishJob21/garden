import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const bookingId = state?.bookingId;

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-green-500 text-6xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for booking with us. Your booking has been received and is being processed.
        </p>
        
        {bookingId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">Booking Reference:</p>
            <p className="font-mono text-lg font-bold">{bookingId}</p>
            <p className="text-xs text-gray-500 mt-2">Please save this reference for future communication.</p>
          </div>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>You will receive a confirmation email shortly</li>
            <li>Our team will review your booking</li>
            <li>We'll contact you if we need any additional information</li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Return to Home
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          You will be automatically redirected to the home page in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;
