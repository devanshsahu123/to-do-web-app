import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithEmail, registerWithEmail, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/to-do';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (isSignUp) {
        res = await registerWithEmail({
          email: email.trim(),
          password,
          name: name.trim(),
        });
      } else {
        res = await loginWithEmail({
          email: email.trim(),
          password,
        });
      }

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      setError('');
      await continueAsGuest();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Left Column: Sign up / Log in Form matching user screenshot */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 6, md: 8, lg: 12 },
          py: { xs: 5, md: 8 },
          maxWidth: { md: '560px' },
          width: '100%',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px' }}>
          {/* Header */}
          <Box sx={{ mb: 3.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#1F2937',
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              {isSignUp ? 'Sign up' : 'Log in'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Box
                component="span"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                sx={{
                  color: '#DC2626',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </Box>
            </Typography>
          </Box>

          {/* Social Continue Buttons */}
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon sx={{ color: '#EA4335' }} />}
              onClick={() => {
                setError('Please use the Email & Password form below to sign in or register.');
              }}
              sx={{
                borderColor: '#E5E7EB',
                color: '#1F2937',
                py: 1.1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.92rem',
                bgcolor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Continue with Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
              onClick={() => {
                setError('Please use the Email & Password form below to sign in or register.');
              }}
              sx={{
                borderColor: '#E5E7EB',
                color: '#1F2937',
                py: 1.1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.92rem',
                bgcolor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Continue with Facebook
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<AppleIcon sx={{ color: '#000000' }} />}
              onClick={() => {
                setError('Please use the Email & Password form below to sign in or register.');
              }}
              sx={{
                borderColor: '#E5E7EB',
                color: '#1F2937',
                py: 1.1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.92rem',
                bgcolor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Continue with Apple
            </Button>
          </Stack>

          {/* Divider */}
          <Divider sx={{ my: 2.5, color: 'text.secondary', fontSize: '0.8rem' }}>
            OR
          </Divider>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {isSignUp && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.8 }}
                  >
                    Name
                  </Typography>
                  <TextField
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                      },
                    }}
                  />
                </Box>
              )}

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.8 }}
                >
                  Email
                </Typography>
                <TextField
                  placeholder="Enter your personal or work email..."
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#FFFFFF',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.8 }}
                >
                  Password
                </Typography>
                <TextField
                  placeholder="Enter your password..."
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#FFFFFF',
                    },
                  }}
                />
              </Box>

              {/* Red Submit Button matching screenshot */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: '#DC2626',
                  color: '#FFFFFF',
                  py: 1.3,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  mt: 1,
                  '&:hover': {
                    bgcolor: '#B91C1C',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                  ? 'Sign up with Email'
                  : 'Log in with Email'}
              </Button>

              {/* Guest Option Button */}
              <Button
                variant="text"
                fullWidth
                startIcon={<PersonOutlineIcon />}
                onClick={handleGuest}
                disabled={loading}
                sx={{
                  color: '#4B5563',
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#F3F4F6',
                    color: '#111827',
                  },
                }}
              >
                Continue as Guest
              </Button>
            </Stack>
          </Box>

          {/* Legal disclaimer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 4,
              color: '#9CA3AF',
              fontSize: '0.72rem',
              lineHeight: 1.5,
              textAlign: 'left',
            }}
          >
            By continuing with Google, Apple, or Email, you agree to To-Do's{' '}
            <Box component="span" sx={{ textDecoration: 'underline', color: '#6B7280' }}>
              Terms of Service
            </Box>{' '}
            and{' '}
            <Box component="span" sx={{ textDecoration: 'underline', color: '#6B7280' }}>
              Privacy Policy
            </Box>
            .
          </Typography>
        </Box>
      </Box>

      {/* Right Column: Visual illustration matching user screenshot */}
      <Box
        sx={{
          flex: 1.2,
          bgcolor: '#FFF5F3',
          background: 'radial-gradient(circle at 70% 30%, #FFE8E2 0%, #FFF5F2 60%, #FFF8F6 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating Task Cards Stack */}
        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 2 }}>
          {/* Card 1 */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 3.5,
              p: 2.2,
              px: 2.5,
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(254, 205, 195, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.8,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px dashed #CBD5E1',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Finish Q3 budget
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.4 }}>
                <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 600, fontSize: '0.72rem' }}>
                  ⏳ in 5 days
                </Typography>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.72rem' }}>
                  🛡 Finance
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
              Inbox 🔒
            </Typography>
          </Box>

          {/* Card 2 */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 3.5,
              p: 2.2,
              px: 2.5,
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(254, 205, 195, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.8,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px dashed #CBD5E1',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Schedule team sync
              </Typography>
              <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 600, fontSize: '0.72rem', mt: 0.4, display: 'block' }}>
                📅 Thursday
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
              Work #
            </Typography>
          </Box>

          {/* Card 3 */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 3.5,
              p: 2.2,
              px: 2.5,
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(254, 205, 195, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.8,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px dashed #CBD5E1',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Buy milk after work
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.72rem', mt: 0.4, display: 'block' }}>
                🕒 Today
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
              Inbox 🔒
            </Typography>
          </Box>

          {/* Sound / Voice Waveform */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                color: '#DC2626',
                opacity: 0.85,
              }}
            >
              <GraphicEqIcon sx={{ fontSize: 36 }} />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
