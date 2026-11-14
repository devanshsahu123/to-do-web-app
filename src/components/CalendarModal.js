import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Chip,
  Grid,
  Card,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { isTaskScheduledForDate, isSameDay } from '../utils/taskDateUtils';

export default function CalendarModal({
  open,
  onClose,
  tasks = [],
  onSelectDateFilter,
  onAddTaskForDate,
}) {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(today);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  const handleJumpTomorrow = () => {
    setCurrentYear(tomorrow.getFullYear());
    setCurrentMonth(tomorrow.getMonth());
    setSelectedDate(tomorrow);
  };

  // Build grid days for current month (Monday through Sunday)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday-first offset: 0=Sun -> 6, 1=Mon -> 0, ..., 6=Sat -> 5
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Empty padding cells for previous month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      days.push(dateObj);
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map tasks for each calendar day using recurrence-aware isTaskScheduledForDate
  const tasksByDate = useMemo(() => {
    const map = {};
    (calendarDays || []).forEach((d) => {
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[key] = (tasks || []).filter((t) => isTaskScheduledForDate(t, d));
    });
    return map;
  }, [tasks, calendarDays]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return (tasks || []).filter((t) => isTaskScheduledForDate(t, selectedDate));
  }, [tasks, selectedDate]);

  const formatHeaderDate = (d) => {
    if (!d) return '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 2,
          px: 3,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.2 }}>
              Interactive Task Calendar
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Inspect tomorrow's schedule or browse tasks by date • Annual {currentYear}
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Quick jump pills */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<TodayIcon fontSize="small" />}
            label="Today"
            onClick={handleJumpToday}
            clickable
            variant={isSameDay(selectedDate, today) ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              bgcolor: isSameDay(selectedDate, today) ? '#DC2626' : '#FFFFFF',
              color: isSameDay(selectedDate, today) ? '#FFFFFF' : '#334155',
              borderColor: isSameDay(selectedDate, today) ? '#DC2626' : '#CBD5E1',
            }}
          />
          <Chip
            icon={<EventIcon fontSize="small" />}
            label="Tomorrow"
            onClick={handleJumpTomorrow}
            clickable
            variant={isSameDay(selectedDate, tomorrow) ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              bgcolor: isSameDay(selectedDate, tomorrow) ? '#D97706' : '#FFFFFF',
              color: isSameDay(selectedDate, tomorrow) ? '#FFFFFF' : '#334155',
              borderColor: isSameDay(selectedDate, tomorrow) ? '#D97706' : '#CBD5E1',
            }}
          />
          <Chip
            label="Annual 2026 Overview"
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1E40AF',
              fontWeight: 700,
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
            }}
          />
        </Stack>

        {/* 2-Column Responsive Layout: Calendar on Left, Tasks on Right */}
        <Grid container spacing={3}>
          {/* Calendar Grid Column */}
          <Grid item xs={12} md={7}>
            {/* Month & Year Navigation Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                px: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0F172A' }}>
                {monthNames[currentMonth]} {currentYear}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={handlePrevMonth} sx={{ border: '1px solid #E2E8F0' }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleNextMonth} sx={{ border: '1px solid #E2E8F0' }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            {/* Days of week header (Mon - Sun) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                mb: 1,
              }}
            >
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <Typography
                  key={day}
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#64748B',
                    py: 0.5,
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>

            {/* Calendar Days Matrix */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.6,
              }}
            >
              {calendarDays.map((d, index) => {
                if (!d) {
                  return <Box key={`empty_${index}`} sx={{ height: 42 }} />;
                }

                const isToday = isSameDay(d, today);
                const isTomorrow = isSameDay(d, tomorrow);
                const isSelected = isSameDay(d, selectedDate);
                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const dayTasks = tasksByDate[dateKey] || [];
                const taskCount = dayTasks.length;

                return (
                  <Box
                    key={dateKey}
                    onClick={() => setSelectedDate(d)}
                    sx={{
                      height: 44,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      border: isSelected
                        ? '2px solid #DC2626'
                        : isToday
                        ? '1.5px solid #2563EB'
                        : isTomorrow
                        ? '1.5px solid #D97706'
                        : '1px solid #F1F5F9',
                      bgcolor: isSelected
                        ? '#FEF2F2'
                        : isToday
                        ? '#EFF6FF'
                        : isTomorrow
                        ? '#FFFDF5'
                        : '#FFFFFF',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? '#FEF2F2' : '#F8FAFC',
                        transform: 'scale(1.04)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday || isTomorrow || isSelected ? 800 : 500,
                        color: isSelected
                          ? '#DC2626'
                          : isToday
                          ? '#2563EB'
                          : isTomorrow
                          ? '#B45309'
                          : '#1E293B',
                        fontSize: '0.84rem',
                        lineHeight: 1,
                      }}
                    >
                      {d.getDate()}
                    </Typography>

                    {/* Task indicator dot / badge */}
                    {taskCount > 0 && (
                      <Box
                        sx={{
                          mt: 0.3,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isSelected ? '#DC2626' : taskCount > 2 ? '#EF4444' : '#10B981',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={2} sx={{ mt: 2, px: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563EB' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Today
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#D97706' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Tomorrow
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Has Tasks
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Selected Date Tasks Column */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
                  {isSameDay(selectedDate, today) ? (
                    <Chip label="Today" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, height: 20 }} />
                  ) : isSameDay(selectedDate, tomorrow) ? (
                    <Chip label="Tomorrow" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, height: 20 }} />
                  ) : null}
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0F172A' }}>
                    {formatHeaderDate(selectedDate)}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {/* Task Items List for Selected Day */}
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 240, pr: 0.5 }}>
                {selectedDateTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#475569' }}>
                      No tasks for this day
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isSameDay(selectedDate, tomorrow)
                        ? "You're all clear for tomorrow! Schedule something now."
                        : 'Plan ahead and create a task for this date.'}
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {selectedDateTasks.map((t) => {
                      const isDone = t.status === 'Completed';
                      return (
                        <Card
                          key={t._id}
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            bgcolor: isDone ? '#F1F5F9' : '#FFFFFF',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {isDone ? (
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                            ) : (
                              <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.84rem',
                                  color: isDone ? 'text.secondary' : '#0F172A',
                                  textDecoration: isDone ? 'line-through' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {t.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {t.category || 'Work'} • {t.priority || 'Medium'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Action Buttons for selected day */}
              <Box sx={{ pt: 2, mt: 'auto' }}>
                <Stack direction="column" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      onClose();
                      if (onAddTaskForDate) onAddTaskForDate(selectedDate);
                    }}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 0.9,
                      background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
                    }}
                  >
                    Add Task for This Date
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      onClose();
                      if (onSelectDateFilter) {
                        onSelectDateFilter(selectedDate);
                      }
                    }}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: '#CBD5E1',
                      color: '#334155',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                    }}
                  >
                    Filter Main View to this Day
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '8px', textTransform: 'none' }}>
          Close Calendar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

