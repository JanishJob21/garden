import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormRow from '../../components/FormRow';

const BookPlot = () => {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [plot, setPlot] = useState(null);
  
  const [formData, setFormData] = useState({
    plotId: plotId || '',
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    duration: 1,
    paymentMethod: 'credit_card',
    specialRequests: ''
  });

  // Load plot details if plotId is provided
  useEffect(() => {
    if (plotId) {
      // In a real app, you would fetch the plot details here
      // For now, we'll just set a dummy plot
      setPlot({
        _id: plotId,
        plotNumber: 'A-101',
        size: 100,
        pricePerMonth: 50,
        location: 'Section A',
        features: ['Sunny', 'Near water source']
      });
      
      // Set the plotId in the form data
      setFormData(prev => ({
        ...prev,
        plotId
      }));
    }
  }, [plotId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/plots/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book plot');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        plotId: plotId || '',
        fullName: '',
        email: '',
        phone: '',
        startDate: '',
        duration: 1,
        paymentMethod: 'credit_card',
        specialRequests: ''
      });

      // Redirect to success page or show success message
      setTimeout(() => {
        navigate('/booking-success', { state: { bookingId: data.bookingId } });
      }, 2000);

    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book plot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price
  const totalPrice = plot ? plot.pricePerMonth * formData.duration : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Book a Garden Plot</h1>
      
      {plot && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Plot Details</h2>
          <p><span className="font-medium">Plot Number:</span> {plot.plotNumber}</p>
          <p><span className="font-medium">Size:</span> {plot.size} sq.m</p>
          <p><span className="font-medium">Price per month:</span> ${plot.pricePerMonth}</p>
          <p><span className="font-medium">Location:</span> {plot.location}</p>
          <p><span className="font-medium">Features:</span> {plot.features.join(', ')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Booking submitted successfully! Redirecting...
          </div>
        )}

        {!plotId && (
          <FormRow
            type="text"
            name="plotId"
            label="Plot ID"
            value={formData.plotId}
            onChange={handleChange}
            required
          />
        )}

        <FormRow
          type="text"
          name="fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <FormRow
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormRow
          type="tel"
          name="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <FormRow
          type="date"
          name="startDate"
          label="Start Date"
          value={formData.startDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <FormRow
          type="number"
          name="duration"
          label="Duration (months)"
          value={formData.duration}
          onChange={(e) => {
            const value = Math.max(1, parseInt(e.target.value) || 1);
            setFormData(prev => ({
              ...prev,
              duration: value
            }));
          }}
          min="1"
          required
        />

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialRequests">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Booking Summary</h3>
          <p>Plot: {plot?.plotNumber || 'Not selected'}</p>
          <p>Duration: {formData.duration} month{formData.duration !== 1 ? 's' : ''}</p>
          <p className="font-bold mt-2">Total: ${totalPrice}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Book Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookPlot;
