import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Fab,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SearchHeader from '../components/SearchHeader';
import WeeklyCard from '../components/WeeklyCard';
import TaskDialog from '../components/TaskDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import LoginModal from '../components/LoginModal';
import TaskItem from '../components/TaskItem';
import OverviewCards from '../components/OverviewCards';
import CategoryChips from '../components/CategoryChips';
import SidebarDrawer from '../components/SidebarDrawer';
import OverallProgressCard from '../components/OverallProgressCard';
import CalendarModal from '../components/CalendarModal';
import {
  isTaskForToday,
  isTaskForTomorrow,
  isTaskForThisWeek,
  isTaskForThisMonth,
  isTaskScheduledForDate,
} from '../utils/taskDateUtils';

export default function TodoListPage() {
  const {
    user,
    token,
    guestId,
    isGuest,
    sendOtp,
    verifyOtp,
    resendOtp,
    continueAsGuest,
    logout,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  // If not authenticated and not guest, redirect to separate login page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/to-do/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'In Progress', 'Completed', 'High Priority'
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // Category, Overview and Calendar filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [overviewFilter, setOverviewFilter] = useState('all'); // 'all', 'today', 'tomorrow', 'week', 'month', 'completed'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // User categories state
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('todo_categories');
      return saved ? JSON.parse(saved) : ['Work', 'Personal', 'WishList'];
    } catch (_) {
      return ['Work', 'Personal', 'WishList'];
    }
  });

  const handleAddCategory = (newCat) => {
    if (!categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      try {
        localStorage.setItem('todo_categories', JSON.stringify(updated));
      } catch (_) {}
    }
  };

  const handleEditCategory = async (oldName, newName) => {
    try {
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName) return;

      const updated = categories.map((c) => (c === oldName ? trimmed : c));
      setCategories(updated);
      try {
        localStorage.setItem('todo_categories', JSON.stringify(updated));
      } catch (_) {}

      if (selectedCategory === oldName) {
        setSelectedCategory(trimmed);
      }

      // Optimistically update tasks in state immediately
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          tasks: (week.tasks || []).map((t) =>
            t.category === oldName ? { ...t, category: trimmed } : t
          ),
        }))
      );

      showSnackbar(`Category '${oldName}' renamed to '${trimmed}'.`);

      try {
        await api.renameCategory({
          oldCategory: oldName,
          newCategory: trimmed,
          token,
          guestId,
        });
        await fetchTasksData();
      } catch (apiErr) {
        console.warn('Backend rename sync notice:', apiErr);
      }
    } catch (err) {
      console.error('Failed to rename category:', err);
      showSnackbar(err.message || 'Failed to rename category', 'error');
    }
  };

  const handleDeleteCategory = async (catToDelete, fallbackCat = 'Work') => {
    try {
      if (categories.length <= 1) {
        showSnackbar('You must keep at least one category.', 'error');
        return;
      }

      const updated = categories.filter((c) => c !== catToDelete);
      setCategories(updated);
      try {
        localStorage.setItem('todo_categories', JSON.stringify(updated));
      } catch (_) {}

      if (selectedCategory === catToDelete) {
        setSelectedCategory('All');
      }

      // Optimistically reassign tasks in state immediately
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          tasks: (week.tasks || []).map((t) =>
            t.category === catToDelete ? { ...t, category: fallbackCat } : t
          ),
        }))
      );

      showSnackbar(`Category '${catToDelete}' deleted. Tasks reassigned to '${fallbackCat}'.`);

      try {
        await api.deleteCategory({
          category: catToDelete,
          fallbackCategory: fallbackCat,
          token,
          guestId,
        });
        await fetchTasksData();
      } catch (apiErr) {
        console.warn('Backend delete sync notice:', apiErr);
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      showSnackbar(err.message || 'Failed to delete category', 'error');
    }
  };

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
        category: selectedCategory,
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
  }, [searchQuery, selectedCategory, token, guestId]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Toggle week expansion
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

  // Update subtasks
  const handleUpdateSubtasks = async (taskId, updatedSubtasks) => {
    try {
      // Optimistically update local state
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          tasks: week.tasks.map((t) =>
            t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t
          ),
        }))
      );
      await api.updateTask(taskId, { subtasks: updatedSubtasks }, { token, guestId });
    } catch (err) {
      console.error('Subtask update error:', err);
      showSnackbar(err.message || 'Failed to update subtasks', 'error');
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

  // Flattened all tasks for OverviewCards
  const allTasks = useMemo(() => {
    const list = [];
    weeks.forEach((w) => {
      (w.tasks || []).forEach((t) => list.push(t));
    });
    return list;
  }, [weeks]);

  // Real-time task counts for views and categories in Sidebar
  const taskCounts = useMemo(() => {
    const counts = {
      all: allTasks.length,
      today: 0,
      tomorrow: 0,
      week: 0,
      month: 0,
      completed: 0,
      categories: {},
    };

    allTasks.forEach((t) => {
      if (t.status === 'Completed') counts.completed += 1;

      if (isTaskForToday(t)) counts.today += 1;
      if (isTaskForTomorrow(t)) counts.tomorrow += 1;
      if (isTaskForThisWeek(t)) counts.week += 1;
      if (isTaskForThisMonth(t)) counts.month += 1;

      const cat = t.category || 'Work';
      counts.categories[cat] = (counts.categories[cat] || 0) + 1;
    });

    return counts;
  }, [allTasks]);

  // Day View detection for Today, Tomorrow, or selected Calendar Date
  const isDayView = Boolean(
    selectedCalendarDate || overviewFilter === 'today' || overviewFilter === 'tomorrow'
  );

  const dayViewTargetDate = useMemo(() => {
    if (selectedCalendarDate) return selectedCalendarDate;
    if (overviewFilter === 'today') return new Date();
    if (overviewFilter === 'tomorrow') {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      return tom;
    }
    return null;
  }, [selectedCalendarDate, overviewFilter]);

  const dayViewTitle = useMemo(() => {
    if (selectedCalendarDate) {
      return `Tasks for ${selectedCalendarDate.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    if (overviewFilter === 'today') {
      return `Today's Tasks • ${new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })}`;
    }
    if (overviewFilter === 'tomorrow') {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      return `Tomorrow's Tasks • ${tom.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })}`;
    }
    return '';
  }, [selectedCalendarDate, overviewFilter]);

  // Tasks for day view (including recurrence matching that specific day)
  const dayViewTasks = useMemo(() => {
    if (!isDayView || !dayViewTargetDate) return [];

    let list = allTasks.filter((t) => isTaskScheduledForDate(t, dayViewTargetDate));

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(
        (t) => (t.category || 'Work').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter === 'In Progress') {
      list = list.filter((t) => t.status !== 'Completed');
    } else if (statusFilter === 'Completed') {
      list = list.filter((t) => t.status === 'Completed');
    } else if (statusFilter === 'High Priority') {
      list = list.filter((t) => t.priority === 'High');
    }

    return list;
  }, [isDayView, dayViewTargetDate, allTasks, selectedCategory, statusFilter]);

  // Filter tasks and weeks for Roadmap view (All, This Week, Monthly)
  const filteredWeeks = useMemo(() => {
    return weeks
      .map((week) => {
        const weekStart = new Date(week.weekStartDate);

        // Collect all tasks belonging to this week, including recurring tasks from allTasks
        const weekTaskMap = new Map();
        (week.tasks || []).forEach((t) => weekTaskMap.set(t._id, t));

        // Incorporate recurring tasks that occur during this week's 7 days
        allTasks.forEach((t) => {
          if (!weekTaskMap.has(t._id) && t.recurrence && t.recurrence.type !== 'None') {
            for (let i = 0; i < 7; i++) {
              const d = new Date(weekStart);
              d.setDate(weekStart.getDate() + i);
              if (isTaskScheduledForDate(t, d)) {
                weekTaskMap.set(t._id, t);
                break;
              }
            }
          }
        });

        let matchingTasks = Array.from(weekTaskMap.values());

        // Category filter
        if (selectedCategory !== 'All') {
          matchingTasks = matchingTasks.filter(
            (t) => (t.category || 'Work').toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        // Status filter
        if (statusFilter === 'In Progress') {
          matchingTasks = matchingTasks.filter((t) => t.status !== 'Completed');
        } else if (statusFilter === 'Completed') {
          matchingTasks = matchingTasks.filter((t) => t.status === 'Completed');
        } else if (statusFilter === 'High Priority') {
          matchingTasks = matchingTasks.filter((t) => t.priority === 'High');
        }

        if (overviewFilter === 'week') {
          matchingTasks = matchingTasks.filter(isTaskForThisWeek);
        } else if (overviewFilter === 'month') {
          matchingTasks = matchingTasks.filter(isTaskForThisMonth);
        } else if (overviewFilter === 'completed') {
          matchingTasks = matchingTasks.filter((t) => t.status === 'Completed');
        }

        const openCount = matchingTasks.filter((t) => t.status !== 'Completed').length;
        const doneCount = matchingTasks.filter((t) => t.status === 'Completed').length;

        return {
          ...week,
          openTasks: openCount,
          completedTasks: doneCount,
          totalTasks: matchingTasks.length,
          tasks: matchingTasks,
        };
      })
      .filter((week) => week.tasks.length > 0);
  }, [weeks, allTasks, selectedCategory, statusFilter, overviewFilter]);

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

  // Search results flattened list
  const isSearchActive = Boolean(searchQuery.trim());
  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const results = [];
    weeks.forEach((w) => {
      (w.tasks || []).forEach((t) => {
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
        display: 'flex',
      }}
    >
      {/* Side Navigation (Permanent on Desktop, Drawer on Mobile) */}
      <SidebarDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeFilter={overviewFilter}
        onSelectFilter={setOverviewFilter}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        user={user}
        isGuest={isGuest}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={() => {
          logout();
          navigate('/to-do/login');
        }}
        onOpenAddTask={() => handleOpenAdd()}
        onOpenCalendar={() => setCalendarOpen(true)}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        taskCounts={taskCounts}
      />

      {/* Main Content Workspace */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          py: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 3, md: 4, lg: 5 },
          maxWidth: { xs: '100%', md: 1050, lg: 1150 },
          mx: 'auto',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Search & Header with Sidebar Hamburger Trigger */}
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          user={user}
          isGuest={isGuest}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onLogout={() => {
            logout();
            navigate('/to-do/login');
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddTask={() => handleOpenAdd()}
          onOpenCalendar={() => setCalendarOpen(true)}
        />

        {/* Top Overview Cards: Today's Tasks, Tomorrow's Tasks, This Week's Tasks, Monthly Tasks */}
        {!isSearchActive && (
          <OverviewCards
            tasks={allTasks}
            activeFilter={overviewFilter}
            onSelectFilter={(f) => {
              setSelectedCalendarDate(null);
              setOverviewFilter(f);
            }}
            onOpenCalendar={() => setCalendarOpen(true)}
          />
        )}

        {/* Category Chips: Work, Personal, WishList, + Add, Manage */}
        {!isSearchActive && (
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            taskCounts={taskCounts}
          />
        )}

        {/* Active Filter indicator banner (if overviewFilter or calendar date is active) */}
        {(overviewFilter !== 'all' || selectedCalendarDate) && !isSearchActive && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              px: 2,
              mb: 2,
              borderRadius: '8px',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E40AF' }}>
              {selectedCalendarDate
                ? `Showing Tasks for ${selectedCalendarDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
                : `Showing ${
                    overviewFilter === 'today'
                      ? "Today's"
                      : overviewFilter === 'tomorrow'
                      ? "Tomorrow's"
                      : overviewFilter === 'week'
                      ? "This Week's"
                      : overviewFilter === 'month'
                      ? "This Month's"
                      : 'Completed'
                  } Tasks`}{' '}
              ({isDayView ? dayViewTasks.length : filteredWeeks.reduce((acc, w) => acc + w.tasks.length, 0)})
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setOverviewFilter('all');
                setSelectedCalendarDate(null);
              }}
              sx={{ fontSize: '0.72rem', py: 0.2, minWidth: 'auto', fontWeight: 700 }}
            >
              Reset Filter
            </Button>
          </Box>
        )}

        {/* Overall Progress Summary with Annual 2026 Stamp */}
        {weeks.length > 0 && !isSearchActive && !isDayView && (
          <OverallProgressCard
            stats={overallStats}
            totalWeeks={weeks.length}
            currentYear={2026}
          />
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
                  onUpdateSubtasks={handleUpdateSubtasks}
                />
              ))
            )}
          </Box>
        ) : isDayView ? (
          /* Dedicated Day View (Today, Tomorrow, or Specific Calendar Date) */
          <Box sx={{ mb: 8 }}>
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: overviewFilter === 'today' ? '#FEF2F2' : '#FFFDF5',
                      color: overviewFilter === 'today' ? '#DC2626' : '#D97706',
                    }}
                  >
                    {overviewFilter === 'today' ? (
                      <TodayIcon sx={{ fontSize: 22 }} />
                    ) : (
                      <EventIcon sx={{ fontSize: 22 }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      {dayViewTitle}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={`${dayViewTasks.filter((t) => t.status !== 'Completed').length} Open`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: '#FEF2F2',
                          color: '#DC2626',
                          borderRadius: '6px',
                        }}
                      />
                      <Chip
                        label={`${dayViewTasks.filter((t) => t.status === 'Completed').length} Completed`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: '#F0FDF4',
                          color: '#16A34A',
                          borderRadius: '6px',
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAdd(dayViewTargetDate)}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderColor: '#E2E8F0',
                    color: '#0F172A',
                    '&:hover': {
                      borderColor: '#DC2626',
                      color: '#DC2626',
                      bgcolor: '#FFF8F8',
                    },
                  }}
                >
                  Add Task for this day
                </Button>
              </Stack>
            </Box>

            {dayViewTasks.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  bgcolor: '#FFFFFF',
                  borderRadius: 3,
                  p: 4,
                  border: '1px dashed #CBD5E1',
                }}
              >
                <PlaylistAddCheckIcon sx={{ fontSize: 52, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>
                  No tasks scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 360, mx: 'auto' }}>
                  There are no tasks scheduled for this day under the selected filters. Plan ahead and add one!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAdd(dayViewTargetDate)}
                  sx={{ borderRadius: 2.5, py: 1, px: 2.5, fontWeight: 700 }}
                >
                  Add Task
                </Button>
              </Box>
            ) : (
              dayViewTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDelete={handlePromptDelete}
                  onUpdateSubtasks={handleUpdateSubtasks}
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
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 300, mx: 'auto' }}>
              {selectedCategory !== 'All'
                ? `No tasks under "${selectedCategory}". Create one or switch category!`
                : overviewFilter !== 'all'
                ? `No tasks matching the selected timeline. Schedule a new task!`
                : 'Start by scheduling your first task!'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdd()}
              sx={{ borderRadius: 3, py: 1.2, px: 3, fontWeight: 700 }}
            >
              Create Task
            </Button>
          </Box>
        ) : (
          /* Weekly Cards List */
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
                isExpanded={Boolean(overviewFilter !== 'all' || expandedWeeks[week.weekKey])}
                onToggleExpand={() => handleToggleWeekExpand(week.weekKey)}
                onToggleStatus={handleToggleStatus}
                onEditTask={handleOpenEdit}
                onDeleteTask={handlePromptDelete}
                onAddTaskForWeek={(date) => handleOpenAdd(date)}
                onUpdateSubtasks={handleUpdateSubtasks}
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
            right: { xs: 24, sm: 32 },
            zIndex: 10,
            width: 58,
            height: 58,
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>

      {/* Interactive Calendar Modal (Check Tomorrow, Today, or Browse Dates) */}
      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        tasks={allTasks}
        onSelectDateFilter={(d) => {
          setSelectedCalendarDate(d);
          setOverviewFilter('all');
        }}
        onAddTaskForDate={(d) => {
          handleOpenAdd(d);
        }}
      />

      {/* Task Dialog (Create / Edit) */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={taskToEdit}
        initialDate={initialDateForNewTask}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />

      {/* Login with Email OTP & Guest Option Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSendOtp={sendOtp}
        onVerifyOtp={async ({ email, otp, name }) => {
          const res = await verifyOtp({ email, otp, name });
          if (res.success) {
            showSnackbar('Logged in successfully!');
            await fetchTasksData();
          } else {
            throw new Error(res.message);
          }
        }}
        onResendOtp={resendOtp}
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
