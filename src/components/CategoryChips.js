import React, { useState } from 'react';
import {
  Box,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import TuneIcon from '@mui/icons-material/Tune';

import CategoryManageDialog from './CategoryManageDialog';

export const categoryStyles = {
  Work: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: <WorkOutlinedIcon sx={{ fontSize: 16 }} /> },
  Personal: { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: <PersonOutlineIcon sx={{ fontSize: 16 }} /> },
  WishList: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <FavoriteBorderIcon sx={{ fontSize: 16 }} /> },
  Default: { color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB', icon: <LabelOutlinedIcon sx={{ fontSize: 16 }} /> },
};

export default function CategoryChips({
  categories = ['Work', 'Personal', 'WishList'],
  selectedCategory = 'All',
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  taskCounts = { categories: {} },
}) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [initialEditCat, setInitialEditCat] = useState(null);

  const handleOpenAdd = () => {
    setInitialEditCat(null);
    setManageDialogOpen(true);
  };

  return (
    <Box sx={{ mb: 2.2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          '::-webkit-scrollbar': { height: 3 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: 2 },
        }}
      >
        {/* 'All' chip */}
        <Chip
          label="All"
          onClick={() => onSelectCategory('All')}
          variant={selectedCategory === 'All' ? 'filled' : 'outlined'}
          size="medium"
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            borderRadius: '8px',
            px: 0.5,
            bgcolor: selectedCategory === 'All' ? '#1E293B' : '#FFFFFF',
            color: selectedCategory === 'All' ? '#FFFFFF' : '#475569',
            borderColor: selectedCategory === 'All' ? '#1E293B' : '#E2E8F0',
            '&:hover': {
              bgcolor: selectedCategory === 'All' ? '#0F172A' : '#F8FAFC',
            },
          }}
        />

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const conf = categoryStyles[cat] || categoryStyles.Default;

          return (
            <Chip
              key={cat}
              icon={React.cloneElement(conf.icon, {
                style: { color: isSelected ? '#FFFFFF' : conf.color, marginLeft: 6 },
              })}
              label={cat}
              onClick={() => onSelectCategory(cat)}
              variant={isSelected ? 'filled' : 'outlined'}
              size="medium"
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '8px',
                px: 0.5,
                bgcolor: isSelected ? conf.color : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : conf.color,
                borderColor: isSelected ? conf.color : conf.border,
                '&:hover': {
                  bgcolor: isSelected ? conf.color : conf.bg,
                },
              }}
            />
          );
        })}

        {/* '+ Add' Category Chip */}
        <Chip
          icon={<AddIcon sx={{ fontSize: 16 }} />}
          label="Add"
          onClick={handleOpenAdd}
          variant="outlined"
          size="medium"
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            borderRadius: '8px',
            borderColor: '#CBD5E1',
            borderStyle: 'dashed',
            color: '#475569',
            bgcolor: '#FFFFFF',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#F8FAFC',
              borderColor: '#DC2626',
              color: '#DC2626',
            },
          }}
        />

        {/* 'Manage Categories' Chip (Edit / Delete / Reorder) */}
        <Chip
          icon={<TuneIcon sx={{ fontSize: 15 }} />}
          label="Manage"
          onClick={() => {
            setInitialEditCat(null);
            setManageDialogOpen(true);
          }}
          variant="outlined"
          size="medium"
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            borderRadius: '8px',
            borderColor: '#E2E8F0',
            color: '#64748B',
            bgcolor: '#FFFFFF',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#F8FAFC',
              borderColor: '#94A3B8',
              color: '#0F172A',
            },
          }}
        />
      </Stack>

      {/* Category Management Dialog (Add, Edit, Delete) */}
      <CategoryManageDialog
        open={manageDialogOpen}
        onClose={() => {
          setManageDialogOpen(false);
          setInitialEditCat(null);
        }}
        categories={categories}
        taskCounts={taskCounts}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        initialEditingCategory={initialEditCat}
      />
    </Box>
  );
}
