import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, where, query } from "firebase/firestore";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import { green, red, blue, orange } from "@mui/material/colors";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// --- Common status chip props ---
const statusChipProps = {
  Accepted: {
    label: "Accepted",
    style: { backgroundColor: green[100], color: green[800], fontWeight: 600 },
  },
  Rejected: {
    label: "Rejected",
    style: { backgroundColor: red[100], color: red[800], fontWeight: 600 },
  },
  done: {
    label: "Done",
    style: { backgroundColor: blue[100], color: blue[800], fontWeight: 600 },
  },
  accepted: {
    label: "Accepted",
    style: { backgroundColor: green[100], color: green[800], fontWeight: 600 },
  },
  rejected: {
    label: "Rejected",
    style: { backgroundColor: red[100], color: red[800], fontWeight: 600 },
  },
  pending: {
    label: "Pending",
    style: { backgroundColor: orange[100], color: orange[800], fontWeight: 600 },
  },
};

function formatTime24h(time) {
  if (!time) return "-";
  let h = "", m = "";
  if (typeof time === "object" && "seconds" in time) {
    const d = new Date(time.seconds * 1000);
    h = d.getHours().toString().padStart(2, "0");
    m = d.getMinutes().toString().padStart(2, "0");
  } else if (typeof time === "string" && time.includes(":")) {
    [h, m] = time.split(":");
    h = h.padStart(2, "0");
    m = m.padStart(2, "0");
  }
  return `${h}:${m}`;
}

