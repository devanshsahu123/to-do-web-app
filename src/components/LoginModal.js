import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function LoginModal({
  open,
  onClose,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onGuestLogin,
}) {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
      const res = await onSendOtp({ email: email.trim(), name: name.trim() });
      setStep('otp');
      setCountdown(30);
      setInfoMessage(res?.message || `6-digit code sent to ${email.trim()}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await onVerifyOtp({ email: email.trim(), otp: otp.trim(), name: name.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      setError('');
      await onResendOtp({ email: email.trim() });
      setCountdown(30);
      setInfoMessage('A new code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      setError('');
      await onGuestLogin();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to continue as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 0.5,
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          {step === 'email' ? 'Log in to To-Do' : 'Check your inbox'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {step === 'email' ? (
          <>
            {/* Always Visible Alert Box */}
            <Alert
              severity="info"
              icon={<MarkEmailReadOutlinedIcon sx={{ color: '#DC2626', fontSize: 20 }} />}
              sx={{
                mb: 2,
                borderRadius: 2.5,
                bgcolor: '#FFF5F5',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontWeight: 600,
                fontSize: '0.82rem',
                lineHeight: 1.4,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              Please enter your Gmail / email below to continue
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSendOtp}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}>
                    Email
                  </Typography>
                  <TextField
                    placeholder="Enter your email..."
                    type="email"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    autoFocus
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}>
                    Name (Optional)
                  </Typography>
                  <TextField
                    placeholder="Your Name"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    bgcolor: '#DC2626',
                    color: '#FFFFFF',
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#B91C1C',
                    },
                  }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} color="inherit" />
                      <span>Sending Code...</span>
                    </Stack>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              size="medium"
              disabled={loading}
              startIcon={<PersonOutlineIcon />}
              onClick={handleGuest}
              sx={{
                py: 1.1,
                borderRadius: 2,
                fontWeight: 600,
                borderColor: '#CBD5E1',
                color: '#374151',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#F9FAFB',
                  borderColor: '#9CA3AF',
                },
              }}
            >
              Continue as Guest
            </Button>
          </>
        ) : (
          /* Step 2: OTP */
          <>
            <Button
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => {
                setStep('email');
                setError('');
                setInfoMessage('');
              }}
              sx={{
                color: 'text.secondary',
                fontSize: '0.78rem',
                textTransform: 'none',
                p: 0,
                mb: 1.5,
              }}
            >
              Change Email
            </Button>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <MarkEmailReadOutlinedIcon sx={{ color: '#DC2626', fontSize: 24 }} />
              <Typography variant="body2" color="text.secondary">
                We sent a 6-digit code to <strong>{email}</strong>
              </Typography>
            </Stack>

            {infoMessage && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                {infoMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleVerifyOtp}>
              <Stack spacing={2}>
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
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '6px',
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

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || otp.length < 6}
                  sx={{
                    bgcolor: '#DC2626',
                    color: '#FFFFFF',
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#B91C1C',
                    },
                  }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} color="inherit" />
                      <span>Verifying...</span>
                    </Stack>
                  ) : (
                    'Verify & Log in'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Didn't receive code?{' '}
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
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </Box>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
