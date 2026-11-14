import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Card,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShopIcon from '@mui/icons-material/Shop';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import CategoryManageDialog from './CategoryManageDialog';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=to.doo&pcampaignid=web_share';

export default function SidebarDrawer({
  open,
  onClose,
  activeFilter = 'all',
  onSelectFilter,
  selectedCategory = 'All',
  onSelectCategory,
  categories = ['Work', 'Personal', 'WishList'],
  user,
  isGuest,
  onOpenLoginModal,
  onLogout,
  onOpenAddTask,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  taskCounts = { all: 0, today: 0, week: 0, month: 0, completed: 0, categories: {} },
}) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [targetEditCat, setTargetEditCat] = useState(null);
  const [targetDeleteCat, setTargetDeleteCat] = useState(null);

  const quickFilters = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: <FormatListBulletedIcon fontSize="small" />,
      count: taskCounts.all || 0,
    },
    {
      id: 'today',
      label: "Today's Tasks",
      icon: <TodayIcon fontSize="small" />,
      count: taskCounts.today || 0,
    },
    {
      id: 'week',
      label: "This Week's Tasks",
      icon: <DateRangeIcon fontSize="small" />,
      count: taskCounts.week || 0,
    },
    {
      id: 'month',
      label: 'Monthly Tasks',
      icon: <CalendarMonthIcon fontSize="small" />,
      count: taskCounts.month || 0,
    }
  ];

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleOpenManageAll = () => {
    setTargetEditCat(null);
    setTargetDeleteCat(null);
    setManageDialogOpen(true);
  };

  const handleOpenEditSpecific = (cat) => {
    setTargetEditCat(cat);
    setTargetDeleteCat(null);
    setManageDialogOpen(true);
  };

  const handleOpenDeleteSpecific = (cat) => {
    setTargetEditCat(null);
    setTargetDeleteCat(cat);
    setManageDialogOpen(true);
  };

  const renderContent = (isMobile = false) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        {/* Brand / Logo Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
            pt: 0.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              }}
            >
              ✓
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.15,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                }}
              >
                To-Do Hub
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                Weekly & Category Planner
              </Typography>
            </Box>
          </Stack>
          {isMobile && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* User Profile Card */}
        <Box
          sx={{
            p: 1.5,
            mb: 2.2,
            bgcolor: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: isGuest ? '#64748B' : '#DC2626',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : isGuest ? 'G' : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#0F172A',
                fontSize: '0.86rem',
              }}
            >
              {isGuest ? 'Guest Mode' : user?.name || 'My Account'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.73rem',
              }}
            >
              {isGuest ? 'Local browser session' : user?.email || 'Verified user'}
            </Typography>
          </Box>
          {isGuest && (
            <Chip
              label="Guest"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: '#E2E8F0',
                color: '#475569',
                fontWeight: 700,
                borderRadius: '6px',
              }}
            />
          )}
        </Box>

        {/* Prominent Quick "+ Add Task" button */}
        {onOpenAddTask && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => {
              if (isMobile) onClose();
              onOpenAddTask();
            }}
            sx={{
              mb: 2.5,
              borderRadius: '10px',
              py: 1.1,
              fontWeight: 700,
              fontSize: '0.88rem',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.28)',
              '&:hover': {
                boxShadow: '0 6px 18px rgba(220, 38, 38, 0.38)',
              },
            }}
          >
            Add New Task
          </Button>
        )}

        {/* Section 1: Views & Timeline */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: '#94A3B8',
            letterSpacing: '0.06em',
            px: 1,
            display: 'block',
            mb: 0.8,
            fontSize: '0.68rem',
          }}
        >
          VIEWS & TIMELINE
        </Typography>

        <List dense sx={{ p: 0, mb: 2 }}>
          {quickFilters.map((item) => {
            const isSelected = activeFilter === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.4 }}>
                <ListItemButton
                  onClick={() => {
                    onSelectFilter(item.id);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 0.8,
                    px: 1.2,
                    bgcolor: isSelected ? '#FEF2F2' : 'transparent',
                    color: isSelected ? '#DC2626' : '#334155',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: isSelected ? '#FEE2E2' : '#F1F5F9',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? '#DC2626' : '#64748B',
                      minWidth: 32,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                  {item.count > 0 && (
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        px: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        bgcolor: isSelected ? '#DC2626' : '#E2E8F0',
                        color: isSelected ? '#FFFFFF' : '#475569',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 1.5, borderColor: '#F1F5F9' }} />

        {/* Section 2: Categories with Edit / Delete actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            mb: 0.8,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.06em',
              fontSize: '0.68rem',
            }}
          >
            CATEGORIES
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={handleOpenManageAll}
              sx={{
                p: 0.3,
                color: '#64748B',
                '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
              }}
              title="Manage Categories"
            >
              <TuneIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleOpenManageAll}
              sx={{
                p: 0.3,
                color: '#64748B',
                '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
              }}
              title="Add Category"
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>

        <List dense sx={{ p: 0, mb: 2 }}>
          {/* All Categories Option */}
          <ListItem disablePadding sx={{ mb: 0.4 }}>
            <ListItemButton
              onClick={() => {
                onSelectCategory('All');
                if (isMobile) onClose();
              }}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                px: 1.2,
                bgcolor: selectedCategory === 'All' ? '#FEF2F2' : 'transparent',
                color: selectedCategory === 'All' ? '#DC2626' : '#334155',
                fontWeight: selectedCategory === 'All' ? 700 : 500,
                '&:hover': {
                  bgcolor: selectedCategory === 'All' ? '#FEE2E2' : '#F1F5F9',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedCategory === 'All' ? '#DC2626' : '#64748B',
                  minWidth: 32,
                }}
              >
                <FormatListBulletedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="All Categories"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === 'All' ? 700 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const icon =
              cat === 'Work' ? (
                <WorkOutlinedIcon fontSize="small" />
              ) : cat === 'Personal' ? (
                <PersonOutlineIcon fontSize="small" />
              ) : cat === 'WishList' ? (
                <FavoriteBorderIcon fontSize="small" />
              ) : (
                <LabelOutlinedIcon fontSize="small" />
              );

            const catCount = taskCounts.categories?.[cat] || 0;

            return (
              <ListItem
                key={cat}
                disablePadding
                sx={{
                  mb: 0.4,
                  position: 'relative',
                  '&:hover .cat-actions': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                }}
              >
                <ListItemButton
                  onClick={() => {
                    onSelectCategory(cat);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 0.8,
                    px: 1.2,
                    bgcolor: isSelected ? '#FEF2F2' : 'transparent',
                    color: isSelected ? '#DC2626' : '#334155',
                    fontWeight: isSelected ? 700 : 500,
                    pr: 7, // Leave room for action icons
                    '&:hover': {
                      bgcolor: isSelected ? '#FEE2E2' : '#F1F5F9',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? '#DC2626' : '#64748B',
                      minWidth: 32,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={cat}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                  {catCount > 0 && (
                    <Chip
                      label={catCount}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        px: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        bgcolor: isSelected ? '#DC2626' : '#E2E8F0',
                        color: isSelected ? '#FFFFFF' : '#475569',
                      }}
                    />
                  )}
                </ListItemButton>

                {/* Edit & Delete quick action buttons */}
                <Box
                  className="cat-actions"
                  sx={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: { xs: 1, md: 0 },
                    visibility: { xs: 'visible', md: 'hidden' },
                    transition: 'opacity 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#FFFFFF',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    p: 0.2,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditSpecific(cat);
                    }}
                    title={`Rename ${cat}`}
                    sx={{ p: 0.3, color: '#64748B', '&:hover': { color: '#2563EB' } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteSpecific(cat);
                    }}
                    title={`Delete ${cat}`}
                    disabled={categories.length <= 1}
                    sx={{ p: 0.3, color: '#64748B', '&:hover': { color: '#DC2626' } }}
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section: Mobile App Promo Card & Authentication */}
      <Box sx={{ pt: 1 }}>
        {/* Mobile Application Promo Card */}
        <Card
          onClick={handleOpenPlayStore}
          elevation={0}
          sx={{
            p: 1.8,
            mb: 2,
            borderRadius: '10px',
            bgcolor: '#0F172A',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            border: '1px solid #1E293B',
            '&:hover': {
              bgcolor: '#1E293B',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.2)',
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <ShopIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#94A3B8',
                  fontWeight: 700,
                  display: 'block',
                  fontSize: '0.65rem',
                  letterSpacing: '0.04em',
                }}
              >
                AVAILABLE ON ANDROID
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  lineHeight: 1.2,
                }}
              >
                Check our Mobile App
              </Typography>
            </Box>
            <OpenInNewIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
          </Stack>
        </Card>

        {/* Auth button */}
        {isGuest ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => {
              if (isMobile) onClose();
              onOpenLoginModal();
            }}
            sx={{
              bgcolor: '#DC2626',
              color: 'white',
              borderRadius: '10px',
              py: 1,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Log In / Sign Up
          </Button>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              if (isMobile) onClose();
              onLogout();
            }}
            sx={{
              borderRadius: '10px',
              py: 0.9,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderColor: '#FECACA',
              '&:hover': {
                bgcolor: '#FEF2F2',
                borderColor: '#DC2626',
              },
            }}
          >
            Log Out
          </Button>
        )}
      </Box>

      {/* Category Management Dialog */}
      <CategoryManageDialog
        open={manageDialogOpen}
        onClose={() => {
          setManageDialogOpen(false);
          setTargetEditCat(null);
          setTargetDeleteCat(null);
        }}
        onClearInitialTargets={() => {
          setTargetEditCat(null);
          setTargetDeleteCat(null);
        }}
        categories={categories}
        taskCounts={taskCounts}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        initialEditingCategory={targetEditCat}
        initialDeletingCategory={targetDeleteCat}
      />
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer (visible on xs, sm) */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 290,
            p: 2.5,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {renderContent(true)}
      </Drawer>

      {/* Desktop Permanent Docked Sidebar (visible on md and up) */}
      <Box
        component="nav"
        sx={{
          width: { md: 270, lg: 290 },
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box
          sx={{
            width: { md: 270, lg: 290 },
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            p: 2.5,
            boxSizing: 'border-box',
          }}
        >
          {renderContent(false)}
        </Box>
      </Box>
    </>
  );
}