function formatDate(date) {
  if (!date) return "-";
  if (typeof date === "object" && "seconds" in date) {
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString();
  }
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

const ITEMS_PER_PAGE = 10;

export default function ReservationMeetingReportTabs() {
  const [tab, setTab] = useState(0);

  // --- State for visit schedule ---
  const [reservations, setReservations] = useState([]);
  const [isLoadingRes, setIsLoadingRes] = useState(true);
  const [modalOpenRes, setModalOpenRes] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [resPage, setResPage] = useState(1);

  // --- State for meeting room ---
  const [meetings, setMeetings] = useState([]);
  const [isLoadingMeet, setIsLoadingMeet] = useState(true);
  const [modalOpenMeet, setModalOpenMeet] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetPage, setMeetPage] = useState(1);

  // --- State for office visits ---
  const [officeVisits, setOfficeVisits] = useState([]);
  const [isLoadingOffice, setIsLoadingOffice] = useState(true);
  const [modalOpenOffice, setModalOpenOffice] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officePage, setOfficePage] = useState(1);

  // --- Fetch visitMap reports ---
  useEffect(() => {
    let unsub = false;
    const fetchReservations = async () => {
      setIsLoadingRes(true);
      const q = query(
        collection(db, "visitMap"),
        where("status", "in", ["accepted", "rejected"])
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const allReservations = docs.map((doc) => ({
        ...doc,
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        company: doc.company,
        details: doc.details,
        reservedSeats: doc.reservedSeats,
        date: doc.date
          ? doc.date.seconds
            ? new Date(doc.date.seconds * 1000)
            : new Date(doc.date)
          : null,
        status: doc.status === "accepted" ? "Accepted" : "Rejected",
      }));
      allReservations.sort(
        (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
      );
      if (!unsub) {
        setReservations(allReservations);
        setIsLoadingRes(false);
      }
    };
    fetchReservations();
    return () => {
      unsub = true;
    };
  }, []);

  // --- Fetch privateOfficeVisits reports ---
  useEffect(() => {
    let unsub = false;
    const fetchOfficeVisits = async () => {
      setIsLoadingOffice(true);
      const q = query(
        collection(db, "privateOfficeVisits"),
        where("status", "in", ["accepted", "rejected"])
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const allOfficeVisits = docs.map((doc) => ({
        ...doc,
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        company: doc.company,
        details: doc.details,
        officeNumber: doc.officeNumber,
        officeSelected: doc.officeSelected,
        capacity: doc.capacity,
        amenities: doc.amenities,
        date: doc.date
          ? doc.date.seconds
            ? new Date(doc.date.seconds * 1000)
            : new Date(doc.date)
          : null,
        status: doc.status === "accepted" ? "Accepted" : "Rejected",
      }));
      allOfficeVisits.sort(
        (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
      );
      if (!unsub) {
        setOfficeVisits(allOfficeVisits);
        setIsLoadingOffice(false);
      }
    };
    fetchOfficeVisits();
    return () => {
      unsub = true;
    };
  }, []);

  // --- Fetch meeting room reports, status: "done" or "rejected" ---
  useEffect(() => {
    let unsub = false;
    const fetchMeetings = async () => {
      setIsLoadingMeet(true);
      const q = query(
        collection(db, "meeting room"),
        where("status", "in", ["done", "rejected"])
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const allMeetings = docs.map((doc) => ({
        ...doc,
        id: doc.id,
        name: doc.name,
        email: doc.email,
        guests: doc.guests,
        from_time: doc.from_time,
        to_time: doc.to_time,
        date: doc.date,
        status: doc.status,
        duration: doc.duration,
        details: doc.details,
      }));
      // Sort latest date first
      allMeetings.sort((a, b) => {
        let ad =
          typeof a.date === "object" && "seconds" in a.date
            ? a.date.seconds
            : new Date(a.date).getTime() / 1000;
        let bd =
          typeof b.date === "object" && "seconds" in b.date
            ? b.date.seconds
            : new Date(b.date).getTime() / 1000;
        return bd - ad;
      });
      if (!unsub) {
        setMeetings(allMeetings);
        setIsLoadingMeet(false);
      }
    };
    fetchMeetings();
    return () => {
      unsub = true;
    };
  }, []);

  // --- Handlers ---
  const handleOpenModalRes = (client) => {
    setSelectedClient(client);
    setModalOpenRes(true);
  };
  const handleCloseModalRes = () => {
    setModalOpenRes(false);
    setSelectedClient(null);
  };
  const handleOpenModalMeet = (meeting) => {
    setSelectedMeeting(meeting);
    setModalOpenMeet(true);
  };
  const handleCloseModalMeet = () => {
    setModalOpenMeet(false);
    setSelectedMeeting(null);
  };
  const handleOpenModalOffice = (office) => {
    setSelectedOffice(office);
    setModalOpenOffice(true);
  };
  const handleCloseModalOffice = () => {
    setModalOpenOffice(false);
    setSelectedOffice(null);
  };

  // --- Pagination logic ---
  const paginatedReservations = reservations.slice(
    (resPage - 1) * ITEMS_PER_PAGE,
    resPage * ITEMS_PER_PAGE
  );
  const paginatedMeetings = meetings.slice(
    (meetPage - 1) * ITEMS_PER_PAGE,
    meetPage * ITEMS_PER_PAGE
  );
  const paginatedOfficeVisits = officeVisits.slice(
    (officePage - 1) * ITEMS_PER_PAGE,
    officePage * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setResPage(1); setMeetPage(1); setOfficePage(1); }} sx={{ mb: 3 }}>
        <Tab label="Dedicated Desk Visit Schedule Report" />
        <Tab label="Private Office Visit Report" />
        <Tab label="Meeting Room Report" />
      </Tabs>

      {/* --- Visit Schedule Report Tab --- */}
      {tab === 0 && (
        <Card variant="outlined" sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
              mb={3}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Visit Schedule Report
              </Typography>
            </Box>

            {isLoadingRes ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={256}
              >
                <CircularProgress color="primary" size={56} thickness={4} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <TableContainer component={Paper}>
                  <Table
                    size="medium"
                    sx={{
                      borderCollapse: "collapse",
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Client
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date &amp; Time
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="text.secondary">
                              No reservations found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedReservations.map((reservation) => (
                          <TableRow
                            key={reservation.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {reservation.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {reservation.date
                                  ? format(reservation.date, "PPPpp")
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusChipProps[reservation.status].label}
                                sx={{
                                  ...statusChipProps[reservation.status].style,
                                  fontSize: "0.875rem",
                                  borderRadius: "999px",
                                  px: 1.5,
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenModalRes(reservation)}
                                startIcon={<InfoOutlinedIcon />}
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: "999px",
                                  textTransform: "none",
                                  borderColor: blue[100],
                                  color: blue[700],
                                  "&:hover": {
                                    backgroundColor: blue[50],
                                  },
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction="row" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(reservations.length / ITEMS_PER_PAGE)}
                    page={resPage}
                    onChange={(_, val) => setResPage(val)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Private Office Visit Report Tab --- */}
      {tab === 1 && (
        <Card variant="outlined" sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
              mb={3}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Private Office Visit Report
              </Typography>
            </Box>

            {isLoadingOffice ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={256}
              >
                <CircularProgress color="primary" size={56} thickness={4} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <TableContainer component={Paper}>
                  <Table
                    size="medium"
                    sx={{
                      borderCollapse: "collapse",
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Client
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Office
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date &amp; Time
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedOfficeVisits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary">
                              No office visits found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedOfficeVisits.map((office) => (
                          <TableRow
                            key={office.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {office.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {office.officeNumber || office.officeSelected || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {office.date
                                  ? format(office.date, "PPPpp")
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusChipProps[office.status].label}
                                sx={{
                                  ...statusChipProps[office.status].style,
                                  fontSize: "0.875rem",
                                  borderRadius: "999px",
                                  px: 1.5,
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenModalOffice(office)}
                                startIcon={<InfoOutlinedIcon />}
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: "999px",
                                  textTransform: "none",
                                  borderColor: blue[100],
                                  color: blue[700],
                                  "&:hover": {
                                    backgroundColor: blue[50],
                                  },
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction="row" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(officeVisits.length / ITEMS_PER_PAGE)}
                    page={officePage}
                    onChange={(_, val) => setOfficePage(val)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Meeting Room Report Tab --- */}
      {tab === 2 && (
        <Card variant="outlined" sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
              mb={3}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Meeting Room Report
              </Typography>
            </Box>

            {isLoadingMeet ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={256}
              >
                <CircularProgress color="primary" size={56} thickness={4} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <TableContainer component={Paper}>
                  <Table
                    size="medium"
                    sx={{
                      borderCollapse: "collapse",
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Name
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            From
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            To
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Guests
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedMeetings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary">
                              No meetings found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedMeetings.map((meeting) => (
                          <TableRow
                            key={meeting.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {meeting.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(meeting.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatTime24h(meeting.from_time)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatTime24h(meeting.to_time)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {Array.isArray(meeting.guests)
                                  ? meeting.guests.length
                                  : typeof meeting.guests === "string"
                                  ? meeting.guests.split(",").filter(Boolean).length
                                  : 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  statusChipProps[meeting.status]
                                    ? statusChipProps[meeting.status].label
                                    : meeting.status
                                }
                                sx={{
                                  ...(statusChipProps[meeting.status]
                                    ? statusChipProps[meeting.status].style
                                    : {}),
                                  fontSize: "0.875rem",
                                  borderRadius: "999px",
                                  px: 1.5,
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenModalMeet(meeting)}
                                startIcon={<InfoOutlinedIcon />}
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: "999px",
                                  textTransform: "none",
                                  borderColor: blue[100],
                                  color: blue[700],
                                  "&:hover": {
                                    backgroundColor: blue[50],
                                  },
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction="row" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(meetings.length / ITEMS_PER_PAGE)}
                    page={meetPage}
                    onChange={(_, val) => setMeetPage(val)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Modal for client details (Visit Schedule) --- */}
      <Dialog
        open={modalOpenRes}
        onClose={handleCloseModalRes}
        maxWidth="xs"
        fullWidth
        aria-labelledby="client-details-title"
      >
        <DialogTitle id="client-details-title" sx={{ fontWeight: "bold", pb: 1 }}>
          Client Details
        </DialogTitle>
        <DialogContent dividers>
          {!selectedClient ? (
            <Typography>Loading...</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedClient.name || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedClient.email || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedClient.phone || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">{selectedClient.company || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Visit Date &amp; Time
                </Typography>
                <Typography variant="body1">
                  {selectedClient.date
                    ? format(selectedClient.date, "PPPpp")
                    : "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Reserved Seats
                </Typography>
                <Typography variant="body1">
                  {selectedClient.reservedSeats && selectedClient.reservedSeats.length
                    ? selectedClient.reservedSeats.join(", ")
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={statusChipProps[selectedClient.status]?.label || selectedClient.status}
                  sx={{
                    ...statusChipProps[selectedClient.status],
                    fontWeight: 600,
                    px: 1.5,
                    borderRadius: "999px",
                  }}
                  size="small"
                />
              </Box>
              <Divider />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalRes} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Modal for office visit details --- */}
      <Dialog
        open={modalOpenOffice}
        onClose={handleCloseModalOffice}
        maxWidth="xs"
        fullWidth
        aria-labelledby="office-details-title"
      >
        <DialogTitle id="office-details-title" sx={{ fontWeight: "bold", pb: 1 }}>
          Office Visit Details
        </DialogTitle>
        <DialogContent dividers>
          {!selectedOffice ? (
            <Typography>Loading...</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedOffice.name || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedOffice.email || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedOffice.phone || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">{selectedOffice.company || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Office
                </Typography>
                <Typography variant="body1">{selectedOffice.officeNumber || selectedOffice.officeSelected || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Capacity
                </Typography>
                <Typography variant="body1">{selectedOffice.capacity || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Amenities
                </Typography>
                <Typography variant="body1">
                  {selectedOffice.amenities && selectedOffice.amenities.length
                    ? selectedOffice.amenities.join(", ")
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Visit Date &amp; Time
                </Typography>
                <Typography variant="body1">
                  {selectedOffice.date
                    ? format(selectedOffice.date, "PPPpp")
                    : "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={statusChipProps[selectedOffice.status]?.label || selectedOffice.status}
                  sx={{
                    ...statusChipProps[selectedOffice.status],
                    fontWeight: 600,
                    px: 1.5,
                    borderRadius: "999px",
                  }}
                  size="small"
                />
              </Box>
              <Divider />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalOffice} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Modal for meeting details (Meeting Room) --- */}
      <Dialog
        open={modalOpenMeet}
        onClose={handleCloseModalMeet}
        maxWidth="xs"
        fullWidth
        aria-labelledby="meeting-details-title"
      >
        <DialogTitle id="meeting-details-title" sx={{ fontWeight: "bold", pb: 1 }}>
          Meeting Details
        </DialogTitle>
        <DialogContent dividers>
          {!selectedMeeting ? (
            <Typography>Loading...</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedMeeting.name || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedMeeting.email || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">{formatDate(selectedMeeting.date)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  From
                </Typography>
                <Typography variant="body1">{formatTime24h(selectedMeeting.from_time)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  To
                </Typography>
                <Typography variant="body1">{formatTime24h(selectedMeeting.to_time)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Guests
                </Typography>
                <Typography variant="body1">
                  {Array.isArray(selectedMeeting.guests)
                    ? selectedMeeting.guests.join(", ")
                    : typeof selectedMeeting.guests === "string"
                    ? selectedMeeting.guests
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={
                    statusChipProps[selectedMeeting.status]
                      ? statusChipProps[selectedMeeting.status].label
                      : selectedMeeting.status
                  }
                  sx={{
                    ...(statusChipProps[selectedMeeting.status]
                      ? statusChipProps[selectedMeeting.status].style
                      : {}),
                    fontWeight: 600,
                    px: 1.5,
                    borderRadius: "999px",
                  }}
                  size="small"
                />
              </Box>
              {selectedMeeting.details && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Details
                  </Typography>
                  <Typography variant="body1">{selectedMeeting.details}</Typography>
                </Box>
              )}
              <Divider />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalMeet} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}