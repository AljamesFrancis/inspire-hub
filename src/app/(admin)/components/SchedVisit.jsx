"use client";
import { db } from "../../../../script/firebaseConfig";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
// Remove the problematic line: import React, { useState, useEffect } => {
// The correct import for React and its hooks is already present inside the component.

import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";
import {
  sendAcceptanceEmail,
  sendRejectionEmail,
} from "../../(admin)/utils/email";
import RejectReasonModal from "./RejectReason";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Info as InfoIcon,
  MeetingRoom as OfficeIcon,
  Chair as SeatIcon
} from '@mui/icons-material';
import { useState, useEffect } from "react";

// Accept utility function for updating visit status and sending email
export async function accept(visitId, collectionName) {
  if (!visitId) throw new Error("Missing visitId");
  try {
    const visitRef = doc(db, collectionName, visitId);
    const visitDoc = await getDoc(visitRef);

    if (!visitDoc.exists()) throw new Error("Visit not found");

    const clientData = { ...visitDoc.data(), id: visitId };

    await updateDoc(visitRef, { status: "accepted" });

    const emailResult = await sendAcceptanceEmail(clientData);

    if (!emailResult.success) {
      // Optionally, log or handle email failure without throwing if you want to allow status update
      throw emailResult.error;
    }
    return { success: true };
  } catch (error) {
    console.error("Error in accept:", error);
    throw error;
  }
}

// Reject utility function for updating visit status, adding a reason, and sending email
export async function reject(visitId, collectionName, reason) { // Added 'reason' parameter
  if (!visitId) throw new Error("Missing visitId");
  try {
    const visitRef = doc(db, collectionName, visitId);
    const visitDoc = await getDoc(visitRef);

    if (!visitDoc.exists()) throw new Error("Visit not found");

    const clientData = { ...visitDoc.data(), id: visitId };

    // Update the document with status and rejection reason
    await updateDoc(visitRef, { status: "rejected", rejectionReason: reason }); // Store the reason

    // Pass the reason to the email utility
    const emailResult = await sendRejectionEmail(clientData, reason); // Pass reason here

    if (!emailResult.success) {
      // Optionally, log or handle email failure without throwing if you want to allow status update
      throw emailResult.error;
    }
    return { success: true };
  } catch (error) {
    console.error("Error in reject:", error);
    throw error;
  }
}

// Utility functions
function groupIntoPairs(entries) {
  const groups = [];
  for (let i = 0; i < entries.length; i += 2) {
    groups.push(entries.slice(i, i + 2));
  }
  return groups;
}

