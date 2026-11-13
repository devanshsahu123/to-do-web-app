import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TaskItem from './TaskItem';

const formatWeekHeader = (startDateStr, endDateStr, year, weekNumber) => {
  if (!startDateStr || !endDateStr) return `Week ${weekNumber || ''}`;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startFormatted = `${months[start.getMonth()]} ${start.getDate()}`;
  const endFormatted = `${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;

  return `${startFormatted} – ${endFormatted}`;
};

export default function WeeklyCard({
  weekData,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onAddTaskForWeek,
}) {
  const {
    weekNumber,
    year,
    weekStartDate,
    weekEndDate,
    openTasks,
    completedTasks,
    totalTasks,
    tasks = [],
  } = weekData;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Check if current week contains today
  const now = new Date();
  const start = new Date(weekStartDate);
  const end = new Date(weekEndDate);
  const isCurrentWeek = now >= start && now <= end;

  return (
    <Accordion
      expanded={isExpanded}
      onChange={onToggleExpand}
      disableGutters
      elevation={isExpanded ? 3 : 1}
      sx={{
        mb: 2,
        borderRadius: 3.5,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isCurrentWeek ? 'primary.light' : '#E2E8F0',
        transition: 'all 0.25s ease-in-out',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1,
          bgcolor: isCurrentWeek ? '#F5F7FF' : '#FFFFFF',
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
            margin: 0,
          },
        }}
      >
        {/* Top line: Week title & badges */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarMonthIcon sx={{ color: isCurrentWeek ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A' }}>
              Week {weekNumber}
            </Typography>
            {isCurrentWeek && (
              <Chip
                label="Current Week"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {formatWeekHeader(weekStartDate, weekEndDate, year, weekNumber)}
          </Typography>
        </Box>

        {/* Task Summary Badges (Open vs Completed as required by PDF) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
          }}
        >
          <Stack direction="row" spacing={1.2}>
            {/* Open Tasks Count */}
            <Chip
              icon={<PendingActionsIcon fontSize="small" style={{ color: '#4F46E5' }} />}
              label={`${openTasks} Open`}
              size="small"
              sx={{
                bgcolor: '#EEF2FF',
                color: '#4338CA',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: '1px solid #C7D2FE',
              }}
            />

            {/* Completed Tasks Count */}
            <Chip
              icon={<CheckCircleOutlinedIcon fontSize="small" style={{ color: '#10B981' }} />}
              label={`${completedTasks} Completed`}
              size="small"
              sx={{
                bgcolor: '#ECFDF5',
                color: '#065F46',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: '1px solid #A7F3D0',
              }}
            />
          </Stack>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {completionPercent}% done
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', mt: 1.2 }}>
          <LinearProgress
            variant="determinate"
            value={completionPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: completionPercent === 100 ? '#10B981' : '#4F46E5',
              },
            }}
          />
        </Box>
      </AccordionSummary>

      <Divider />

      {/* Expanded Tasks List for this week */}
      <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 2, bgcolor: '#FAF5FF' }}>
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No tasks scheduled for this week.
            </Typography>
          </Box>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}

        {/* Quick Add for this specific week */}
        <Box sx={{ mt: 1.5, textAlign: 'center' }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => onAddTaskForWeek(weekStartDate)}
            sx={{
              borderRadius: 2.5,
              fontSize: '0.8rem',
              py: 0.7,
              px: 2,
              borderColor: '#CBD5E1',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: '#FFFFFF',
              },
            }}
          >
            Add Task to Week {weekNumber}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
