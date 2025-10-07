import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const { googleLogin, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Clear any previous errors when component mounts
    setError('');

    const handleGoogleSignIn = async (response) => {
      setIsLoading(true);
      setError('');
      
      if (!response || !response.credential) {
        const errorMsg = 'Failed to authenticate with Google. Please try again.';
        setError(errorMsg);
        setIsLoading(false);
        console.error('Google sign-in error: No credential in response');
        return;
      }

      try {
        const user = await googleLogin(response.credential);
        console.log('Google login successful:', user);
        
        // Redirect based on user role
        const redirectPath = user.role.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
        
      } catch (error) {
        console.error('Google login failed:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to sign in with Google. Please try again.';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || !window.google.accounts) {
        console.error('Google API not loaded');
        setError('Failed to load Google Sign-In. Please refresh the page.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          ux_mode: 'popup',
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 250,
            logo_alignment: 'center',
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        setError('Failed to initialize Google Sign-In. Please try again.');
      }
    };

    // Load Google API script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        setError('Failed to load Google Sign-In. Please check your connection.');
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeGoogleSignIn();
    }
  }, [googleLogin, isAuthenticated, navigate]);

  return (
    <div style={{ textAlign: 'center' }}>
      {isLoading && <p>Signing in...</p>}
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      <div id="googleSignInDiv" style={{ margin: '10px 0' }} />
    </div>
  );
};

export default GoogleLoginButton;