// components/RejectReasonModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography
} from '@mui/material';

export default function RejectReasonModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(''); // Clear reason after confirming
  };

  const handleClose = () => {
    onClose();
    setReason(''); // Clear reason when closing without confirming
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Provide Rejection Reason</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please provide a reason for rejecting this visit request. This reason will be included in the rejection email sent to the client.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="rejection-reason"
          label="Reason for Rejection"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={reason}
          onChange={handleReasonChange}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={!reason.trim()} // Disable if reason is empty
        >
          Reject Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}