import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Collapse,
  TextField,
  Button,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import RepeatIcon from '@mui/icons-material/Repeat';
import { categoryStyles } from './CategoryChips';

const priorityConfig = {
  High: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'High' },
  Medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium' },
  Low: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Low' },
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

export default function TaskItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onUpdateSubtasks,
}) {
  const isCompleted = task.status === 'Completed';
  const priority = priorityConfig[task.priority] || priorityConfig.Medium;
  const catStyle = categoryStyles[task.category] || categoryStyles.Default;

  // Subtasks state
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskPercent =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleToggleSubtask = (subtaskId) => {
    const updated = subtasks.map((s) =>
      s.id === subtaskId || s._id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    if (onUpdateSubtasks) {
      onUpdateSubtasks(task._id, updated);
    }
  };

  const handleStartEditSubtask = (st) => {
    setEditingSubtaskId(st.id || st._id);
    setEditingSubtaskTitle(st.title || '');
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleSaveEditSubtask = (subtaskId) => {
    if (!editingSubtaskTitle.trim()) return;
    const updated = subtasks.map((s) =>
      s.id === subtaskId || s._id === subtaskId
        ? { ...s, title: editingSubtaskTitle.trim() }
        : s
    );
    if (onUpdateSubtasks) {
      onUpdateSubtasks(task._id, updated);
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSubtask = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...subtasks, newSubtask];
    if (onUpdateSubtasks) {
      onUpdateSubtasks(task._id, updated);
    }
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subtaskId) => {
    if (editingSubtaskId === subtaskId) {
      handleCancelEditSubtask();
    }
    const updated = subtasks.filter(
      (s) => s.id !== subtaskId && s._id !== subtaskId
    );
    if (onUpdateSubtasks) {
      onUpdateSubtasks(task._id, updated);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: '10px',
        mb: 1.5,
        bgcolor: isCompleted ? '#F8FAFC' : '#FFFFFF',
        border: '1px solid',
        borderColor: isCompleted ? '#E2E8F0' : '#E2E8F0',
        boxShadow: isCompleted ? 'none' : '0 1px 4px rgba(0,0,0,0.02)',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
        '&:hover': {
          borderColor: isCompleted ? '#CBD5E1' : '#CBD5E1',
          boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
        },
      }}
    >
      {/* Main Task Body */}
      <Box sx={{ p: 1.8, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {/* Checkbox */}
        <Tooltip title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}>
          <Checkbox
            checked={isCompleted}
            onChange={() => onToggleStatus(task._id)}
            icon={<RadioButtonUncheckedIcon sx={{ color: '#CBD5E1', fontSize: 22 }} />}
            checkedIcon={<CheckCircleIcon sx={{ color: '#10B981', fontSize: 22 }} />}
            sx={{ p: 0.2, mt: 0.2 }}
          />
        </Tooltip>

        {/* Task Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header Line: Title & Badges */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
            sx={{ mb: 0.4, flexWrap: 'wrap', gap: 0.6 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: isCompleted ? '#64748B' : '#0F172A',
                textDecoration: isCompleted ? 'line-through' : 'none',
                wordBreak: 'break-word',
                fontSize: '0.94rem',
                mr: 0.5,
              }}
            >
              {task.title}
            </Typography>

            {/* Category Tag */}
            {task.category && (
              <Chip
                size="small"
                label={task.category}
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: catStyle.color,
                  bgcolor: catStyle.bg,
                  border: `1px solid ${catStyle.border}`,
                  borderRadius: '6px',
                }}
              />
            )}

            {/* Priority Tag */}
            <Chip
              size="small"
              label={priority.label}
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: priority.color,
                bgcolor: priority.bg,
                border: `1px solid ${priority.border}`,
                borderRadius: '6px',
              }}
            />

            {/* Recurrence Repeat Chip */}
            {task.recurrence && task.recurrence.type && task.recurrence.type !== 'None' && (
              <Chip
                size="small"
                icon={<RepeatIcon sx={{ fontSize: 13, color: '#4338CA !important' }} />}
                label={
                  task.recurrence.type === 'Daily'
                    ? 'Daily'
                    : task.recurrence.type === 'Monthly'
                    ? 'Monthly'
                    : task.recurrence.days && task.recurrence.days.length > 0
                    ? `Repeat: ${task.recurrence.days.join(', ')}`
                    : 'Weekly'
                }
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#4338CA',
                  bgcolor: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '6px',
                }}
              />
            )}
          </Stack>

          {/* Description */}
          {task.description && (
            <Typography
              variant="body2"
              sx={{
                color: isCompleted ? '#94A3B8' : '#64748B',
                mb: 1,
                fontSize: '0.84rem',
                lineHeight: 1.4,
                whiteSpace: 'pre-line',
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Meta line: Time & Subtasks Trigger */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeIcon sx={{ fontSize: 13, color: '#64748B' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.74rem' }}>
                {formatTaskDate(task.dueDate)}
              </Typography>
            </Stack>

            {/* Subtasks Toggle Button */}
            <Button
              size="small"
              startIcon={<ChecklistIcon sx={{ fontSize: 15 }} />}
              onClick={() => setShowSubtasks(!showSubtasks)}
              sx={{
                p: 0,
                minWidth: 'auto',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                color: subtasks.length > 0 ? '#4338CA' : '#64748B',
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {subtasks.length > 0
                ? `Subtasks (${completedSubtasks}/${subtasks.length})`
                : '+ Subtasks'}
            </Button>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={0.2} sx={{ ml: 'auto' }}>
          <Tooltip title="Edit Task">
            <IconButton
              size="small"
              onClick={() => onEdit(task)}
              sx={{
                p: 0.6,
                color: '#64748B',
                '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Task">
            <IconButton
              size="small"
              onClick={() => onDelete(task)}
              sx={{
                p: 0.6,
                color: '#64748B',
                '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Subtasks Collapsible Section */}
      <Collapse in={showSubtasks}>
        <Box sx={{ px: 2, pb: 2, pt: 1, bgcolor: '#F8FAFC', borderTop: '1px dashed #E2E8F0' }}>
          {/* Progress bar if subtasks exist */}
          {subtasks.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  SUBTASKS PROGRESS ({completedSubtasks}/{subtasks.length})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: subtaskPercent === 100 ? '#10B981' : '#4338CA' }}>
                  {subtaskPercent}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={subtaskPercent}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: subtaskPercent === 100 ? '#10B981' : '#4338CA',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}

          {/* Subtasks list */}
          <Stack spacing={0.6} sx={{ mb: 1.5 }}>
            {subtasks.map((st) => {
              const subId = st.id || st._id;
              const isEditing = editingSubtaskId === subId;

              if (isEditing) {
                return (
                  <Stack
                    key={subId}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 0.6,
                      px: 1,
                      borderRadius: '6px',
                      bgcolor: '#FFFDF5',
                      border: '1.5px solid #F59E0B',
                    }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      autoFocus
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEditSubtask(subId);
                        } else if (e.key === 'Escape') {
                          handleCancelEditSubtask();
                        }
                      }}
                      sx={{
                        bgcolor: '#FFFFFF',
                        '& input': { py: 0.5, px: 1, fontSize: '0.84rem' },
                      }}
                    />
                    <Tooltip title="Save (Enter)">
                      <IconButton
                        size="small"
                        onClick={() => handleSaveEditSubtask(subId)}
                        sx={{ color: '#16A34A', bgcolor: '#F0FDF4', '&:hover': { bgcolor: '#DCFCE7' } }}
                      >
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel (Esc)">
                      <IconButton
                        size="small"
                        onClick={handleCancelEditSubtask}
                        sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                );
              }

              return (
                <Stack
                  key={subId}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 0.8,
                    px: 1.2,
                    borderRadius: '6px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#FAFAFA',
                      '& .subtask-actions': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onDoubleClick={() => handleStartEditSubtask(st)}
                  >
                    <Checkbox
                      size="small"
                      checked={Boolean(st.completed)}
                      onChange={() => handleToggleSubtask(subId)}
                      sx={{ p: 0.2 }}
                    />
                    <Tooltip title="Double-click to edit subtask" placement="top-start">
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: st.completed ? 'text.secondary' : '#0F172A',
                          textDecoration: st.completed ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                        }}
                      >
                        {st.title}
                      </Typography>
                    </Tooltip>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    className="subtask-actions"
                    sx={{
                      opacity: { xs: 1, sm: 0.7 },
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <Tooltip title="Edit subtask">
                      <IconButton
                        size="small"
                        onClick={() => handleStartEditSubtask(st)}
                        sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete subtask">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSubtask(subId)}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>

          {/* Add Subtask input */}
          <form onSubmit={handleAddSubtask}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add subtask and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                sx={{
                  bgcolor: '#FFFFFF',
                  '& input': { py: 0.7, fontSize: '0.82rem' },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                disabled={!newSubtaskTitle.trim()}
                sx={{
                  borderRadius: '6px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                Add
              </Button>
            </Stack>
          </form>
        </Box>
      </Collapse>
    </Box>
  );
}
