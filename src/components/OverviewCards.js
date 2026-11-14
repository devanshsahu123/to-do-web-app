import React from 'react';
import { Box, Card, Typography, Stack, Button } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  isTaskForToday,
  isTaskForTomorrow,
  isTaskForThisWeek,
  isTaskForThisMonth,
} from '../utils/taskDateUtils';

export default function OverviewCards({ tasks = [], activeFilter, onSelectFilter, onOpenCalendar }) {
  const now = new Date();

  // Compute stats using recurrence-aware utilities
  const todayTasks = tasks.filter(isTaskForToday);
  const todayOpen = todayTasks.filter((t) => t.status !== 'Completed').length;
  const todayDone = todayTasks.filter((t) => t.status === 'Completed').length;

  const tomorrowTasks = tasks.filter(isTaskForTomorrow);
  const tomorrowOpen = tomorrowTasks.filter((t) => t.status !== 'Completed').length;
  const tomorrowDone = tomorrowTasks.filter((t) => t.status === 'Completed').length;

  const weekTasks = tasks.filter(isTaskForThisWeek);
  const weekOpen = weekTasks.filter((t) => t.status !== 'Completed').length;
  const weekDone = weekTasks.filter((t) => t.status === 'Completed').length;

  const monthTasks = tasks.filter(isTaskForThisMonth);
  const monthOpen = monthTasks.filter((t) => t.status !== 'Completed').length;
  const monthDone = monthTasks.filter((t) => t.status === 'Completed').length;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentMonthName = monthNames[now.getMonth()];

  const cards = [
    {
      id: 'today',
      title: "Today's Tasks",
      subtitle: `${todayTasks.length} tasks`,
      open: todayOpen,
      done: todayDone,
      icon: <TodayIcon sx={{ fontSize: 20, color: '#DC2626' }} />,
      bg: '#FFF8F8',
      borderColor: '#FCA5A5',
      activeColor: '#DC2626',
    },
    {
      id: 'tomorrow',
      title: "Tomorrow's Tasks",
      subtitle: `${tomorrowTasks.length} tasks`,
      open: tomorrowOpen,
      done: tomorrowDone,
      icon: <EventIcon sx={{ fontSize: 20, color: '#D97706' }} />,
      bg: '#FFFDF5',
      borderColor: '#FDE68A',
      activeColor: '#D97706',
    },
    {
      id: 'week',
      title: "This Week's Tasks",
      subtitle: 'Mon – Sun',
      open: weekOpen,
      done: weekDone,
      icon: <DateRangeIcon sx={{ fontSize: 20, color: '#2563EB' }} />,
      bg: '#F8FAFF',
      borderColor: '#BFDBFE',
      activeColor: '#2563EB',
    },
    {
      id: 'month',
      title: 'Monthly Tasks',
      subtitle: currentMonthName,
      open: monthOpen,
      done: monthDone,
      icon: <CalendarMonthIcon sx={{ fontSize: 20, color: '#7C3AED' }} />,
      bg: '#FAF8FF',
      borderColor: '#DDD6FE',
      activeColor: '#7C3AED',
    },
  ];

  return (
    <Box sx={{ mb: 2.2 }}>
      {/* Top Header Row with Calendar View Trigger */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>
          SCHEDULE OVERVIEW & CALENDAR
        </Typography>

        {onOpenCalendar && (
          <Button
            size="small"
            startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
            onClick={onOpenCalendar}
            sx={{
              py: 0.3,
              px: 1.2,
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#DC2626',
                color: '#DC2626',
              },
            }}
          >
            Open Interactive Calendar
          </Button>
        )}
      </Box>

      {/* 4 Overview Cards (Today, Tomorrow, This Week, Month) */}
      <Stack
        direction="row"
        spacing={1.2}
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          '::-webkit-scrollbar': { height: 3 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: 1 },
        }}
      >
        {cards.map((c) => {
          const isSelected = activeFilter === c.id;
          return (
            <Card
              key={c.id}
              onClick={() => onSelectFilter(isSelected ? 'all' : c.id)}
              elevation={0}
              sx={{
                flex: '1 0 145px',
                minWidth: '135px',
                p: 1.6,
                borderRadius: '10px',
                bgcolor: isSelected ? '#FFFFFF' : c.bg,
                border: '1px solid',
                borderColor: isSelected ? c.activeColor : c.borderColor,
                boxShadow: isSelected ? `0 2px 8px -1px ${c.activeColor}30` : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: c.activeColor,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {/* Top Row: Icon & Subtitle text */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                {c.icon}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                  }}
                >
                  {c.subtitle}
                </Typography>
              </Stack>

              {/* Title */}
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  color: isSelected ? c.activeColor : '#0F172A',
                  mb: 0.6,
                  fontSize: '0.84rem',
                }}
              >
                {c.title}
              </Typography>

              {/* Counters */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.75rem' }}>
                  {c.open} Open
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>
                  {c.done} Done
                </Typography>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
