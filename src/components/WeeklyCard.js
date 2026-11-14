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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
  onUpdateSubtasks,
}) {
  const {
    weekNumber,
    year = 2026,
    weekStartDate,
    weekEndDate,
    openTasks = 0,
    completedTasks = 0,
    totalTasks = 0,
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
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: '12px !important',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isCurrentWeek ? '#DC2626' : '#E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: isExpanded ? '0 4px 14px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease-in-out',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#64748B' }} />}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.2,
          bgcolor: isCurrentWeek ? '#FFFDFD' : '#FFFFFF',
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
            margin: 0,
          },
        }}
      >
        {/* Top line: Week title, Annual Stamp & Date Range */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
            <CalendarTodayIcon sx={{ color: isCurrentWeek ? '#DC2626' : '#64748B', fontSize: 18 }} />
            
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0F172A', fontSize: '0.96rem' }}>
              Week {weekNumber}
            </Typography>

            {/* Annual Stamp Badge */}
            <Chip
              label={`${year} • ISO`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: '#F1F5F9',
                color: '#475569',
                borderRadius: '6px',
              }}
            />

            {isCurrentWeek && (
              <Chip
                label="Current Week"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: '#DC2626',
                  color: 'white',
                  borderRadius: '6px',
                }}
              />
            )}
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
            {formatWeekHeader(weekStartDate, weekEndDate, year, weekNumber)}
          </Typography>
        </Box>

        {/* Task Summary Badges (Open vs Completed as required by Assessment) */}
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
          <Stack direction="row" spacing={1}>
            {/* Open Tasks Count */}
            <Chip
              icon={<PendingActionsIcon fontSize="small" style={{ color: '#4338CA' }} />}
              label={`${openTasks} Open`}
              size="small"
              sx={{
                bgcolor: '#EEF2FF',
                color: '#4338CA',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #C7D2FE',
                borderRadius: '6px',
                height: 24,
              }}
            />

            {/* Completed Tasks Count */}
            <Chip
              icon={<CheckCircleOutlinedIcon fontSize="small" style={{ color: '#065F46' }} />}
              label={`${completedTasks} Completed`}
              size="small"
              sx={{
                bgcolor: '#ECFDF5',
                color: '#065F46',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                height: 24,
              }}
            />
          </Stack>

          <Typography variant="caption" sx={{ fontWeight: 800, color: completionPercent === 100 ? '#10B981' : '#475569', fontSize: '0.78rem' }}>
            {completionPercent}% completed
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

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* Expanded Tasks List for this week */}
      <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 2, bgcolor: '#F8FAFC' }}>
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#FFFFFF', borderRadius: '10px', p: 2, border: '1px dashed #CBD5E1' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              No tasks scheduled for Week {weekNumber}.
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddTaskForWeek(weekStartDate)}
              sx={{ mt: 1, textTransform: 'none', fontWeight: 700, color: '#DC2626' }}
            >
              Add First Task
            </Button>
          </Box>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onUpdateSubtasks={onUpdateSubtasks}
            />
          ))
        )}

        {/* Quick Add for this specific week */}
        {tasks.length > 0 && (
          <Box sx={{ mt: 1.5, textAlign: 'center' }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => onAddTaskForWeek(weekStartDate)}
              sx={{
                borderRadius: '8px',
                fontSize: '0.8rem',
                py: 0.6,
                px: 2,
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  bgcolor: '#FFFFFF',
                },
              }}
            >
              Add Task to Week {weekNumber}
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
