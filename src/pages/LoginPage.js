import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { sendOtp, verifyOtp, resendOtp, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: 'email', Step 2: 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const from = location.state?.from?.pathname || '/to-do';

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp({
        email: email.trim(),
        name: name.trim(),
      });

      if (res.success) {
        setStep('otp');
        setCountdown(30);
        setInfoMessage(res.message || `Verification code sent to ${email.trim()}.`);
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
        name: name.trim(),
      });

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      setError('');
      const res = await resendOtp({ email: email.trim() });
      if (res.success) {
        setCountdown(30);
        setInfoMessage('A new verification code has been sent to your email.');
      } else {
        setError(res.message || 'Failed to resend code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Continue as Guest
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
      {/* Left Column: Sign up / Log in Form */}
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
          {/* STEP 1: Enter Email to receive OTP */}
          {step === 'email' ? (
            <>
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
                  Sign up / Log in
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Enter your email to receive a secure 6-digit login code via Gmail.
                </Typography>
              </Box>

              {/* Always Visible Alert Box */}
              <Alert
                severity="info"
                icon={<MarkEmailReadOutlinedIcon sx={{ color: '#DC2626', fontSize: 22 }} />}
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#FFF5F5',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  '& .MuiAlert-icon': {
                    alignItems: 'center',
                  },
                }}
              >
                Please enter your Gmail / email below to continue
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSendOtp}>
                <Stack spacing={2}>
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
                      autoFocus
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
                      Display Name (Optional)
                    </Typography>
                    <TextField
                      placeholder="e.g. Alex Smith"
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

                  {/* Red Action Button */}
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
                    {loading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Sending OTP...</span>
                      </Stack>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>

                  {/* Continue as Guest */}
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
            </>
          ) : (
            /* STEP 2: Enter 6-digit OTP code */
            <>
              <Box sx={{ mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon fontSize="small" />}
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setInfoMessage('');
                  }}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    p: 0,
                    mb: 1.5,
                  }}
                >
                  Change Email
                </Button>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <MarkEmailReadOutlinedIcon sx={{ color: '#DC2626', fontSize: 28 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: '#1F2937',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Check your email
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  We sent a 6-digit verification code to{' '}
                  <strong style={{ color: '#111827' }}>{email}</strong>.
                </Typography>
              </Box>

              {infoMessage && (
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {infoMessage}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* OTP Form */}
              <Box component="form" onSubmit={handleVerifyOtp}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.8 }}
                    >
                      6-Digit Verification Code
                    </Typography>
                    <TextField
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      fullWidth
                      size="medium"
                      required
                      autoFocus
                      inputProps={{
                        maxLength: 6,
                        style: {
                          textAlign: 'center',
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          letterSpacing: '8px',
                          color: '#DC2626',
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          bgcolor: '#FEF2F2',
                          '& fieldset': { borderColor: '#FECACA' },
                        },
                      }}
                    />
                  </Box>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || otp.length < 6}
                    sx={{
                      bgcolor: '#DC2626',
                      color: '#FFFFFF',
                      py: 1.3,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#B91C1C',
                      },
                    }}
                  >
                    {loading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Verifying...</span>
                      </Stack>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>

                  {/* Resend Code Option */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Didn't receive the code?{' '}
                      <Box
                        component="span"
                        onClick={handleResend}
                        sx={{
                          color: countdown > 0 ? '#9CA3AF' : '#DC2626',
                          fontWeight: 700,
                          cursor: countdown > 0 ? 'default' : 'pointer',
                          textDecoration: countdown > 0 ? 'none' : 'underline',
                        }}
                      >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                      </Box>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Guest Fallback */}
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
                      fontSize: '0.88rem',
                      textTransform: 'none',
                    }}
                  >
                    Skip and Continue as Guest
                  </Button>
                </Stack>
              </Box>
            </>
          )}

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
            By continuing with Email, you agree to To-Do's{' '}
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
