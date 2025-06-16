import React, { useEffect, useState, useRef } from "react"; // Import useRef
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./../../../../script/firebaseConfig";
import { sendMeetingAcceptanceEmail, sendRejectionEmail } from "../utils/email";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Pagination,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  Tabs,
  Tab,
  Chip
} from "@mui/material";
import { Save, Close, Event, Schedule, InfoOutlined } from "@mui/icons-material";

import RejectReasonModal from "./RejectReason";

// Utility to truncate a Date to minutes (zero out seconds and ms)
function truncateToMinutes(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
}

// Normalize Firestore Timestamp or string to "YYYY-MM-DD"
function normalizeDateField(date) {
  if (!date) return "";
  if (typeof date === "object" && "seconds" in date) {
    const d = new Date(date.seconds * 1000);
    return d.toISOString().split("T")[0];
  }
  if (typeof date === "string") return date;
  return "";
}

// Normalize Firestore Timestamp or string to "HH:mm" (24-hour format)
function normalizeTimeField(time) {
  if (!time) return "";
  if (typeof time === "object" && "seconds" in time) {
    const d = new Date(time.seconds * 1000);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
  if (typeof time === "string") return time;
  return "";
}

// Helper: create a local Date from date string (YYYY-MM-DD) and time string (HH:MM)
function getLocalDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, min] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, min, 0, 0);
}

// Helper to check if now between from_time and to_time (all in local time and at minute precision)
const isCurrentMeeting = (res, nowLocal) => {
  if (res.status !== "accepted" || !res.date || !res.from_time || !res.to_time) return false;
  const dateStr = res.date;
  const fromTimeStr = res.from_time;
  const toTimeStr = res.to_time;

  const start = getLocalDateTime(dateStr, fromTimeStr);
  const end = getLocalDateTime(dateStr, toTimeStr);

  if (!start || !end) return false;

  const nowMin = truncateToMinutes(nowLocal);
  const startMin = truncateToMinutes(start);
  const endMin = truncateToMinutes(end);

  return nowMin >= startMin && nowMin < endMin;
};

