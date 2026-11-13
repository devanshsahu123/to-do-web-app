import React, { useState } from 'react';
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
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

export default function LoginModal({
  open,
  onClose,
  onEmailLogin,
  onEmailRegister,
  onGuestLogin,
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (isSignUp) {
        await onEmailRegister({
          email: email.trim(),
          password,
          name: name.trim(),
        });
      } else {
        await onEmailLogin({
          email: email.trim(),
          password,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
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
          {isSignUp ? 'Create your Account' : 'Log in to To-Do'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isSignUp
            ? 'Sign up with email to organize and sync your tasks.'
            : 'Welcome back! Enter your email and password.'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.8}>
            {isSignUp && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}>
                  Name
                </Typography>
                <TextField
                  placeholder="Your Name"
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
              </Box>
            )}

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}>
                Email
              </Typography>
              <TextField
                placeholder="name@email.com"
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
                Password
              </Typography>
              <TextField
                placeholder="At least 6 characters"
                type={showPassword ? 'text' : 'password'}
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
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
                mt: 0.5,
                '&:hover': {
                  bgcolor: '#B91C1C',
                },
              }}
            >
              {loading
                ? 'Processing...'
                : isSignUp
                ? 'Sign up with Email'
                : 'Log in with Email'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Box
              component="span"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              sx={{
                color: '#DC2626',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </Box>
          </Typography>
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
      </DialogContent>
    </Dialog>
  );
}
