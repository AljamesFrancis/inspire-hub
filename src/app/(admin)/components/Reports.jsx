import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { db } from "../../../../script/firebaseConfig"; // Ensure this path is correct
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
import { green, red, blue, orange, grey } from "@mui/material/colors";
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
  Done: {
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
  deactivated: {
    label: "Deactivated",
    style: { backgroundColor: grey[300], color: grey[800], fontWeight: 600 },
  },
};

/**
 * Converts a Firebase Timestamp object or a valid date string/number into a JavaScript Date object.
 * Returns null if the input is falsy or results in an invalid date.
 * @param {object|string|number} firebaseTimestampOrDate - The date value, potentially a Firebase Timestamp.
 * @returns {Date|null} A Date object or null.
 */
function toDate(firebaseTimestampOrDate) {
  if (!firebaseTimestampOrDate) {
    return null;
  }
  // If it's a Firebase Timestamp, convert it
  if (typeof firebaseTimestampOrDate === "object" && "seconds" in firebaseTimestampOrDate) {
    return new Date(firebaseTimestampOrDate.seconds * 1000);
  }
  // If it's already a Date object
  if (firebaseTimestampOrDate instanceof Date) {
    return firebaseTimestampOrDate;
  }
  // Try to parse as a string or number
  const date = new Date(firebaseTimestampOrDate);
  // Check if the parsed date is valid
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date value using date-fns's "PPP" format.
 * Handles Firebase Timestamps and returns "N/A" for invalid dates.
 * @param {object|string|number} dateValue - The date value to format.
 * @returns {string} Formatted date string or "N/A".
*/
function formatDateForDisplay(dateValue) {
  const date = toDate(dateValue);
  return date ? format(date, "PPP") : "N/A";
}

/**
 * Formats a time value (Firebase Timestamp or HH:mm string) to HH:mm.
 * @param {object|string} timeValue - The time value.
 * @returns {string} Formatted time string or "-".
*/
function formatTime24h(timeValue) {
  if (!timeValue) return "-";

  let date;
  if (typeof timeValue === "object" && "seconds" in timeValue) {
    date = new Date(timeValue.seconds * 1000);
  } else if (typeof timeValue === "string" && timeValue.includes(":")) {
    const [h, m] = timeValue.split(":");
    date = new Date(); // Use a dummy date, we only care about time
    date.setHours(parseInt(h, 10));
    date.setMinutes(parseInt(m, 10));
  } else {
    return "-"; // Unrecognized format
  }

  if (isNaN(date.getTime())) {
    return "-"; // Invalid date/time
  }

  return format(date, "HH:mm");
}

const ITEMS_PER_PAGE = 10;

export default function ReservationMeetingReportTabs() {
  const [tab, setTab] = useState(0);

  // --- State for Dedicated Desk Visit Schedule ---
  const [reservations, setReservations] = useState([]);
  const [isLoadingRes, setIsLoadingRes] = useState(true);
  const [modalOpenRes, setModalOpenRes] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [resPage, setResPage] = useState(1);

  // --- State for Meeting Room ---
  const [meetings, setMeetings] = useState([]);
  const [isLoadingMeet, setIsLoadingMeet] = useState(true);
  const [modalOpenMeet, setModalOpenMeet] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetPage, setMeetPage] = useState(1);

  // --- State for Private Office Visits ---
  const [officeVisits, setOfficeVisits] = useState([]);
  const [isLoadingOffice, setIsLoadingOffice] = useState(true);
  const [modalOpenOffice, setModalOpenOffice] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officePage, setOfficePage] = useState(1);

  // --- State for Virtual Office Visits ---
  const [virtualOfficeVisits, setVirtualOfficeVisits] = useState([]);
  const [isLoadingVirtualOffice, setIsLoadingVirtualOffice] = useState(true);
  const [modalOpenVirtualOffice, setModalOpenVirtualOffice] = useState(false);
  const [selectedVirtualOffice, setSelectedVirtualOffice] = useState(null);
  const [virtualOfficePage, setVirtualOfficePage] = useState(1);

  // --- State for Deactivated Tenants & Private Offices & Virtual Offices ---
  const [deactivatedTenants, setDeactivatedTenants] = useState([]);
  const [isLoadingDeactivated, setIsLoadingDeactivated] = useState(true);
  const [modalOpenDeactivated, setModalOpenDeactivated] = useState(false);
  const [selectedDeactivatedTenant, setSelectedDeactivatedTenant] = useState(null);
  const [deactivatedPage, setDeactivatedPage] = useState(1);

  // --- Fetch visitMap reports (Dedicated Desk) ---
  useEffect(() => {
    let unsubscribed = false;
    const fetchReservations = async () => {
      setIsLoadingRes(true);
      try {
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
          name: doc.name || "N/A",
          email: doc.email || "N/A",
          phone: doc.phone || "N/A",
          company: doc.company || "N/A",
          details: doc.details || "N/A",
          reservedSeats: doc.reservedSeats || [],
          // Use the toDate helper for consistency
          date: toDate(doc.date),
          status: doc.status === "accepted" ? "Accepted" : "Rejected",
        }));
        allReservations.sort(
          (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
        );
        if (!unsubscribed) {
          setReservations(allReservations);
        }
      } catch (error) {
        console.error("Error fetching dedicated desk reservations:", error);
        // Optionally set an error state here
      } finally {
        if (!unsubscribed) {
          setIsLoadingRes(false);
        }
      }
    };
    fetchReservations();
    return () => {
      unsubscribed = true;
    };
  }, []);

  // --- Fetch privateOfficeVisits reports ---
  useEffect(() => {
    let unsubscribed = false;
    const fetchOfficeVisits = async () => {
      setIsLoadingOffice(true);
      try {
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
          name: doc.name || "N/A",
          email: doc.email || "N/A",
          phone: doc.phone || "N/A",
          company: doc.company || "N/A",
          details: doc.details || "N/A",
          office: doc.office || "N/A",
          officeSelected: doc.officeSelected || "N/A",
          capacity: doc.capacity || "N/A",
          amenities: doc.amenities || [],
          // Use the toDate helper for consistency
          date: toDate(doc.date),
          status: doc.status === "accepted" ? "Accepted" : "Rejected",
        }));
        allOfficeVisits.sort(
          (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
        );
        if (!unsubscribed) {
          setOfficeVisits(allOfficeVisits);
        }
      } catch (error) {
        console.error("Error fetching private office visits:", error);
      } finally {
        if (!unsubscribed) {
          setIsLoadingOffice(false);
        }
      }
    };
    fetchOfficeVisits();
    return () => {
      unsubscribed = true;
    };
  }, []);

  // --- Fetch meeting room reports, status: "done" or "rejected" ---
  useEffect(() => {
    let unsubscribed = false;
    const fetchMeetings = async () => {
      setIsLoadingMeet(true);
      try {
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
          name: doc.name || "N/A",
          email: doc.email || "N/A",
          guests: doc.guests || [],
          // Convert from_time and to_time using the helper
          from_time: toDate(doc.from_time),
          to_time: toDate(doc.to_time),
          // Convert date using the helper
          date: toDate(doc.date),
          status: doc.status || "N/A",
          duration: doc.duration || "N/A",
          details: doc.details || "N/A",
        }));
        // Sort latest date first
        allMeetings.sort((a, b) => {
          const dateA = a.date ? a.date.getTime() : 0;
          const dateB = b.date ? b.date.getTime() : 0;
          return dateB - dateA;
        });
        if (!unsubscribed) {
          setMeetings(allMeetings);
        }
      } catch (error) {
        console.error("Error fetching meeting room reports:", error);
      } finally {
        if (!unsubscribed) {
          setIsLoadingMeet(false);
        }
      }
    };
    fetchMeetings();
    return () => {
      unsubscribed = true;
    };
  }, []);

  // --- Fetch virtualOfficeInquiry reports ---
  useEffect(() => {
    let unsubscribed = false;
    const fetchVirtualOfficeVisits = async () => {
      setIsLoadingVirtualOffice(true);
      try {
        const q = query(
          collection(db, "virtualOfficeInquiry"),
          where("status", "in", ["accepted", "rejected"])
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const allVirtualOfficeVisits = docs.map((doc) => ({
          ...doc,
          name: doc.name || "N/A",
          email: doc.email || "N/A",
          phone: doc.phone || "N/A",
          company: doc.company || "N/A",
          details: doc.details || "N/A",
          service: doc.service || "N/A", // Assuming a 'service' field for virtual office
          // Use the toDate helper for consistency
          date: toDate(doc.date),
          status: doc.status === "accepted" ? "Accepted" : "Rejected",
        }));
        allVirtualOfficeVisits.sort(
          (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
        );
        if (!unsubscribed) {
          setVirtualOfficeVisits(allVirtualOfficeVisits);
        }
      } catch (error) {
        console.error("Error fetching virtual office inquiries:", error);
      } finally {
        if (!unsubscribed) {
          setIsLoadingVirtualOffice(false);
        }
      }
    };
    fetchVirtualOfficeVisits();
    return () => {
      unsubscribed = true;
    };
  }, []);

  // --- NEW: Fetch Deactivated Tenants, Private Offices, and Virtual Offices ---
  useEffect(() => {
    let unsubscribed = false;
    const fetchDeactivatedData = async () => {
      setIsLoadingDeactivated(true);
      try {
        const allDeactivated = [];

        // 1. Fetch from 'seatMap' collection for deactivated tenants (Dedicated Desk)
        const tenantsQuery = query(
          collection(db, "seatMap"),
          where("status", "==", "deactivated")
        );
        const tenantsSnapshot = await getDocs(tenantsQuery);
        tenantsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          allDeactivated.push({
            id: doc.id,
            ...data,
            name: data.name || "N/A",
            email: data.email || "N/A",
            phone: data.phone || "N/A",
            company: data.company || "N/A",
            deactivatedAt: toDate(data.deactivatedAt), // Convert deactivatedAt using the new toDate helper
            status: "deactivated", // Explicitly set status for consistency
            lastActiveDate: formatDateForDisplay(data.lastActiveDate), // Use helper
            reasonForDeactivation: data.reasonForDeactivation || "N/A",
            type: "Dedicated Desk Tenant", // Add a type to distinguish source
          });
        });

        // 2. Fetch from 'privateOffice' collection for deactivated private offices
        const privateOfficeQuery = query(
          collection(db, "privateOffice"),
          where("status", "==", "deactivated")
        );
        const privateOfficeSnapshot = await getDocs(privateOfficeQuery);
        privateOfficeSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          allDeactivated.push({
            id: doc.id,
            ...data,
            name: data.name || "N/A", // Assuming a name field for the deactivated office record
            email: data.email || "N/A",
            phone: data.phone || "N/A",
            company: data.company || "N/A",
            deactivatedAt: toDate(data.deactivatedAt || data.dateCreated), // Prefer deactivatedAt, fall back to dateCreated
            status: data.status, // Keep original status like 'deactivated'
            type: "Private Office", // Add a type to distinguish source
            office: data.office || data.officeName || "N/A", // Adjust field names as per your DB
            details: data.details || "N/A",
            reasonForDeactivation: data.reasonForDeactivation || "N/A",
            // Add other relevant privateOffice fields you want to display
          });
        });

        // 3. Fetch from 'virtualOffice' collection for deactivated virtual offices
        const virtualOfficeQuery = query(
          collection(db, "virtualOffice"), // Using the correct collection name: virtualOffice
          where("status", "==", "deactivated")
        );
        const virtualOfficeSnapshot = await getDocs(virtualOfficeQuery);
        virtualOfficeSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          allDeactivated.push({
            id: doc.id,
            ...data,
            name: data.name || "N/A",
            email: data.email || "N/A",
            phone: data.phone || "N/A",
            company: data.company || "N/A",
            deactivatedAt: toDate(data.deactivatedAt || data.dateCreated),
            status: data.status,
            type: "Virtual Office", // Add a type to distinguish source
            service: data.service || "N/A", // Assuming a 'service' field for virtual office
            details: data.details || "N/A",
            reasonForDeactivation: data.reasonForDeactivation || "N/A",
          });
        });

        // Sort all combined data by deactivatedAt (or primary relevant date)
        allDeactivated.sort(
          (a, b) => (b.deactivatedAt?.getTime?.() || 0) - (a.deactivatedAt?.getTime?.() || 0)
        );

        if (!unsubscribed) {
          setDeactivatedTenants(allDeactivated);
        }
      } catch (error) {
        console.error("Error fetching deactivated data:", error);
      } finally {
        if (!unsubscribed) {
          setIsLoadingDeactivated(false);
        }
      }
    };
    fetchDeactivatedData();
    return () => {
      unsubscribed = true;
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
  const handleOpenModalVirtualOffice = (virtualOffice) => {
    setSelectedVirtualOffice(virtualOffice);
    setModalOpenVirtualOffice(true);
  };
  const handleCloseModalVirtualOffice = () => {
    setModalOpenVirtualOffice(false);
    setSelectedVirtualOffice(null);
  };
  // --- Handlers for Deactivated Tenants Modal ---
  const handleOpenModalDeactivated = (tenant) => {
    setSelectedDeactivatedTenant(tenant);
    setModalOpenDeactivated(true);
  };
  const handleCloseModalDeactivated = () => {
    setModalOpenDeactivated(false);
    setSelectedDeactivatedTenant(null);
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
  const paginatedVirtualOfficeVisits = virtualOfficeVisits.slice(
    (virtualOfficePage - 1) * ITEMS_PER_PAGE,
    virtualOfficePage * ITEMS_PER_PAGE
  );
  // --- Pagination for Deactivated Tenants ---
  const paginatedDeactivatedTenants = deactivatedTenants.slice(
    (deactivatedPage - 1) * ITEMS_PER_PAGE,
    deactivatedPage * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          setResPage(1);
          setMeetPage(1);
          setOfficePage(1);
          setVirtualOfficePage(1);
          setDeactivatedPage(1); // Reset deactivated tenants page when changing tabs
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="Dedicated Desk Visit Schedule Report" />
        <Tab label="Private Office Visit Report" />
        <Tab label="Meeting Room Report" />
        <Tab label="Virtual Office Report" />
        <Tab label="Deactivated Tenants" /> {/* NEW TAB ADDED HERE */}
      </Tabs>

      {/* --- Dedicated Desk Visit Schedule Report Tab --- */}
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
                Dedicated Desk Visit Schedule Report
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
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
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
                              No dedicated desk reservations found.
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
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
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
                              No private office visits found.
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
                                {office.office || office.officeSelected || "-"}
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
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
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
                            Meeting Date
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Time
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Duration
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
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">
                              No meeting room reports found.
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
                                {meeting.date ? format(meeting.date, "PPP") : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {meeting.from_time && meeting.to_time
                                  ? `${formatTime24h(meeting.from_time)} - ${formatTime24h(meeting.to_time)}`
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {meeting.duration || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusChipProps[meeting.status].label}
                                sx={{
                                  ...statusChipProps[meeting.status].style,
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

      {/* --- Virtual Office Report Tab --- */}
      {tab === 3 && (
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
                Virtual Office Inquiry Report
              </Typography>
            </Box>

            {isLoadingVirtualOffice ? (
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
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
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
                            Service Type
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Inquiry Date
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
                      {paginatedVirtualOfficeVisits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary">
                              No virtual office inquiries found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedVirtualOfficeVisits.map((virtualOffice) => (
                          <TableRow
                            key={virtualOffice.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {virtualOffice.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {virtualOffice.service || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {virtualOffice.date
                                  ? format(virtualOffice.date, "PPPpp")
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusChipProps[virtualOffice.status].label}
                                sx={{
                                  ...statusChipProps[virtualOffice.status].style,
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
                                onClick={() => handleOpenModalVirtualOffice(virtualOffice)}
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
                    count={Math.ceil(virtualOfficeVisits.length / ITEMS_PER_PAGE)}
                    page={virtualOfficePage}
                    onChange={(_, val) => setVirtualOfficePage(val)}
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

      {/* --- Deactivated Tenants Tab (NEW) --- */}
      {tab === 4 && (
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
                Deactivated Clients Report
              </Typography>
            </Box>

            {isLoadingDeactivated ? (
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
                      "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Client Name
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Client Type
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="text.secondary">
                            Deactivated At
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
                      {paginatedDeactivatedTenants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary">
                              No deactivated clients found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedDeactivatedTenants.map((tenant) => (
                          <TableRow
                            key={tenant.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {tenant.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {tenant.type}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {tenant.deactivatedAt
                                  ? format(tenant.deactivatedAt, "PPPpp")
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusChipProps[tenant.status].label}
                                sx={{
                                  ...statusChipProps[tenant.status].style,
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
                                onClick={() => handleOpenModalDeactivated(tenant)}
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
                    count={Math.ceil(deactivatedTenants.length / ITEMS_PER_PAGE)}
                    page={deactivatedPage}
                    onChange={(_, val) => setDeactivatedPage(val)}
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

      {/* --- Modals (Keep existing modals, add new for deactivated tenants) --- */}

      {/* Dedicated Desk Client Details Modal */}
      <Dialog
        open={modalOpenRes}
        onClose={handleCloseModalRes}
        aria-labelledby="dedicated-desk-modal-title"
      >
        <DialogTitle id="dedicated-desk-modal-title">
          <Typography variant="h6" fontWeight="bold">
            Dedicated Desk Client Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedClient && (
            <Stack spacing={2}>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedClient.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedClient.email}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {selectedClient.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {selectedClient.company}
              </Typography>
              <Typography variant="body1">
                <strong>Visit Date & Time:</strong>{" "}
                {selectedClient.date ? format(selectedClient.date, "PPPpp") : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Reserved Seats:</strong>{" "}
                {selectedClient.reservedSeats.length > 0
                  ? selectedClient.reservedSeats.join(", ")
                  : "None"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={statusChipProps[selectedClient.status].label}
                  sx={{
                    ...statusChipProps[selectedClient.status].style,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    px: 1.5,
                  }}
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedClient.details}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalRes}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Private Office Visit Details Modal */}
      <Dialog
        open={modalOpenOffice}
        onClose={handleCloseModalOffice}
        aria-labelledby="private-office-modal-title"
      >
        <DialogTitle id="private-office-modal-title">
          <Typography variant="h6" fontWeight="bold">
            Private Office Visit Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedOffice && (
            <Stack spacing={2}>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedOffice.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedOffice.email}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {selectedOffice.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {selectedOffice.company}
              </Typography>
              <Typography variant="body1">
                <strong>Office Selected:</strong>{" "}
                {selectedOffice.office || selectedOffice.officeSelected || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Capacity:</strong> {selectedOffice.capacity || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Amenities:</strong>{" "}
                {selectedOffice.amenities && selectedOffice.amenities.length > 0
                  ? selectedOffice.amenities.join(", ")
                  : "None"}
              </Typography>
              <Typography variant="body1">
                <strong>Visit Date & Time:</strong>{" "}
                {selectedOffice.date ? format(selectedOffice.date, "PPPpp") : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={statusChipProps[selectedOffice.status].label}
                  sx={{
                    ...statusChipProps[selectedOffice.status].style,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    px: 1.5,
                  }}
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedOffice.details}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalOffice}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Room Details Modal */}
      <Dialog
        open={modalOpenMeet}
        onClose={handleCloseModalMeet}
        aria-labelledby="meeting-room-modal-title"
      >
        <DialogTitle id="meeting-room-modal-title">
          <Typography variant="h6" fontWeight="bold">
            Meeting Room Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedMeeting && (
            <Stack spacing={2}>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedMeeting.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedMeeting.email}
              </Typography>
              <Typography variant="body1">
                <strong>Guests:</strong>{" "}
                {selectedMeeting.guests.length > 0
                  ? selectedMeeting.guests.join(", ")
                  : "None"}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong>{" "}
                {selectedMeeting.date ? format(selectedMeeting.date, "PPP") : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Time:</strong>{" "}
                {selectedMeeting.from_time && selectedMeeting.to_time
                  ? `${formatTime24h(selectedMeeting.from_time)} - ${formatTime24h(selectedMeeting.to_time)}`
                  : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> {selectedMeeting.duration || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={statusChipProps[selectedMeeting.status].label}
                  sx={{
                    ...statusChipProps[selectedMeeting.status].style,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    px: 1.5,
                  }}
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedMeeting.details}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalMeet}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Virtual Office Inquiry Details Modal */}
      <Dialog
        open={modalOpenVirtualOffice}
        onClose={handleCloseModalVirtualOffice}
        aria-labelledby="virtual-office-modal-title"
      >
        <DialogTitle id="virtual-office-modal-title">
          <Typography variant="h6" fontWeight="bold">
            Virtual Office Inquiry Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedVirtualOffice && (
            <Stack spacing={2}>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedVirtualOffice.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedVirtualOffice.email}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {selectedVirtualOffice.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {selectedVirtualOffice.company}
              </Typography>
              <Typography variant="body1">
                <strong>Service Type:</strong> {selectedVirtualOffice.service || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Inquiry Date:</strong>{" "}
                {selectedVirtualOffice.date
                  ? format(selectedVirtualOffice.date, "PPPpp")
                  : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={statusChipProps[selectedVirtualOffice.status].label}
                  sx={{
                    ...statusChipProps[selectedVirtualOffice.status].style,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    px: 1.5,
                  }}
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedVirtualOffice.details}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalVirtualOffice}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivated Client Details Modal (NEW) */}
      <Dialog
        open={modalOpenDeactivated}
        onClose={handleCloseModalDeactivated}
        aria-labelledby="deactivated-tenant-modal-title"
      >
        <DialogTitle id="deactivated-tenant-modal-title">
          <Typography variant="h6" fontWeight="bold">
            Deactivated Client Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedDeactivatedTenant && (
            <Stack spacing={2}>
              <Typography variant="body1">
                <strong>Client Type:</strong> {selectedDeactivatedTenant.type}
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedDeactivatedTenant.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedDeactivatedTenant.email}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {selectedDeactivatedTenant.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {selectedDeactivatedTenant.company}
              </Typography>
              {selectedDeactivatedTenant.type === "Private Office" && (
                <Typography variant="body1">
                  <strong>Office:</strong> {selectedDeactivatedTenant.office}
                </Typography>
              )}
              {selectedDeactivatedTenant.type === "Virtual Office" && (
                <Typography variant="body1">
                  <strong>Service:</strong> {selectedDeactivatedTenant.service}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>Deactivated At:</strong>{" "}
                {selectedDeactivatedTenant.deactivatedAt
                  ? format(selectedDeactivatedTenant.deactivatedAt, "PPPpp")
                  : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={statusChipProps[selectedDeactivatedTenant.status].label}
                  sx={{
                    ...statusChipProps[selectedDeactivatedTenant.status].style,
                    fontSize: "0.875rem",
                    borderRadius: "999px",
                    px: 1.5,
                  }}
                  size="small"
                />
              </Typography>
              {selectedDeactivatedTenant.deactivatedBy && (
                <Typography variant="body1">
                  <strong>Deactivated By:</strong>{" "}
                  {selectedDeactivatedTenant.deactivatedBy}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalDeactivated}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}