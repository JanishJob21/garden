import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleSignIn = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This function will be called when the Google Sign-In button is clicked
    const handleGoogleSignIn = async (response) => {
      try {
        await googleLogin(response.credential);
        navigate('/dashboard');
      } catch (error) {
        console.error('Google login failed:', error);
        alert('Google login failed. Please try again.');
      }
    };

    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 250,
          }
        );

        // Also show the One Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    // Add a small delay to ensure the Google API is loaded
    const timer = setTimeout(() => {
      initializeGoogleSignIn();
    }, 1000);

    // Cleanup function
    return () => clearTimeout(timer);
  }, [googleLogin, navigate]);

  return (
    <div className="google-signin-container">
      <div id="googleSignInDiv"></div>
    </div>
  );
};

export default GoogleSignIn;
