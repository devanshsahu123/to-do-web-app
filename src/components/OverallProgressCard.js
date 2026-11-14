import React from 'react';
import { Box, Card, Typography, Stack, LinearProgress, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

export default function OverallProgressCard({ stats, totalWeeks = 0, currentYear = 2026 }) {
  const { total = 0, open = 0, completed = 0, percent = 0 } = stats || {};

  // Compute current ISO week number
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  const currentWeekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2.5,
        p: { xs: 2, sm: 2.5 },
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top Line: Annual Stamp & Progress Indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              bgcolor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
            }}
          >
            <WorkspacePremiumIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em', fontSize: '0.72rem' }}>
              ANNUAL {currentYear} STAMP
            </Typography>
          </Box>

          <Chip
            label={`Week ${currentWeekNumber} of 52`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              bgcolor: '#F1F5F9',
              color: '#334155',
            }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          ISO 8601 Weekly Cycle (Mon – Sun)
        </Typography>
      </Box>

      {/* Main Progress Display */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 0.8 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
              OVERALL COMPLETION VELOCITY
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.1, mt: 0.2 }}>
              {percent}% Completed
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            <span style={{ fontWeight: 800, color: '#10B981' }}>{completed}</span> done of{' '}
            <span style={{ fontWeight: 800, color: '#0F172A' }}>{total}</span> total tasks
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 9,
            borderRadius: 5,
            bgcolor: '#F1F5F9',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background:
                percent === 100
                  ? '#10B981'
                  : 'linear-gradient(90deg, #DC2626 0%, #EA580C 50%, #10B981 100%)',
            },
          }}
        />
      </Box>

      {/* Metric Stat Boxes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.2,
          pt: 1,
          borderTop: '1px solid #F1F5F9',
        }}
      >
        {/* Total Tasks */}
        <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
            <AssignmentIcon sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
              Total Tasks
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>
            {total}
          </Typography>
        </Box>

        {/* Completed */}
        <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F0FDF4', border: '1px solid #DCFCE7' }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10B981' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D' }}>
              Completed
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#166534' }}>
            {completed}
          </Typography>
        </Box>

        {/* Pending / Open */}
        <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
            <PendingActionsIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#B45309' }}>
              Pending
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#92400E' }}>
            {open}
          </Typography>
        </Box>

        {/* Tracked Weeks */}
        <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
            <DateRangeIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1D4ED8' }}>
              Active Weeks
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1E40AF' }}>
            {totalWeeks}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