function groupSeatsByRow(seatMap) {
  return seatMap.reduce((acc, seat) => {
    const row = seat.number[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});
}

const groupedSeats1 = groupSeatsByRow(seatMap1);
const groupedSeats2 = groupSeatsByRow(seatMap2);
const groupedSeats3 = groupSeatsByRow(seatMap3);
const groupedSeats4 = groupSeatsByRow(seatMap4);
const groupedSeats5 = groupSeatsByRow(seatMap5);

const rowEntries1 = Object.entries(groupedSeats1).sort(([a], [b]) => a.localeCompare(b));
const rowEntries2 = Object.entries(groupedSeats2).sort(([a], [b]) => a.localeCompare(b));
const rowEntries3 = Object.entries(groupedSeats3).sort(([a], [b]) => a.localeCompare(b));
const rowEntries4 = Object.entries(groupedSeats4).sort(([a], [b]) => a.localeCompare(b));
const rowEntries5 = Object.entries(groupedSeats5).sort(([a], [b]) => a.localeCompare(b));

const groupPairs1 = groupIntoPairs(rowEntries1);
const groupPairs2 = groupIntoPairs(rowEntries2);
const groupPairs3 = groupIntoPairs(rowEntries3);
const groupPairs4 = groupIntoPairs(rowEntries4);
const groupPairs5 = groupIntoPairs(rowEntries5);

export default function ClientsPage() {
  // Correct React import and hooks usage
  const [clients, setClients] = useState([]);
  const [visitClients, setVisitClients] = useState([]);
  const [officeVisitClients, setOfficeVisitClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // New state for the rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // New states for managing submission loading
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);


  useEffect(() => {
    async function fetchOccupiedSeats() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(docs);
    }
    fetchOccupiedSeats();
  }, []);

  // Fetch seat visit requests (visitMap)
  const fetchVisitData = async () => {
    const q = query(collection(db, "visitMap"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVisitClients(docs);
  };

  // Fetch private office visit requests (privateOfficeVisits)
  const fetchOfficeVisitData = async () => {
    const q = query(collection(db, "privateOfficeVisits"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOfficeVisitClients(docs);
  };

  useEffect(() => {
    fetchVisitData();
    fetchOfficeVisitData();
  }, []);

  const handleAcceptVisit = async (visitId, isOffice = false) => {
    if (!visitId || isAccepting) return; // Prevent double-click
    setIsAccepting(true); // Start loading

    try {
      const collectionName = isOffice ? "privateOfficeVisits" : "visitMap";
      await accept(visitId, collectionName);

      if (isOffice) {
        await fetchOfficeVisitData();
      } else {
        await fetchVisitData();
      }
      setSelectedClientId(null);
      alert("Visit accepted and client notified!");
    } catch (error) {
      console.error("Error in acceptVisit:", error);
      alert(error.message || "Visit was accepted but failed to notify client.");
    } finally {
      setIsAccepting(false); // End loading
    }
  };

  // Function to open the rejection modal
  const handleRejectClick = () => {
    if (isRejecting) return; // Prevent opening multiple modals
    setShowRejectModal(true);
  };

  // Function to handle confirmation from the rejection modal
  const handleConfirmReject = async (reason) => {
    setShowRejectModal(false); // Close the modal immediately
    if (!selectedClientId || isRejecting) return; // Ensure a client is selected and prevent double-click

    setIsRejecting(true); // Start loading

    try {
      const collectionName = activeTab === 1 ? "privateOfficeVisits" : "visitMap";
      await reject(selectedClientId, collectionName, reason); // Pass the reason

      if (activeTab === 1) {
        await fetchOfficeVisitData();
      } else {
        await fetchVisitData();
      }
      setSelectedClientId(null);
      alert("Visit request rejected and client notified!");
    } catch (error) {
      console.error("Error in rejectVisit:", error);
      alert(error.message || "Failed to reject visit request.");
    } finally {
      setIsRejecting(false); // End loading
    }
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedClientId(null);
  };

  const currentClients = activeTab === 0 ? visitClients : officeVisitClients;
  const selectedClient = currentClients.find((c) => c.id === selectedClientId) || null;
  const allReservedSeats = selectedClient?.reservedSeats || selectedClient?.selectedSeats || [];
  const allSelectedSeats = clients.flatMap((c) => c.selectedSeats || []);

  const isReservedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allReservedSeats.includes(seatKey);
  };

  const isSelectedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allSelectedSeats.includes(seatKey);
  };

  // Responsive seat width
  const responsiveSeatBoxSx = {
    minWidth: { xs: 28, sm: 36, md: 40 },
    width: { xs: "8vw", sm: "4vw", md: "40px" },
    maxWidth: { xs: 40, sm: 44, md: 50 },
    height: { xs: 20, sm: 22, md: 24 },
    p: 0,
    fontSize: { xs: '0.55rem', sm: '0.6rem' },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0.5,
    transition: "all .15s"
  };

  // Map card stretches responsively
  const responsiveMapCardSx = {
    flexGrow: 1,
    minWidth: { xs: 250, sm: 320, md: 360 },
    maxWidth: { xs: "90vw", md: 420 },
    flexBasis: { xs: "90vw", sm: "auto" },
    flexShrink: 1,
    width: "100%",
    m: 0,
    overflowX: "auto"
  };

  const renderSeatMap = (groupPairs, mapType, title) => (
    <Card variant="outlined" sx={responsiveMapCardSx}>
      <CardContent>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={2}>
          {groupPairs.map((group, i) => (
            <Box key={i}>
              {group.map(([rowLabel, seats]) => (
                <Box key={rowLabel} mb={1} sx={{ width: "100%" }}>
                  <Typography variant="caption" fontWeight="medium">
                    {rowLabel} Row
                  </Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5} sx={{ width: "100%" }}>
                    {seats.map((seat) => {
                      const seatKey = `${mapType}-${seat.number}`;
                      const reserved = isReservedSeat(seat, mapType);
                      const selected = isSelectedSeat(seat, mapType);

                      let seatColor = reserved ? 'primary.main' :
                        selected ? 'error.light' :
                          seat.type === "window" ? 'grey.100' : 'grey.50';

                      let barColor = reserved ? 'primary.dark' :
                        selected ? 'error.main' :
                          seat.type === "window" ? 'grey.400' : 'grey.300';

                      const hoverTitle = reserved ? "This seat is scheduled for a visit" :
                        selected ? "This seat is currently occupied" :
                          seat.type === "window" ? "Window seat (vacant)" : "Vacant seat";

                      return (
                        <Tooltip key={seat.id} title={hoverTitle} arrow>
                          <Box position="relative" mr={seat.type === "window" ? 1 : 0.5}>
                            <Button
                              disabled={reserved || selected}
                              variant="contained"
                              sx={{
                                ...responsiveSeatBoxSx,
                                bgcolor: seatColor,
                                color: reserved || selected ? 'common.white' : 'text.primary',
                                '&:hover': {
                                  bgcolor: reserved ? 'primary.dark' :
                                    selected ? 'error.main' :
                                      seat.type === "window" ? 'grey.200' : 'grey.100',
                                },
                                '&.Mui-disabled': {
                                  bgcolor: seatColor,
                                  color: reserved || selected ? 'common.white' : 'text.primary',
                                }
                              }}
                            >
                              <Monitor size={10} style={{ marginBottom: 2 }} />
                              <Typography variant="caption" ml={0.5} fontSize="0.6rem">
                                {seat.number}
                              </Typography>
                            </Button>
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              width="100%"
                              height={2}
                              bgcolor={barColor}
                            />
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
              {i < groupPairs.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  // ENHANCED: Office details as a bordered table
  const renderOfficeDetails = (office) => {
    if (!office) return null;
    return (
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Office Information
        </Typography>
        <TableContainer component={Paper} sx={{ maxWidth: 500, borderRadius: 2, boxShadow: 0, mb: 2 }}>
          <Table
            sx={{
              borderCollapse: "collapse",
              "& .MuiTableCell-root": { border: "1px solid #bdbdbd" }
            }}
            size="small"
          >
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 180 }}>Area</TableCell>
                <TableCell>{office.area || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Office Number</TableCell>
                <TableCell>{office.officeNumber || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                <TableCell>{office.company || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell>{office.email || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell>{office.phone || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Visit Details</TableCell>
                <TableCell>{office.details || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Visit Date</TableCell>
                <TableCell>
                  {office.date
                    ? office.date.seconds
                      ? new Date(office.date.seconds * 1000).toLocaleString()
                      : office.date.toLocaleString()
                    : "Not specified"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 280, flexShrink: 0, overflow: 'auto', boxShadow: 2 }}>
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography fontWeight="medium">
            Visit Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0 ? (
              `${visitClients.length} seat requests`
            ) : (
              `${officeVisitClients.length} office requests`
            )}
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SeatIcon fontSize="small" />} label="Seats" />
          <Tab icon={<OfficeIcon fontSize="small" />} label="Offices" />
        </Tabs>

        <List disablePadding>
          {currentClients.map((client) => (
            <ListItem
              key={client.id}
              disablePadding
              sx={{
                bgcolor: selectedClientId === client.id ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: selectedClientId === client.id ? 'primary.light' : 'action.hover'
                }
              }}
            >
              <ListItemButton onClick={() => setSelectedClientId(client.id)}>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium" noWrap>
                      {client.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {client.company}
                    </Typography>
                  }
                />
                {client.reservedSeats?.length > 0 && activeTab === 0 && (
                  <Chip
                    label={`${client.reservedSeats.length} seats`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
                {activeTab === 1 && client.officeNumber && (
                  <Chip
                    label={client.officeNumber}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
        {selectedClient ? (
          <Card sx={{ width: '100%' }}>
            <CardContent>
              {/* Header with actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 3,
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {selectedClient.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {selectedClient.company}
                    </Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAcceptVisit(selectedClient.id, activeTab === 1)}
                    sx={{ textTransform: 'none' }}
                    disabled={isAccepting || isRejecting} // Disable if either action is ongoing
                  >
                    {isAccepting ? 'Accepting...' : 'Accept Request'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={handleRejectClick}
                    sx={{ textTransform: 'none' }}
                    disabled={isAccepting || isRejecting} // Disable if either action is ongoing
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                </Stack>
              </Box>

              {/* Client details */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Contact Information
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body1">
                        {selectedClient.email}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body1">
                        {selectedClient.phone}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Visit Details
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedClient.details}
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedClient.date
                          ? selectedClient.date.seconds
                            ? new Date(selectedClient.date.seconds * 1000).toLocaleString()
                            : selectedClient.date.toLocaleString()
                          : "Not specified"}
                      </Typography>
                    </Stack>
                    {activeTab === 0 && selectedClient.reservedSeats?.length > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Reserved seats: {selectedClient.reservedSeats.join(", ")}
                        </Typography>
                      </Stack>
                    )}
                    {activeTab === 1 && selectedClient.officeNumber && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Requested office: {selectedClient.officeNumber}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Office details for office requests */}
              {activeTab === 1 && renderOfficeDetails(selectedClient)}

              {/* Seat maps (only for seat requests) */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Seat Assignment
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                      <Chip
                        icon={<Box sx={{ width: 14, height: 14, bgcolor: 'primary.main' }} />}
                        label="Scheduled for visit"
                        size="small"
                      />
                      <Chip
                        icon={<Box sx={{ width: 14, height: 14, bgcolor: 'error.light' }} />}
                        label="Occupied seat"
                        size="small"
                      />
                      <Chip
                        icon={<Box sx={{ width: 14, height: 14, bgcolor: 'grey.100', border: 1, borderColor: 'grey.300' }} />}
                        label="Vacant seat"
                        size="small"
                      />
                    </Stack>
                    <Box sx={{ overflowX: "auto", py: 1, width: "100%" }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          width: "100%",
                          flexWrap: { xs: "wrap", md: "nowrap" },
                          justifyContent: { xs: "center", md: "flex-start" },
                          alignItems: "stretch"
                        }}
                      >
                        {renderSeatMap(groupPairs1, "map1", "Seat Map 1")}
                        {renderSeatMap(groupPairs2, "map2", "Seat Map 2")}
                        {renderSeatMap(groupPairs3, "map3", "Seat Map 3")}
                        {renderSeatMap(groupPairs4, "map4", "Seat Map 4")}
                        {renderSeatMap(groupPairs5, "map5", "Seat Map 5")}
                      </Stack>
                    </Box>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Select a client from the sidebar to view details
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        open={showRejectModal}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        isSubmitting={isRejecting} // Pass isSubmitting to the modal
      />
    </Box>
  );
}