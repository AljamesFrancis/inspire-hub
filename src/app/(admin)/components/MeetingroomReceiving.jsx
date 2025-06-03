import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./../../../../script/firebaseConfig";


// MUI Components
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

// Format time to 24-hour format "HH:mm" (local time)
function formatTime24h(time) {
  if (!time) return "";
  let dateObj;
  if (typeof time === "object" && "seconds" in time) {
    dateObj = new Date(time.seconds * 1000);
  } else if (typeof time === "string" && time.length >= 4 && time.includes(":")) {
    // Accepts e.g. "1:41pm", "13:41", "01:41"
    const pmMatch = time.match(/(\d{1,2}):(\d{2})\s*pm/i);
    const amMatch = time.match(/(\d{1,2}):(\d{2})\s*am/i);
    let hour, min;
    if (pmMatch) {
      hour = parseInt(pmMatch[1], 10);
      min = parseInt(pmMatch[2], 10);
      if (hour < 12) hour += 12;
    } else if (amMatch) {
      hour = parseInt(amMatch[1], 10);
      min = parseInt(amMatch[2], 10);
      if (hour === 12) hour = 0;
    } else {
      [hour, min] = time.split(":").map(Number);
    }
    dateObj = new Date();
    dateObj.setHours(hour, min, 0, 0);
  } else {
    return time;
  }
  const hh = dateObj.getHours().toString().padStart(2, "0");
  const mm = dateObj.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
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
  const [rejectDialogId, setRejectDialogId] = useState(null);
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

  // Handle reject
  const handleReject = async (res) => {
    await updateDoc(doc(db, "meeting room", res.id), { ...res, status: "rejected" });
    setReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: "rejected" } : r))
    );
    setRejectDialogId(null);
  };

  // Details Modal
  const handleOpenDetails = (data) => setDetailsDialog({ open: true, data });
  const handleCloseDetails = () => setDetailsDialog({ open: false, data: null });

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }} sx={{ background: "#f3f4f6", minHeight: "100vh" }}>
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
        <Table>
          <TableHead>
            <TableRow sx={{ background: theme.palette.grey[100] }}>
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
              if (tabValue === 0) {
                chipLabel = "Accepted";
                chipColor = "success";
              } else if (tabValue === 1) {
                chipLabel = "Pending";
                chipColor = "warning";
              } else if (tabValue === 2) {
                chipLabel = "Ongoing";
                chipColor = "info";
              }
              if (res.status === "done") {
                chipLabel = "Done";
                chipColor = "primary";
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
                      formatTime24h(res.from_time) || "-"
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
                      formatTime24h(res.to_time) || "-"
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
                                onClick={async () => {
                                  await updateDoc(doc(db, "meeting room", res.id), { ...res, status: "accepted" });
                                  setReservations((prev) =>
                                    prev.map((r) =>
                                      r.id === res.id ? { ...r, status: "accepted" } : r
                                    )
                                  );
                                }}
                                size="small"
                                variant="contained"
                                sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                              >
                                Accept
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                color="error"
                                onClick={() => setRejectDialogId(res.id)}
                                size="small"
                                variant="contained"
                                sx={{
                                  minWidth: 0,
                                  px: 2,
                                  fontSize: "0.85rem",
                                  textTransform: "none",
                                }}
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

      <Dialog open={!!rejectDialogId} onClose={() => setRejectDialogId(null)}>
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this meeting request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogId(null)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              const res = reservations.find((r) => r.id === rejectDialogId);
              handleReject(res);
            }}
            color="error"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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
                <strong>From Time:</strong> {formatTime24h(detailsDialog.data.from_time) || "-"}
              </Typography>
              <Typography>
                <strong>To Time:</strong> {formatTime24h(detailsDialog.data.to_time) || "-"}
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
    </Box>
  );
};

export default AdminDashboard;