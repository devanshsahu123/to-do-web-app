import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function SearchHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  user,
  isGuest,
  onOpenLoginModal,
  onLogout,
  onOpenSidebar,
  onOpenAddTask,
  onOpenCalendar,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    onLogout();
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* Top Bar: Title & User profile / Auth button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <IconButton
            onClick={onOpenSidebar}
            size="small"
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              p: 0.8,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#334155',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#DC2626' },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.5rem' }, letterSpacing: '-0.02em' }}>
              Weekly To-Do
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Track progress & organize tasks
            </Typography>
          </Box>
        </Stack>

        {/* User state badge / Login button / Desktop Add Task / Calendar */}
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {onOpenCalendar && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
              onClick={onOpenCalendar}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: '8px',
                px: 1.8,
                py: 0.7,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderColor: '#E2E8F0',
                bgcolor: '#FFFFFF',
                color: '#334155',
                '&:hover': {
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  bgcolor: '#F8FAFC',
                },
              }}
            >
              Calendar
            </Button>
          )}

          {onOpenCalendar && (
            <IconButton
              onClick={onOpenCalendar}
              size="small"
              title="Open Calendar"
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                p: 0.8,
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#334155',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#DC2626', color: '#DC2626' },
              }}
            >
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          )}

          {onOpenAddTask && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onOpenAddTask}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                boxShadow: 'none',
                background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                },
              }}
            >
              Add Task
            </Button>
          )}

          {isGuest ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MailOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={onOpenLoginModal}
              sx={{
                borderRadius: '8px',
                fontSize: '0.8rem',
                borderColor: '#E2E8F0',
                color: '#1F2937',
                bgcolor: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#DC2626',
                  color: '#DC2626',
                },
              }}
            >
              Log in / Register
            </Button>
          ) : (
            <>
              <IconButton onClick={handleOpenUserMenu} size="small" sx={{ p: 0.5 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseUserMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { borderRadius: 3, mt: 1, minWidth: 180, p: 0.5 },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2 }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Box>

      {/* Guest Mode Notice banner if in guest mode */}
      {isGuest && (
        <Box
          sx={{
            mb: 2,
            p: 1.2,
            px: 2,
            bgcolor: '#FFF5F5',
            borderRadius: 2.5,
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 600 }}>
            Guest mode active — tasks saved in browser. Sign in with email to sync.
          </Typography>
          <Button
            size="small"
            onClick={onOpenLoginModal}
            sx={{
              fontSize: '0.75rem',
              py: 0.3,
              px: 1.2,
              minWidth: 'auto',
              fontWeight: 700,
              color: '#DC2626',
              textTransform: 'none',
            }}
          >
            Log In / Sign Up
          </Button>
        </Box>
      )}

      {/* Search Input Bar */}
      <TextField
        placeholder="Search tasks by title or description..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: {
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            '& fieldset': { borderColor: '#E2E8F0' },
          },
        }}
      />

      {/* Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
        {['All', 'In Progress', 'Completed', 'High Priority'].map((filter) => {
          const isSelected = statusFilter === filter;
          return (
            <Chip
              key={filter}
              label={filter}
              onClick={() => onStatusFilterChange(filter)}
              variant={isSelected ? 'filled' : 'outlined'}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: 2.5,
                bgcolor: isSelected ? 'primary.main' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'text.secondary',
                borderColor: isSelected ? 'primary.main' : '#E2E8F0',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.dark' : '#F1F5F9',
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
