import React, { useEffect, useState } from "react";
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

// --- Import the new RejectReasonModal ---
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

// Normalize Firestore Timestamp or string to "HH:mm" (local time)
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

// Helper: create a local Date from date string and time string
function getLocalDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  let hour = 0, min = 0;
  const pmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*pm/i);
  const amMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*am/i);
  if (pmMatch) {
    hour = parseInt(pmMatch[1], 10);
    min = parseInt(pmMatch[2], 10);
    if (hour < 12) hour += 12;
  } else if (amMatch) {
    hour = parseInt(amMatch[1], 10);
    min = parseInt(amMatch[2], 10);
    if (hour === 12) hour = 0;
  } else {
    [hour, min] = timeStr.split(":").map(Number);
  }
  return new Date(year, month - 1, day, hour, min, 0, 0);
}

// Helper to check if now between from_time and to_time (all in local time and at minute precision)
const isCurrentMeeting = (res, nowLocal) => {
  if (res.status !== "accepted" || !res.date || !res.from_time || !res.to_time) return false;
  const dateStr = normalizeDateField(res.date);
  const from = normalizeTimeField(res.from_time).padStart(5, "0");
  const to = normalizeTimeField(res.to_time).padStart(5, "0");
  const start = getLocalDateTime(dateStr, from);
  const end = getLocalDateTime(dateStr, to);
  if (!start || !end) return false;
  const nowMin = truncateToMinutes(nowLocal);
  const startMin = truncateToMinutes(start);
  const endMin = truncateToMinutes(end);
  return nowMin >= startMin && nowMin < endMin;
};

