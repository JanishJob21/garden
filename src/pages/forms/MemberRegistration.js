import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormRow from '../../components/FormRow';
// Import useAuth hook from AuthContext
import { useAuth } from '../../context/AuthContext';

// Fallback auth data
const fallbackAuth = {
  user: {
    name: '',
    email: ''
  }
};

// Safe auth hook that won't throw if useAuth is not available
const useSafeAuth = () => {
  try {
    // Try to use the useAuth hook
    const auth = useAuth();
    return auth || fallbackAuth;
  } catch (error) {
    console.warn('useAuth not available, using fallback auth', error);
    return fallbackAuth;
  }
};

export default function MemberRegistration() {
  const { user } = useSafeAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    age: '',
    gender: 'Prefer not to say',
    experience: 'Beginner',
    preferredTime: 'Morning',
    emergencyName: '',
    emergencyPhone: '',
    consent: false,
    newsletter: true,
    idProofUrl: '',
    gardenRulesAccepted: false,
    toolsTraining: 'No',
    disabilitySupport: 'No',
    notes: ''
  });

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('memberRegistrationForm');
      if (savedForm) {
        setFormData(JSON.parse(savedForm));
      } else if (user) {
        // Initialize with user data if available
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || ''
        }));
      }
    } catch (e) {
      console.error('Failed to load saved form data:', e);
    }
    setIsLoading(false);
  }, [user]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('memberRegistrationForm', JSON.stringify(formData));
    } catch (e) {
      console.error('Failed to save form data:', e);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.consent || !formData.gardenRulesAccepted) {
      setError('Please accept the terms and conditions and garden rules');
      return;
    }

    // Test backend connection first
    try {
      const testResponse = await fetch('http://localhost:5000/api/test');
      if (!testResponse.ok) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setError('Cannot connect to the server. Please make sure the backend is running.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare the member data according to the backend model
      const memberData = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode
        },
        dateOfBirth: formData.age ? new Date().getFullYear() - parseInt(formData.age) + '-01-01' : null,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: 'Emergency Contact' // Default value
        },
        membershipType: 'individual', // Default value
        status: 'pending',
        skills: [formData.experience],
        notes: formData.notes || '',
        disabilitySupport: formData.disabilitySupport === 'Yes',
        gardenRulesAccepted: formData.gardenRulesAccepted,
        consent: formData.consent,
        newsletter: formData.newsletter
      };

      console.log('Sending data to server:', memberData);

      // Call the API
      const response = await fetch('http://localhost:5000/api/members/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Clear the form and localStorage on success
      localStorage.removeItem('memberRegistrationForm');
      setFormData({});
      setSuccess(true);
      
      // Redirect to booking page after a short delay
      setTimeout(() => {
        navigate('/book-plot');
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const defaultValues = {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      age: '',
      gender: 'Prefer not to say',
      experience: 'Beginner',
      preferredTime: 'Morning',
      emergencyName: '',
      emergencyPhone: '',
      consent: false,
      newsletter: true,
      idProofUrl: '',
      gardenRulesAccepted: false,
      toolsTraining: 'No',
      disabilitySupport: 'No',
      notes: ''
    };
    
    setFormData(defaultValues);
    localStorage.setItem('memberRegistrationForm', JSON.stringify(defaultValues));
  };

  if (isLoading) {
    return <div className="card">Loading...</div>;
  }

  if (success) {
    return (
      <div className="card">
        <div className="success-message">
          <h2>Registration Successful!</h2>
          <p>Your registration has been submitted successfully.</p>
          <p>Redirecting to plot booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Member Registration</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormRow label="Full Name" required>
            <input 
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormRow>
          
          <FormRow label="Email" required>
            <input 
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormRow>
          
          <FormRow label="Phone Number" required>
            <input 
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormRow>
          
          <FormRow label="Address" required>
            <textarea 
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </FormRow>
          
          <div className="row">
            <div className="col-md-4">
              <FormRow label="City" required>
                <input 
                  type="text"
                  className="form-control"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </FormRow>
            </div>
            <div className="col-md-4">
              <FormRow label="State" required>
                <input 
                  type="text"
                  className="form-control"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </FormRow>
            </div>
            <div className="col-md-4">
              <FormRow label="Postal Code" required>
                <input 
                  type="text"
                  className="form-control"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </FormRow>
            </div>
          </div>
          
          <FormRow label="Age">
            <input 
              type="number"
              className="form-control"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="100"
            />
          </FormRow>
          
          <FormRow label="Gender">
            <select 
              className="form-select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </FormRow>
          
          <FormRow label="Gardening Experience">
            <select 
              className="form-select"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </FormRow>
          
          <FormRow label="Preferred Gardening Time">
            <select 
              className="form-select"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Weekends">Weekends</option>
            </select>
          </FormRow>
          
          <h4>Emergency Contact</h4>
          
          <FormRow label="Name" required>
            <input 
              type="text"
              className="form-control"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              required
            />
          </FormRow>
          
          <FormRow label="Phone Number" required>
            <input 
              type="tel"
              className="form-control"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              required
            />
          </FormRow>
          
          <div className="form-group mb-3">
            <label className="form-label">Do you need tools training?</label>
            <div className="form-check">
              <input 
                className="form-check-input"
                type="radio" 
                name="toolsTraining" 
                id="toolsTrainingYes"
                value="Yes" 
                checked={formData.toolsTraining === 'Yes'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="toolsTrainingYes">
                Yes
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input"
                type="radio" 
                name="toolsTraining" 
                id="toolsTrainingNo"
                value="No" 
                checked={formData.toolsTraining === 'No'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="toolsTrainingNo">
                No
              </label>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label className="form-label">Do you require any disability support?</label>
            <div className="form-check">
              <input 
                className="form-check-input"
                type="radio" 
                name="disabilitySupport" 
                id="disabilitySupportYes"
                value="Yes" 
                checked={formData.disabilitySupport === 'Yes'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="disabilitySupportYes">
                Yes
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input"
                type="radio" 
                name="disabilitySupport" 
                id="disabilitySupportNo"
                value="No" 
                checked={formData.disabilitySupport === 'No'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="disabilitySupportNo">
                No
              </label>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label className="form-label">Additional Notes</label>
            <textarea 
              className="form-control"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional information or special requirements..."
            />
          </div>
          
          <div className="form-group mb-3">
            <div className="form-check">
              <input 
                className="form-check-input"
                type="checkbox" 
                id="consent"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                required
              />
              <label className="form-check-label" htmlFor="consent">
                I consent to the processing of my personal data
              </label>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <div className="form-check">
              <input 
                className="form-check-input"
                type="checkbox" 
                id="gardenRulesAccepted"
                name="gardenRulesAccepted"
                checked={formData.gardenRulesAccepted}
                onChange={handleChange}
                required
              />
              <label className="form-check-label" htmlFor="gardenRulesAccepted">
                I accept the garden rules and regulations
              </label>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <div className="form-check">
              <input 
                className="form-check-input"
                type="checkbox" 
                id="newsletter"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="newsletter">
                Subscribe to our newsletter
              </label>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