// Helper to check if a meeting should be marked as done (now >= end time)
function shouldBeDone(res, nowLocal) {
  if (res.status !== "accepted" || !res.date || !res.from_time || !res.to_time) return false;
  const dateStr = res.date;
  const toTimeStr = res.to_time;

  const end = getLocalDateTime(dateStr, toTimeStr);
  const nowMin = truncateToMinutes(nowLocal);
  return nowMin >= end;
}

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [reservationToReject, setReservationToReject] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);


  // Use a ref to store the "current" local time, updated periodically
  const nowLocalRef = useRef(truncateToMinutes(new Date()));

  const itemsPerPage = 10;
  const theme = useTheme();

  // Function to fetch and update reservations
  const fetchAndUpdateReservations = async () => {
    const snapshot = await getDocs(collection(db, "meeting room"));
    const docs = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        date: normalizeDateField(d.date),
        from_time: normalizeTimeField(d.from_time),
        to_time: normalizeTimeField(d.to_time),
      };
    });

    const updates = [];
    docs.forEach((res) => {
      // Check against the current time from the ref
      if (shouldBeDone(res, nowLocalRef.current) && res.status === "accepted") {
        updates.push(
          updateDoc(doc(db, "meeting room", res.id), { status: "done" })
        );
        res.status = "done";
      }
    });
    if (updates.length > 0) await Promise.all(updates);

    setReservations(docs);
  };

  useEffect(() => {
    // Initial fetch
    fetchAndUpdateReservations();

    // Set up a timer to update current time and refetch data periodically
    // For example, every minute to check for ongoing/done meetings
    const intervalId = setInterval(() => {
      nowLocalRef.current = truncateToMinutes(new Date()); // Update the ref
      // Re-run the fetch and update to re-evaluate meeting statuses
      fetchAndUpdateReservations();
    }, 60 * 1000); // Every 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  const handleEdit = (res) => {
    setEditId(res.id);
    setEditedData(res);
  };

  const handleSave = async () => {
    await updateDoc(doc(db, "meeting room", editId), editedData);
    setReservations((prev) =>
      prev.map((r) => (r.id === editId ? { ...editedData, id: editId } : r))
    );
    setEditId(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditedData({});
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  // Filter reservations using the current time from the ref
  const filteredReservations = reservations.filter((res) => {
    if (tabValue === 0) {
      return res.status === "accepted" && !isCurrentMeeting(res, nowLocalRef.current) && res.status !== "done";
    } else if (tabValue === 1) {
      return res.status === "pending";
    } else if (tabValue === 2) {
      return res.status === "accepted" && isCurrentMeeting(res, nowLocalRef.current);
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const handleAccept = async (res) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "meeting room", res.id), { status: "accepted" });
      await sendMeetingAcceptanceEmail(res);
      setReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: "accepted" } : r))
      );
      alert("Meeting accepted and client notified!");
    } catch (error) {
      console.error("Error accepting meeting:", error);
      alert(error.message || "Failed to accept meeting or send notification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectReasonModal = (res) => {
    setReservationToReject(res);
    setRejectReasonModalOpen(true);
  };

  const handleCloseRejectReasonModal = () => {
    setRejectReasonModalOpen(false);
    setReservationToReject(null);
  };

  const handleConfirmReject = async (reason) => {
    if (!reservationToReject) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "meeting room", reservationToReject.id), {
        status: "rejected",
        rejectionReason: reason
      });
      await sendRejectionEmail(reservationToReject, reason);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationToReject.id
            ? { ...r, status: "rejected", rejectionReason: reason }
            : r
        )
      );
      alert("Meeting rejected and client notified with reason.");
    } catch (error) {
      console.error("Error rejecting meeting:", error);
      alert(error.message || "Failed to reject meeting or send notification.");
    } finally {
      handleCloseRejectReasonModal();
      setIsSubmitting(false);
    }
  };

  // New function to handle cancellation
  const handleOpenCancelConfirmation = (res) => {
    setReservationToCancel(res);
    setCancelConfirmationOpen(true);
  };

  const handleCloseCancelConfirmation = () => {
    setCancelConfirmationOpen(false);
    setReservationToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "meeting room", reservationToCancel.id), { status: "pending" });
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationToCancel.id ? { ...r, status: "pending" } : r
        )
      );
      alert("Meeting status changed to pending.");
    } catch (error) {
      console.error("Error canceling meeting:", error);
      alert(error.message || "Failed to change meeting status to pending.");
    } finally {
      handleCloseCancelConfirmation();
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = (data) => setDetailsDialog({ open: true, data });
  const handleCloseDetails = () => setDetailsDialog({ open: false, data: null });

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }} sx={{ background: "#f3f4f6", minHeight: "10vh" }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Meeting Room Reservations
      </Typography>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label="Accepted Meetings"
            icon={<Schedule fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Meeting Requests"
            icon={<Event fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Ongoing Meeting"
            icon={<Event fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table
          sx={{
            borderCollapse: "collapse",
            minWidth: 900,
            "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
            "& .MuiTableHead-root .MuiTableCell-root": { backgroundColor: theme.palette.grey[100], fontWeight: 600 }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">From</TableCell>
              <TableCell align="center">To</TableCell>
              <TableCell align="center">Duration</TableCell>
              <TableCell align="center">Guests</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((res) => {
              let chipLabel = "-";
              let chipColor = "default";
              if (res.status === "accepted" && !isCurrentMeeting(res, nowLocalRef.current)) { // Use nowLocalRef.current
                chipLabel = "Accepted";
                chipColor = "success";
              } else if (res.status === "pending") {
                chipLabel = "Pending";
                chipColor = "warning";
              } else if (res.status === "accepted" && isCurrentMeeting(res, nowLocalRef.current)) { // Use nowLocalRef.current
                chipLabel = "Ongoing";
                chipColor = "info";
              }
              if (res.status === "done") {
                chipLabel = "Done";
                chipColor = "primary";
              } else if (res.status === "rejected") {
                chipLabel = "Rejected";
                chipColor = "error";
              }

              return (
                <TableRow key={res.id} hover selected={editId === res.id}>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        value={editedData.name || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      res.name
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        value={editedData.email || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, email: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      res.email
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        type="date"
                        value={editedData.date || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, date: e.target.value })
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : res.date ? (
                      new Date(res.date + 'T00:00:00').toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        type="time"
                        value={editedData.from_time || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, from_time: e.target.value })
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      res.from_time || "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        type="time"
                        value={editedData.to_time || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, to_time: e.target.value })
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      res.to_time || "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        value={editedData.duration || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, duration: e.target.value })
                        }
                        size="small"
                      />
                    ) : res.duration ? (
                      res.duration
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        value={editedData.guests || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, guests: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      Array.isArray(res.guests)
                        ? res.guests.length
                        : (typeof res.guests === "string"
                          ? res.guests.split(",").filter(Boolean).length
                          : 0)
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={chipLabel}
                      color={chipColor}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Save">
                          <IconButton
                            color="success"
                            onClick={handleSave}
                            size="small"
                          >
                            <Save />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            color="inherit"
                            onClick={handleCancel}
                            size="small"
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {tabValue === 1 && res.status === "pending" && (
                          <>
                            <Tooltip title="Accept">
                              <Button
                                color="success"
                                onClick={() => handleAccept(res)}
                                size="small"
                                variant="contained"
                                sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                                disabled={isSubmitting}
                              >
                                Accept
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                color="error"
                                onClick={() => handleOpenRejectReasonModal(res)}
                                size="small"
                                variant="contained"
                                sx={{
                                  minWidth: 0,
                                  px: 2,
                                  fontSize: "0.85rem",
                                  textTransform: "none",
                                }}
                                disabled={isSubmitting}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {tabValue === 0 && res.status === "accepted" && !isCurrentMeeting(res, nowLocalRef.current) && (
                          <Tooltip title="Cancel Meeting">
                            <Button
                              color="error"
                              onClick={() => handleOpenCancelConfirmation(res)}
                              size="small"
                              variant="contained"
                              sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </Tooltip>
                        )}
                        {(tabValue === 0 || tabValue === 1) && (
                          <Tooltip title="Details">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDetails(res)}
                              size="small"
                            >
                              <InfoOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <Button
                            color="warning"
                            onClick={() => handleEdit(res)}
                            size="small"
                            variant="contained"
                            sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {currentItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No reservations found for this category.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredReservations.length > 0 && (
        <Stack direction="row" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, val) => setCurrentPage(val)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      <Dialog open={detailsDialog.open} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent dividers>
          {detailsDialog.data && (
            <Stack spacing={2}>
              <Typography>
                <strong>Name:</strong> {detailsDialog.data.name || "-"}
              </Typography>
              <Typography>
                <strong>Email:</strong> {detailsDialog.data.email || "-"}
              </Typography>
              <Typography>
                <strong>Date:</strong> {detailsDialog.data.date ? new Date(detailsDialog.data.date + 'T00:00:00').toLocaleDateString("en-US") : "-"}
              </Typography>
              <Typography>
                <strong>From Time:</strong> {detailsDialog.data.from_time || "-"}
              </Typography>
              <Typography>
                <strong>To Time:</strong> {detailsDialog.data.to_time || "-"}
              </Typography>
              <Typography>
                <strong>Duration:</strong> {detailsDialog.data.duration || "-"}
              </Typography>
              <Typography>
                <strong>Cost:</strong> {detailsDialog.data.totalCost || "-"}
              </Typography>
              <Typography>
                <strong>Guests:</strong> {
                  Array.isArray(detailsDialog.data.guests)
                    ? detailsDialog.data.guests.join(", ")
                    : (typeof detailsDialog.data.guests === "string"
                      ? detailsDialog.data.guests
                      : "-")
                }
              </Typography>
              <Typography>
                <strong>Status:</strong> {detailsDialog.data.status || "-"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelConfirmationOpen}
        onClose={handleCloseCancelConfirmation}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to change this meeting's status to "Pending"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelConfirmation} color="primary" disabled={isSubmitting}>
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus disabled={isSubmitting}>
            Yes, Change to Pending
          </Button>
        </DialogActions>
      </Dialog>

      <RejectReasonModal
        open={rejectReasonModalOpen}
        onClose={handleCloseRejectReasonModal}
        onConfirm={handleConfirmReject}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

export default AdminDashboard;