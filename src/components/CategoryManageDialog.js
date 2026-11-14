import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

export default function CategoryManageDialog({
  open,
  onClose,
  categories = ['Work', 'Personal', 'WishList'],
  taskCounts = { categories: {} },
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  initialEditingCategory = null,
  initialDeletingCategory = null,
  onClearInitialTargets,
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingCategory, setDeletingCategory] = useState(null);
  const [fallbackCategory, setFallbackCategory] = useState('Work');

  const [newCatName, setNewCatName] = useState('');
  const [addError, setAddError] = useState('');

  // When dialog opens or target changes from props, initialize state
  useEffect(() => {
    if (open) {
      if (initialEditingCategory) {
        setEditingCategory(initialEditingCategory);
        setEditValue(initialEditingCategory);
      } else {
        setEditingCategory(null);
        setEditValue('');
      }

      if (initialDeletingCategory) {
        setDeletingCategory(initialDeletingCategory);
        const remaining = categories.filter((c) => c !== initialDeletingCategory);
        setFallbackCategory(remaining[0] || 'Work');
      } else {
        setDeletingCategory(null);
      }
      setEditError('');
      setAddError('');
    } else {
      setEditingCategory(null);
      setDeletingCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialEditingCategory, initialDeletingCategory]);

  const handleClose = () => {
    setEditingCategory(null);
    setDeletingCategory(null);
    setEditError('');
    setAddError('');
    if (onClearInitialTargets) {
      onClearInitialTargets();
    }
    onClose();
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'Work') return <WorkOutlinedIcon fontSize="small" sx={{ color: '#2563EB' }} />;
    if (cat === 'Personal') return <PersonOutlineIcon fontSize="small" sx={{ color: '#7C3AED' }} />;
    if (cat === 'WishList') return <FavoriteBorderIcon fontSize="small" sx={{ color: '#D97706' }} />;
    return <LabelOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />;
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError('Category name cannot be empty.');
      return;
    }
    if (
      trimmed.toLowerCase() !== editingCategory.toLowerCase() &&
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setEditError('A category with this name already exists.');
      return;
    }

    const oldCat = editingCategory;
    setEditingCategory(null);
    setEditValue('');
    setEditError('');
    if (onClearInitialTargets) {
      onClearInitialTargets();
    }

    if (onEditCategory && oldCat) {
      await onEditCategory(oldCat, trimmed);
    }
  };

  const handleStartDelete = (cat) => {
    if (categories.length <= 1) {
      setEditError('You must keep at least one category.');
      return;
    }
    setDeletingCategory(cat);
    const remaining = categories.filter((c) => c !== cat);
    setFallbackCategory(remaining[0] || 'Work');
  };

  const handleConfirmDelete = async () => {
    const cat = deletingCategory;
    const fb = fallbackCategory;
    setDeletingCategory(null);
    if (onClearInitialTargets) {
      onClearInitialTargets();
    }

    if (onDeleteCategory && cat) {
      await onDeleteCategory(cat, fb);
    }
  };

  const handleCreateNew = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setAddError('Category name cannot be empty.');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAddError('Category already exists.');
      return;
    }
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    setNewCatName('');
    setAddError('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          fontWeight: 800,
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          {deletingCategory ? 'Delete Category' : 'Manage Categories'}
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {/* Delete Confirmation View */}
        {deletingCategory ? (
          <Box sx={{ py: 1 }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
              Are you sure you want to delete category <b>"{deletingCategory}"</b>?
            </Alert>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Tasks currently in "{deletingCategory}" (
              {taskCounts.categories?.[deletingCategory] || 0} tasks) will be reallocated to:
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel id="fallback-cat-label">Reassign Tasks To</InputLabel>
              <Select
                labelId="fallback-cat-label"
                value={fallbackCategory}
                label="Reassign Tasks To"
                onChange={(e) => setFallbackCategory(e.target.value)}
              >
                {categories
                  .filter((c) => c !== deletingCategory)
                  .map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setDeletingCategory(null);
                  if (onClearInitialTargets) onClearInitialTargets();
                }}
                sx={{ textTransform: 'none', borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                Confirm Delete
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
              EXISTING CATEGORIES ({categories.length})
            </Typography>

            <List dense sx={{ bgcolor: '#F8FAFC', borderRadius: '10px', p: 1, border: '1px solid #E2E8F0', mb: 2.5 }}>
              {categories.map((cat) => {
                const isEditing = editingCategory === cat;
                const count = taskCounts.categories?.[cat] || 0;

                return (
                  <ListItem
                    key={cat}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #F1F5F9',
                      py: 0.8,
                      px: 1.5,
                    }}
                    secondaryAction={
                      isEditing ? (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingCategory(null)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            label={`${count} tasks`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '6px',
                              mr: 0.5,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(cat)}
                            title="Edit Category Name"
                            sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleStartDelete(cat)}
                            title="Delete Category"
                            disabled={categories.length <= 1}
                            sx={{ color: '#64748B', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>{getCategoryIcon(cat)}</ListItemIcon>

                    {isEditing ? (
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <TextField
                          autoFocus
                          size="small"
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            setEditError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                          error={Boolean(editError)}
                          helperText={editError}
                          sx={{ '& input': { py: 0.6, fontSize: '0.85rem' } }}
                        />
                      </Box>
                    ) : (
                      <ListItemText
                        primary={cat}
                        primaryTypographyProps={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#0F172A',
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Add New Category */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
              CREATE NEW CATEGORY
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Fitness, Groceries, Study"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setAddError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateNew();
                  }
                }}
                error={Boolean(addError)}
                helperText={addError}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{
                  bgcolor: '#DC2626',
                  borderRadius: '8px',
                  py: 1,
                  px: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                Add
              </Button>
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderRadius: '8px', textTransform: 'none' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
