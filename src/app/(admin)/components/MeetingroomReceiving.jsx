import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
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
import { Save, Close, Event, Schedule } from "@mui/icons-material";

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const itemsPerPage = 10;
  const theme = useTheme();

  useEffect(() => {
    const fetchReservations = async () => {
      const snapshot = await getDocs(collection(db, "meeting room"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservations(data);
    };
    fetchReservations();
  }, []);

  const handleDelete = async () => {
    await deleteDoc(doc(db, "meeting room", deleteId));
    setReservations((reservations) => reservations.filter((res) => res.id !== deleteId));
    setDeleteId(null);
  };

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

  const filteredReservations = reservations.filter((res) => {
    const now = new Date();
    const meetingDate = new Date(`${res.date}T${res.time || '00:00'}`);
    
    if (tabValue === 0) { // Current meetings
      return meetingDate <= now;
    } else if (tabValue === 1) { // Upcoming meetings
      return meetingDate > now;
    } else if (tabValue === 2) { // By date
      return res.date === filterDate;
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }} sx={{ background: "#f3f4f6", minHeight: "100vh" }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Meeting Room Reservations
      </Typography>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            label="Current Meetings" 
            icon={<Schedule fontSize="small" />} 
            iconPosition="start" 
          />
          <Tab 
            label="Upcoming Meetings" 
            icon={<Event fontSize="small" />} 
            iconPosition="start" 
          />
          <Tab 
            label="Filter by Date" 
            icon={<Event fontSize="small" />} 
            iconPosition="start" 
          />
        </Tabs>

        {tabValue === 2 && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TextField
              label="Select Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 220 }}
            />
          </Box>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: theme.palette.grey[100] }}>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Time</TableCell>
              <TableCell align="center">Duration</TableCell>
              <TableCell align="center">Guests</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((res) => {
              const now = new Date();
              const meetingDate = new Date(`${res.date}T${res.time || '00:00'}`);
              const isPast = meetingDate < now;
              const status = isPast ? "Completed" : "Upcoming";

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
                        value={editedData.time || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, time: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      res.time
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
                      res.guests
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={status}
                      color={isPast ? "default" : "primary"}
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
                        {!isPast && (
                          <>
                            <Tooltip title="Accept">
                              <Button
                                color="success"
                                onClick={() => handleEdit(res)}
                                size="small"
                                variant="contained"
                                sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                              >
                                Accept
                              </Button>
                            </Tooltip>
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
                          </>
                        )}
                        <Tooltip title={isPast ? "Delete" : "Reject"}>
                          <Button
                            color="error"
                            onClick={() => setDeleteId(res.id)}
                            size="small"
                            variant="contained"
                            sx={{ minWidth: 0, px: 2, fontSize: "0.85rem", textTransform: "none" }}
                          >
                            {isPast ? "Delete" : "Reject"}
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
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No reservations found for this category.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {tabValue === 0 ? 
              "Are you sure you want to delete this completed meeting record?" :
              "Are you sure you want to reject this meeting request?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;