import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, taskTitle }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3.5, p: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Delete Task?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete{' '}
          <strong style={{ color: '#0F172A' }}>"{taskTitle}"</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2.5, px: 2.5 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

