import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const priorityConfig = {
  High: { color: '#EF4444', bg: '#FEE2E2', label: 'High' },
  Medium: { color: '#F59E0B', bg: '#FEF3C7', label: 'Medium' },
  Low: { color: '#10B981', bg: '#D1FAE5', label: 'Low' },
};

const formatTaskDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const dayNum = d.getDate();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${dayName}, ${monthName} ${dayNum} • ${hours}:${minutes} ${ampm}`;
};

export default function TaskItem({ task, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = task.status === 'Completed';
  const priority = priorityConfig[task.priority] || priorityConfig.Medium;

  // Touch swipe handling for "Swipe left to delete" requirement
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only swipe horizontally if not vertical scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiping left (max -90px)
        setSwipeOffset(Math.max(-90, deltaX));
      } else {
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (swipeOffset < -45) {
      // Snap open swipe actions
      setSwipeOffset(-80);
    } else {
      // Snap closed
      setSwipeOffset(0);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        mb: 1.5,
        bgcolor: '#FEE2E2', // Background reveal for swipe delete
      }}
    >
      {/* Background action revealed on swipe left */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#EF4444',
          color: 'white',
          cursor: 'pointer',
          zIndex: 1,
        }}
        onClick={() => onDelete(task)}
      >
        <Stack alignItems="center" spacing={0.3}>
          <DeleteOutlinedIcon fontSize="medium" />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
            DELETE
          </Typography>
        </Stack>
      </Box>

      {/* Main Task Foreground Card */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: 'relative',
          zIndex: 2,
          transform: `translateX(${swipeOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease',
          bgcolor: isCompleted ? '#F8FAFC' : '#FFFFFF',
          border: '1px solid',
          borderColor: isCompleted ? '#E2E8F0' : '#EDF2F7',
          borderRadius: 3,
          p: 1.8,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          boxShadow: isCompleted ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        {/* Status Checkbox / Toggle */}
        <Tooltip title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}>
          <Checkbox
            checked={isCompleted}
            onChange={() => onToggleStatus(task._id)}
            icon={<RadioButtonUncheckedIcon sx={{ color: '#CBD5E1' }} />}
            checkedIcon={<CheckCircleIcon sx={{ color: '#10B981' }} />}
            sx={{ p: 0.5, mt: 0.2 }}
          />
        </Tooltip>

        {/* Task Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: isCompleted ? 'text.secondary' : 'text.primary',
                textDecoration: isCompleted ? 'line-through' : 'none',
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>

            {/* Priority Chip */}
            <Chip
              size="small"
              label={priority.label}
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: priority.color,
                bgcolor: priority.bg,
                border: `1px solid ${priority.color}30`,
              }}
            />

            {/* Status Chip */}
            <Chip
              size="small"
              label={isCompleted ? 'Completed' : 'In Progress'}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: isCompleted ? '#059669' : '#4F46E5',
                bgcolor: isCompleted ? '#ECFDF5' : '#EEF2FF',
              }}
            />
          </Stack>

          {/* Description (if provided) */}
          {task.description && (
            <Typography
              variant="body2"
              sx={{
                color: isCompleted ? 'text.disabled' : 'text.secondary',
                mb: 1,
                fontSize: '0.85rem',
                lineHeight: 1.4,
                whiteSpace: 'pre-line',
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Date & Time */}
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {formatTaskDate(task.dueDate)}
            </Typography>
          </Stack>
        </Box>

        {/* Action Buttons (Desktop / Direct click) */}
        <Stack direction="row" spacing={0.2} sx={{ ml: 'auto' }}>
          <Tooltip title="Edit Task">
            <IconButton
              size="small"
              onClick={() => onEdit(task)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: '#EEF2FF' },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Task">
            <IconButton
              size="small"
              onClick={() => onDelete(task)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main', bgcolor: '#FEE2E2' },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
