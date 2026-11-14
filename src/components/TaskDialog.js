import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RepeatIcon from '@mui/icons-material/Repeat';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

// Format Date object to "YYYY-MM-DDTHH:mm" for datetime-local input
const toDateTimeLocalString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Calculate nearest occurrence date for repeating days
const getFirstOccurrenceDate = (days) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentDayIdx = today.getDay();
  const targetIndices = (days || [])
    .map((d) => dayNames.indexOf(d))
    .filter((idx) => idx !== -1);

  if (targetIndices.length === 0) {
    return today;
  }

  let minDiff = 7;
  targetIndices.forEach((targetIdx) => {
    const diff = (targetIdx - currentDayIdx + 7) % 7;
    if (diff < minDiff) {
      minDiff = diff;
    }
  });

  const targetDate = new Date();
  targetDate.setDate(today.getDate() + (minDiff === 7 ? 0 : minDiff));
  targetDate.setHours(10, 0, 0, 0);
  return targetDate;
};

const priorities = [
  { value: 'Low', label: 'Low', color: '#10B981', bg: '#D1FAE5' },
  { value: 'Medium', label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'High', label: 'High', color: '#EF4444', bg: '#FEE2E2' },
];

export default function TaskDialog({
  open,
  onClose,
  onSave,
  task = null,
  initialDate = null,
  categories = ['Work', 'Personal', 'WishList'],
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work');
  const [repeatMode, setRepeatMode] = useState('None'); // 'None' | 'Repeat'
  const [repeatDays, setRepeatDays] = useState([]); // ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [status, setStatus] = useState('In Progress');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(toDateTimeLocalString(task.dueDate));
      setPriority(task.priority || 'Medium');
      setCategory(task.category || 'Work');
      const hasRecurrence = task.recurrence?.type && task.recurrence.type !== 'None';
      setRepeatMode(hasRecurrence ? 'Repeat' : 'None');
      setRepeatDays(task.recurrence?.days || []);
      setStatus(task.status || 'In Progress');
      setSubtasks(task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : []);
    } else {
      setTitle('');
      setDescription('');
      // Default to initialDate or 1 hour from now
      const defaultDate = initialDate ? new Date(initialDate) : new Date(Date.now() + 60 * 60 * 1000);
      setDueDate(toDateTimeLocalString(defaultDate));
      setPriority('Medium');
      setCategory('Work');
      setRepeatMode('None');
      setRepeatDays([]);
      setStatus('In Progress');
      setSubtasks([]);
    }
    setNewSubtaskInput('');
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
    setError('');
    setSaving(false);
  }, [task, initialDate, open]);

  const handleToggleDay = (day) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskInput.trim()) return;
    const newSt = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      title: newSubtaskInput.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskInput('');
  };

  const handleToggleSubtask = (subId) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === subId || s._id === subId ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const handleDeleteSubtask = (subId) => {
    if (editingSubtaskId === subId) {
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
    }
    setSubtasks(subtasks.filter((s) => s.id !== subId && s._id !== subId));
  };

  const handleStartEditSubtask = (st) => {
    setEditingSubtaskId(st.id || st._id);
    setEditingSubtaskTitle(st.title || '');
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleSaveEditSubtask = (subId) => {
    if (!editingSubtaskTitle.trim()) return;
    setSubtasks(
      subtasks.map((s) =>
        s.id === subId || s._id === subId
          ? { ...s, title: editingSubtaskTitle.trim() }
          : s
      )
    );
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is mandatory.');
      return;
    }

    let finalDueDate;
    if (repeatMode === 'Repeat') {
      if (repeatDays.length === 0) {
        setError('Please select at least one day for repeat recurrence.');
        return;
      }
      finalDueDate = getFirstOccurrenceDate(repeatDays).toISOString();
    } else {
      if (!dueDate) {
        setError('Date & Time is mandatory.');
        return;
      }
      finalDueDate = new Date(dueDate).toISOString();
    }

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate: finalDueDate,
        priority,
        category: category || 'Work',
        recurrence: {
          type: repeatMode === 'Repeat' ? (repeatDays.length === 7 ? 'Daily' : 'Weekly') : 'None',
          days: repeatMode === 'Repeat' ? repeatDays : [],
          interval: 1,
        },
        subtasks,
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const setQuickDate = (daysAhead, hours = 10) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, 0, 0, 0);
    setDueDate(toDateTimeLocalString(d));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: 4 },
          m: { xs: 0, sm: 2 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          width: { xs: '100%', sm: 'auto' },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {task ? 'Edit Task' : 'Create New Task'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* Title (Mandatory) */}
            <TextField
              label="Task Title *"
              placeholder="e.g. Weekly team meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              autoFocus
              variant="outlined"
              size="medium"
              helperText="Mandatory field"
            />

            {/* Description (Optional) */}
            <TextField
              label="Description (Optional)"
              placeholder="Add extra details, notes, or agenda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />

            {/* Repeat / Recurrence (Placed on top of Date & Time) */}
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <RepeatIcon sx={{ color: '#DC2626', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  REPEAT / RECURRENCE
                </Typography>
              </Stack>

              {/* Simplified Selection Bar: Only "Do not repeat" and "Repeat" */}
              <FormControl fullWidth size="small">
                <InputLabel id="repeat-mode-label">Repeat</InputLabel>
                <Select
                  labelId="repeat-mode-label"
                  value={repeatMode}
                  label="Repeat"
                  onChange={(e) => {
                    const val = e.target.value;
                    setRepeatMode(val);
                    if (val === 'Repeat') {
                      if (repeatDays.length === 0) {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const d = dueDate ? new Date(dueDate) : new Date();
                        const dayIndex = isNaN(d.getTime()) ? 1 : d.getDay();
                        setRepeatDays([dayNames[dayIndex]]);
                      }
                    } else {
                      setRepeatDays([]);
                    }
                  }}
                >
                  <MenuItem value="None">Do not repeat</MenuItem>
                  <MenuItem value="Repeat">Repeat</MenuItem>
                </Select>
              </FormControl>

              {/* Only show days if "Repeat" is selected */}
              {repeatMode === 'Repeat' && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                    SELECT REPEAT DAYS:
                  </Typography>
                  <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
                      const isSelected = repeatDays.includes(d);
                      return (
                        <Chip
                          key={d}
                          label={d}
                          size="small"
                          onClick={() => handleToggleDay(d)}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            bgcolor: isSelected ? '#DC2626' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            borderColor: isSelected ? '#DC2626' : '#CBD5E1',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: isSelected ? '#B91C1C' : '#F1F5F9',
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>
                  <Typography variant="caption" sx={{ color: repeatDays.length > 0 ? '#4F46E5' : '#EF4444', fontWeight: 600, display: 'block', mt: 1 }}>
                    {repeatDays.length > 0
                      ? `Repeats on: ${repeatDays.join(', ')}`
                      : 'Please select at least one day of the week'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Date & Time (Only shown for non-repeating tasks) */}
            {repeatMode !== 'Repeat' && (
              <Box>
                <TextField
                  label="Date & Time *"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Mandatory: specifies day and week grouping"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label="Today"
                    icon={<CalendarMonthIcon fontSize="small" />}
                    onClick={() => setQuickDate(0, 18)}
                    clickable
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label="Tomorrow"
                    onClick={() => setQuickDate(1, 10)}
                    clickable
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label="Next Monday"
                    onClick={() => {
                      const d = new Date();
                      const day = d.getDay();
                      const diff = (8 - day) % 7 || 7;
                      setQuickDate(diff, 10);
                    }}
                    clickable
                    variant="outlined"
                  />
                </Stack>
              </Box>
            )}

            {/* Category Selector */}
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Priority (Optional) */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                PRIORITY (OPTIONAL)
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {priorities.map((p) => {
                  const isSelected = priority === p.value;
                  return (
                    <Chip
                      key={p.value}
                      icon={<FlagIcon sx={{ color: isSelected ? p.color : 'text.disabled' }} />}
                      label={p.label}
                      onClick={() => setPriority(p.value)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        flex: 1,
                        py: 2.2,
                        borderRadius: 2.5,
                        borderColor: isSelected ? p.color : '#E2E8F0',
                        bgcolor: isSelected ? p.bg : 'transparent',
                        color: isSelected ? p.color : 'text.primary',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: isSelected ? p.bg : '#F1F5F9',
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Status (when editing) */}
            {task && (
              <FormControl fullWidth size="small">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="In Progress">In Progress (Open)</MenuItem>
                  <MenuItem value="Completed">Completed (Closed)</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Subtasks / Checklist */}
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ChecklistIcon sx={{ fontSize: 18, color: '#4338CA' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', letterSpacing: '0.04em' }}>
                    SUBTASKS / CHECKLIST
                  </Typography>
                </Stack>
                {subtasks.length > 0 && (
                  <Chip
                    label={`${subtasks.filter((s) => s.completed).length}/${subtasks.length} Done`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: '#EEF2FF',
                      color: '#4338CA',
                    }}
                  />
                )}
              </Stack>

              {/* Subtasks items list */}
              {subtasks.length > 0 && (
                <Stack spacing={0.8} sx={{ mb: 1.5 }}>
                  {subtasks.map((st) => {
                    const subId = st.id || st._id;
                    const isEditing = editingSubtaskId === subId;

                    if (isEditing) {
                      return (
                        <Stack
                          key={subId}
                          direction="row"
                          alignItems="center"
                          spacing={0.8}
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
                              '& input': { py: 0.4, px: 0.8, fontSize: '0.82rem' },
                            }}
                          />
                          <Tooltip title="Save (Enter)">
                            <IconButton
                              size="small"
                              onClick={() => handleSaveEditSubtask(subId)}
                              sx={{ color: '#16A34A', bgcolor: '#F0FDF4' }}
                            >
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel (Esc)">
                            <IconButton
                              size="small"
                              onClick={handleCancelEditSubtask}
                              sx={{ color: '#64748B' }}
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
                          p: 0.7,
                          px: 1,
                          borderRadius: '6px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          '&:hover': {
                            bgcolor: '#FAFAFA',
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
                                fontSize: '0.82rem',
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
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit subtask">
                            <IconButton
                              size="small"
                              onClick={() => handleStartEditSubtask(st)}
                              sx={{ color: '#64748B', '&:hover': { color: '#2563EB' } }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete subtask">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSubtask(subId)}
                              sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626' } }}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              )}

              {/* Add subtask input */}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add a subtask and press Enter..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                  sx={{
                    bgcolor: '#FFFFFF',
                    '& input': { py: 0.6, fontSize: '0.82rem' },
                  }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddSubtask}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    '&:hover': {
                      borderColor: '#4338CA',
                      color: '#4338CA',
                      bgcolor: '#EEF2FF',
                    },
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ px: 4, py: 1.2, fontWeight: 600 }}
          >
            {saving ? 'Saving...' : task ? 'Save Changes' : 'Save Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

