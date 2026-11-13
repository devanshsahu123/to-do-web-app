import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Fab,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Card,
  IconButton,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SearchHeader from '../components/SearchHeader';
import WeeklyCard from '../components/WeeklyCard';
import TaskDialog from '../components/TaskDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import LoginModal from '../components/LoginModal';
import TaskItem from '../components/TaskItem';

export default function TodoListPage() {
  const { user, token, guestId, isGuest, loginWithEmail, registerWithEmail, continueAsGuest, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'In Progress', 'Completed', 'High Priority'
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // Modals state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch summary and tasks
  const fetchTasksData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getWeeklySummary({
        search: searchQuery,
        token,
        guestId,
      });

      if (res.success) {
        setWeeks(res.weeks || []);

        // Default expand the first or current week if not already set
        if (res.weeks && res.weeks.length > 0) {
          setExpandedWeeks((prev) => {
            if (Object.keys(prev).length === 0) {
              const now = new Date();
              const currentWeek = res.weeks.find((w) => {
                const start = new Date(w.weekStartDate);
                const end = new Date(w.weekEndDate);
                return now >= start && now <= end;
              });
              const keyToExpand = currentWeek ? currentWeek.weekKey : res.weeks[0].weekKey;
              return { [keyToExpand]: true };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      showSnackbar(err.message || 'Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, token, guestId]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Toggle week expansion (Clicking on week card expands it to show all tasks)
  const handleToggleWeekExpand = (weekKey) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      const res = await api.updateTask(taskToEdit._id, taskData, { token, guestId });
      if (res.success) {
        showSnackbar('Task updated successfully.');
        await fetchTasksData();
      }
    } else {
      const res = await api.createTask(taskData, { token, guestId });
      if (res.success) {
        showSnackbar('Task added successfully.');
        await fetchTasksData();
      }
    }
  };

  // Toggle task status (Completed <-> In Progress)
  const handleToggleStatus = async (taskId) => {
    try {
      const res = await api.toggleStatus(taskId, { token, guestId });
      if (res.success) {
        showSnackbar(res.message || 'Status updated.');
        await fetchTasksData();
      }
    } catch (err) {
      showSnackbar(err.message || 'Failed to update status', 'error');
    }
  };

  // Open Edit Task Dialog
  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setInitialDateForNewTask(null);
    setTaskDialogOpen(true);
  };

  // Open Add Task Dialog
  const handleOpenAdd = (initialDate = null) => {
    setTaskToEdit(null);
    setInitialDateForNewTask(initialDate);
    setTaskDialogOpen(true);
  };

  // Prompt delete
  const handlePromptDelete = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await api.deleteTask(taskToDelete._id, { token, guestId });
      if (res.success) {
        showSnackbar('Task deleted successfully.');
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
        await fetchTasksData();
      }
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete task', 'error');
    }
  };

  // Filter tasks and weeks according to statusFilter
  const filteredWeeks = useMemo(() => {
    if (statusFilter === 'All') {
      return weeks;
    }

    return weeks
      .map((week) => {
        let matchingTasks = week.tasks;
        if (statusFilter === 'In Progress') {
          matchingTasks = week.tasks.filter((t) => t.status !== 'Completed');
        } else if (statusFilter === 'Completed') {
          matchingTasks = week.tasks.filter((t) => t.status === 'Completed');
        } else if (statusFilter === 'High Priority') {
          matchingTasks = week.tasks.filter((t) => t.priority === 'High');
        }

        return {
          ...week,
          tasks: matchingTasks,
        };
      })
      .filter((week) => week.tasks.length > 0);
  }, [weeks, statusFilter]);

  // Overall totals
  const overallStats = useMemo(() => {
    let total = 0;
    let open = 0;
    let completed = 0;
    weeks.forEach((w) => {
      total += w.totalTasks || 0;
      open += w.openTasks || 0;
      completed += w.completedTasks || 0;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, open, completed, percent };
  }, [weeks]);

  // Search results flattened list (for instant search view if searching)
  const isSearchActive = Boolean(searchQuery.trim());
  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const results = [];
    weeks.forEach((w) => {
      w.tasks.forEach((t) => {
        results.push({ ...t, weekNumber: w.weekNumber });
      });
    });
    return results;
  }, [weeks, isSearchActive]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          p: { xs: 0.5, sm: 2 },
          position: 'relative',
        }}
      >
        {/* Search & Header */}
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          user={user}
          isGuest={isGuest}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onLogout={logout}
        />

        {/* Overall Progress Summary Bar */}
        {weeks.length > 0 && !isSearchActive && (
          <Card
            elevation={0}
            sx={{
              mb: 2.5,
              background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
              color: 'white',
              p: 2,
              borderRadius: 3.5,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600, letterSpacing: '0.05em' }}>
                  OVERALL PROGRESS
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.2 }}>
                  {overallStats.completed} of {overallStats.total} Tasks Completed
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={800}>
                  {overallStats.percent}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {overallStats.open} Remaining
                </Typography>
              </Box>
            </Stack>
          </Card>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} sx={{ color: 'primary.main' }} />
          </Box>
        ) : isSearchActive ? (
          /* Search Results View */
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
                Search Results for "{searchQuery}" ({searchResults.length})
              </Typography>
              <Button size="small" onClick={() => setSearchQuery('')} sx={{ fontSize: '0.75rem' }}>
                Clear Search
              </Button>
            </Stack>

            {searchResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#FFFFFF', borderRadius: 4, p: 3, border: '1px solid #E2E8F0' }}>
                <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" fontWeight={700}>
                  No matching tasks found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Try different keywords or create a new task.
                </Typography>
              </Box>
            ) : (
              searchResults.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDelete={handlePromptDelete}
                />
              ))
            )}
          </Box>
        ) : filteredWeeks.length === 0 ? (
          /* Empty state */
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: '#FFFFFF',
              borderRadius: 4,
              p: 4,
              border: '1px dashed #CBD5E1',
            }}
          >
            <PlaylistAddCheckIcon sx={{ fontSize: 56, color: 'primary.light', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 300, mx: 'auto' }}>
              Start by scheduling your first task. It will automatically be organized into its Monday-to-Sunday week!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdd()}
              sx={{ borderRadius: 3, py: 1.2, px: 3, fontWeight: 700 }}
            >
              Create First Task
            </Button>
          </Box>
        ) : (
          /* Weekly Cards List (PDF Key Feature 3.2: Weekly Organization) */
          <Box sx={{ mb: 8 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, px: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>
                WEEKS ({filteredWeeks.length}) • TAP CARD TO EXPAND
              </Typography>
              <IconButton size="small" onClick={fetchTasksData} sx={{ color: 'text.secondary' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Stack>

            {filteredWeeks.map((week) => (
              <WeeklyCard
                key={week.weekKey}
                weekData={week}
                isExpanded={Boolean(expandedWeeks[week.weekKey])}
                onToggleExpand={() => handleToggleWeekExpand(week.weekKey)}
                onToggleStatus={handleToggleStatus}
                onEditTask={handleOpenEdit}
                onDeleteTask={handlePromptDelete}
                onAddTaskForWeek={(date) => handleOpenAdd(date)}
              />
            ))}
          </Box>
        )}

        {/* Floating Action Button (Add Task) */}
        <Fab
          color="primary"
          aria-label="add task"
          onClick={() => handleOpenAdd()}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, sm: 32 },
            right: { xs: 24, sm: 'calc(50% - 240px)' },
            zIndex: 10,
            width: 58,
            height: 58,
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Container>

      {/* Task Dialog (Create / Edit) */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={taskToEdit}
        initialDate={initialDateForNewTask}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />

      {/* Login with Email & Guest Option Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onEmailLogin={async ({ email, password }) => {
          const res = await loginWithEmail({ email, password });
          if (res.success) {
            showSnackbar('Logged in successfully!');
            await fetchTasksData();
          } else {
            throw new Error(res.message);
          }
        }}
        onEmailRegister={async ({ email, password, name }) => {
          const res = await registerWithEmail({ email, password, name });
          if (res.success) {
            showSnackbar('Account created and logged in!');
            await fetchTasksData();
          } else {
            throw new Error(res.message);
          }
        }}
        onGuestLogin={async () => {
          await continueAsGuest();
          showSnackbar('Switched to Guest mode.');
          await fetchTasksData();
        }}
      />

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
