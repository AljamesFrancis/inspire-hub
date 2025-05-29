"use client";
import { db } from "../../../../script/firebaseConfig";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
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

// MUI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
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
  Avatar,
  colors,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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
  const [clients, setClients] = useState([]);
  const [visitClients, setVisitClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);

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

  const fetchVisitData = async () => {
    const q = query(collection(db, "visitMap"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVisitClients(docs);
  };

  useEffect(() => {
    fetchVisitData();
  }, []);

  const acceptVisit = async (visitId) => {
    if (!visitId) return;
    try {
      const visitRef = doc(db, "visitMap", visitId);
      const visitDoc = await getDoc(visitRef);
      const clientData = visitDoc.data();

      await updateDoc(visitRef, { status: "accepted" });
      const emailResult = await sendAcceptanceEmail(clientData);
      
      if (!emailResult.success) {
        throw emailResult.error;
      }

      await fetchVisitData();
      setSelectedClientId(null);
      alert("Visit accepted and client notified!");
    } catch (error) {
      console.error("Error in acceptVisit:", error);
      alert(error.message || "Visit was accepted but failed to notify client.");
    }
  };

  const rejectVisit = async (visitId) => {
    if (!visitId) return;
    try {
      const visitRef = doc(db, "visitMap", visitId);
      const visitDoc = await getDoc(visitRef);
      const clientData = visitDoc.data();

      await updateDoc(visitRef, { status: "rejected" });
      const emailResult = await sendRejectionEmail(clientData);
      
      if (!emailResult.success) {
        throw emailResult.error;
      }

      await fetchVisitData();
      setSelectedClientId(null);
      alert("Visit request rejected and client notified!");
    } catch (error) {
      console.error("Error in rejectVisit:", error);
      alert(error.message || "Failed to reject visit request.");
    }
  };

  const selectedVisitClient = visitClients.find((c) => c.id === selectedClientId);
  const allReservedSeats = selectedVisitClient?.reservedSeats || [];
  const allSelectedSeats = clients.flatMap((c) => c.selectedSeats || []);
  const selectedClient = selectedVisitClient || null;

  const isReservedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allReservedSeats.includes(seatKey);
  };

  const isSelectedSeat = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return allSelectedSeats.includes(seatKey);
  };

  const renderSeatMap = (groupPairs, mapType, title) => (
    <Card variant="outlined" sx={{ minWidth: 200, flexShrink: 0 }}>
      <CardContent>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={2}>
          {groupPairs.map((group, i) => (
            <Box key={i}>
              {group.map(([rowLabel, seats]) => (
                <Box key={rowLabel} mb={1}>
                  <Typography variant="caption" fontWeight="medium">
                    {rowLabel} Row
                  </Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5}>
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
                                minWidth: 40,
                                height: 24,
                                p: 0,
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 280, flexShrink: 0, overflow: 'auto', boxShadow: 2 }}>
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography  fontWeight="medium">
            Visit Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {visitClients.length} pending requests
          </Typography>
        </Box>
        <List disablePadding>
          {visitClients.map((client) => (
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
                {client.reservedSeats?.length > 0 && (
                  <Chip 
                    label={`${client.reservedSeats.length} seats`} 
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
                    onClick={() => acceptVisit(selectedClient.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Accept Visit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => rejectVisit(selectedClient.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Reject
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
                    {selectedClient.reservedSeats?.length > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Reserved seats: {selectedClient.reservedSeats.join(", ")}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Seat maps */}
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
                  <Box sx={{ overflowX: 'auto', py: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ width: 'max-content' }}>
                      {renderSeatMap(groupPairs1, "map1", "Seat Map 1")}
                      {renderSeatMap(groupPairs2, "map2", "Seat Map 2")}
                      {renderSeatMap(groupPairs3, "map3", "Seat Map 3")}
                      {renderSeatMap(groupPairs4, "map4", "Seat Map 4")}
                      {renderSeatMap(groupPairs5, "map5", "Seat Map 5")}
                    </Stack>
                  </Box>
                </Paper>
              </Box>
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
    </Box>
  );
}