// Helper to check if a meeting should be marked as done (now >= end time)
function shouldBeDone(res, nowLocal) {
  if (res.status !== "accepted" || !res.date || !res.from_time || !res.to_time) return false;
  const dateStr = normalizeDateField(res.date);
  const to = normalizeTimeField(res.to_time).padStart(5, "0");
  const end = getLocalDateTime(dateStr, to);
  const nowMin = truncateToMinutes(nowLocal);
  return nowMin >= end;
}

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  // --- New state for preventing double submissions ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State for RejectReasonModal ---
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [reservationToReject, setReservationToReject] = useState(null); // Stores the full reservation object

  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });

  const itemsPerPage = 10;
  const theme = useTheme();

  // Use local time for now, truncated to minutes for display and comparison
  const nowLocal = truncateToMinutes(new Date());

  // Fetch reservations and update "done" status automatically
  useEffect(() => {
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

      // Detect meetings that need to be marked "done"
      const updates = [];
      docs.forEach((res) => {
        if (shouldBeDone(res, nowLocal) && res.status === "accepted") {
          updates.push(
            updateDoc(doc(db, "meeting room", res.id), { ...res, status: "done" })
          );
          res.status = "done"; // Optimistically update local state too
        }
      });
      if (updates.length > 0) await Promise.all(updates);

      setReservations(docs);
    };
    fetchAndUpdateReservations();
    // Optionally, add a timer to re-run periodically if needed
  }, []);

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

  // Tab logic:
  // 0: Accepted Meetings (status: accepted, but not currently ongoing)
  // 1: Upcoming Meetings (status: pending)
  // 2: Current Meeting (status: accepted, and now between from_time and to_time)
  const filteredReservations = reservations.filter((res) => {
    if (tabValue === 0) {
      return res.status === "accepted" && !isCurrentMeeting(res, nowLocal);
    } else if (tabValue === 1) {
      return res.status === "pending";
    } else if (tabValue === 2) {
      return res.status === "accepted" && isCurrentMeeting(res, nowLocal);
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  // Handle Accept
  const handleAccept = async (res) => {
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true); // Set submitting to true
    try {
      // 1. Update status in Firestore
      await updateDoc(doc(db, "meeting room", res.id), { ...res, status: "accepted" });

      // 2. Send acceptance email using the imported function
      await sendMeetingAcceptanceEmail(res); // Call the imported function

      // 3. Update local state to reflect the change
      setReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: "accepted" } : r))
      );
      alert("Meeting accepted and client notified!");
    } catch (error) {
      console.error("Error accepting meeting:", error);
      alert(error.message || "Failed to accept meeting or send notification."); // Use error.message from the thrown error
    } finally {
      setIsSubmitting(false); // Reset submitting to false
    }
  };

  // --- New functions for RejectReasonModal ---
  const handleOpenRejectReasonModal = (res) => {
    setReservationToReject(res);
    setRejectReasonModalOpen(true);
  };

  const handleCloseRejectReasonModal = () => {
    setRejectReasonModalOpen(false);
    setReservationToReject(null);
  };

  const handleConfirmReject = async (reason) => {
    if (!reservationToReject) return; // Should not happen if modal is opened correctly
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true); // Set submitting to true
    try {
      // 1. Update status AND store the rejection reason in Firestore
      await updateDoc(doc(db, "meeting room", reservationToReject.id), {
        status: "rejected",
        rejectionReason: reason // <-- Add this line
      });

      // 2. Send rejection email using the imported function
      // Pass the reservation data and the reason
      await sendRejectionEmail(reservationToReject, reason);

      // 3. Update local state to reflect the change
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationToReject.id
            ? { ...r, status: "rejected", rejectionReason: reason } // <-- Update local state with reason too
            : r
        )
      );
      alert("Meeting rejected and client notified with reason.");
    } catch (error) {
      console.error("Error rejecting meeting:", error);
      alert(error.message || "Failed to reject meeting or send notification.");
    } finally {
      handleCloseRejectReasonModal(); // Close modal regardless of success or failure
      setIsSubmitting(false); // Reset submitting to false
    }
  };

  // Details Modal
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
              // Determine visual status for chip
              let chipLabel = "-";
              let chipColor = "default";
              if (res.status === "accepted" && !isCurrentMeeting(res, nowLocal)) {
                chipLabel = "Accepted";
                chipColor = "success";
              } else if (res.status === "pending") {
                chipLabel = "Pending";
                chipColor = "warning";
              } else if (res.status === "accepted" && isCurrentMeeting(res, nowLocal)) {
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
                      new Date(res.date).toLocaleDateString("en-US", {
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
                        value={editedData.from_time || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, from_time: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      new Date(res.from_time?.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }) || "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === res.id ? (
                      <TextField
                        variant="standard"
                        value={editedData.to_time || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, to_time: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      new Date(res.to_time?.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }) || "-"
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
                      parseFloat(res.duration.replace(/[^\d.]/g, ""))
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
                                disabled={isSubmitting} // Disable button while submitting
                              >
                                Accept
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                color="error"
                                // --- Change this to open the new modal ---
                                onClick={() => handleOpenRejectReasonModal(res)}
                                size="small"
                                variant="contained"
                                sx={{
                                  minWidth: 0,
                                  px: 2,
                                  fontSize: "0.85rem",
                                  textTransform: "none",
                                }}
                                disabled={isSubmitting} // Disable button while submitting
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
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
                <strong>Date:</strong> {detailsDialog.data.date ? new Date(detailsDialog.data.date).toLocaleDateString("en-US") : "-"}
              </Typography>
              <Typography>
                <strong>From Time:</strong> {new Date(detailsDialog.data.from_time?.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }) || "-"}
              </Typography>
              <Typography>
                <strong>To Time:</strong> {new Date(detailsDialog.data.to_time?.seconds * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }) || "-"}
              </Typography>
              <Typography>
                <strong>Duration:</strong> {detailsDialog.data.duration || "-"}
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

      {/* --- Add the RejectReasonModal component --- */}
      <RejectReasonModal
        open={rejectReasonModalOpen}
        onClose={handleCloseRejectReasonModal}
        onConfirm={handleConfirmReject}
        isSubmitting={isSubmitting} // Pass isSubmitting to the modal if it has a confirm button
      />
    </Box>
  );
};

export default AdminDashboard;