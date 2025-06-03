"use client";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";

// MUI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { blue, green, grey, red } from "@mui/material/colors";

// Import seat maps and utility functions
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";

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

export default function AddTenantModal({
  showAddModal,
  setShowAddModal,
  refreshClients,
}) {
  const [newTenant, setNewTenant] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    selectedSeats: [],
  });
  const [tempSelectedSeats, setTempSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs state
  const [tabIndex, setTabIndex] = useState(0);

  // Fetch all occupied seats from the database
  useEffect(() => {
    async function fetchOccupiedSeats() {
      try {
        const querySnapshot = await getDocs(collection(db, "seatMap"));
        const allOccupiedSeats = [];
        querySnapshot.forEach((doc) => {
          const tenantData = doc.data();
          if (tenantData.selectedSeats) {
            allOccupiedSeats.push(...tenantData.selectedSeats);
          }
        });
        setOccupiedSeats(allOccupiedSeats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching occupied seats: ", error);
        setIsLoading(false);
      }
    }

    if (showAddModal) {
      setIsLoading(true);
      fetchOccupiedSeats();
      setTabIndex(0); // Reset tab to first tab when opening
    }
  }, [showAddModal]);

  const handleAddTenant = async () => {
    try {
      const tenantWithSeats = {
        ...newTenant,
        selectedSeats: tempSelectedSeats,
      };

      await addDoc(collection(db, "seatMap"), tenantWithSeats);

      // Refresh the clients list in parent component
      refreshClients();

      handleClose();
    } catch (error) {
      console.error("Error adding tenant: ", error);
    }
  };

  const handleClose = () => {
    setShowAddModal(false);
    setNewTenant({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      selectedSeats: [],
    });
    setTempSelectedSeats([]);
    setTabIndex(0);
  };

  const toggleSeatSelection = (seatKey) => {
    if (occupiedSeats.includes(seatKey)) {
      alert("This seat is already occupied!");
      return;
    }

    setTempSelectedSeats((prev) =>
      prev.includes(seatKey)
        ? prev.filter((seat) => seat !== seatKey)
        : [...prev, seatKey]
    );
  };

  // --- MUI Card style map (same as previous prompt style)
  const renderSeatMap = (groupPairs, mapType, title) => (
    <Card variant="outlined" sx={{ minWidth: 200, flexShrink: 0 }}>
      <CardContent>
        <Typography variant="subtitle2" align="center" gutterBottom fontWeight="medium">
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
                      const isSelected = tempSelectedSeats.includes(seatKey);
                      const isOccupied = occupiedSeats.includes(seatKey);
                      const isWindow = seat.type === "window";

                      let seatBg = grey[100];
                      let seatColor = grey[800];
                      let barColor = grey[300];

                      if (isOccupied) {
                        seatBg = red[400];
                        seatColor = "#fff";
                        barColor = red[600];
                      } else if (isSelected) {
                        seatBg = green[400];
                        seatColor = "#fff";
                        barColor = green[600];
                      } else if (isWindow) {
                        seatBg = grey[200];
                        seatColor = grey[900];
                        barColor = grey[400];
                      } else {
                        seatBg = grey[50];
                        seatColor = grey[800];
                        barColor = grey[300];
                      }

                      const disabled = isOccupied;

                      return (
                        <Box key={seat.id} position="relative" mr={isWindow ? 1 : 0.5}>
                          <Button
                            variant="contained"
                            disableElevation
                            sx={{
                              minWidth: 40,
                              height: 24,
                              p: 0,
                              bgcolor: seatBg,
                              color: seatColor,
                              fontSize: '0.6rem',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${barColor}`,
                              borderRadius: 0.5,
                              boxShadow: "none",
                              cursor: disabled ? "not-allowed" : "pointer",
                              '&:hover': {
                                bgcolor: disabled
                                  ? seatBg
                                  : isSelected
                                  ? green[500]
                                  : isWindow
                                  ? grey[300]
                                  : grey[100],
                              },
                            }}
                            disableRipple
                            disableFocusRipple
                            disabled={disabled}
                            onClick={
                              !disabled
                                ? () => toggleSeatSelection(seatKey)
                                : undefined
                            }
                          >
                            <Monitor size={10} style={{ marginBottom: 2 }} />
                            <span>{seat.number}</span>
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
    <Dialog
      open={showAddModal}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh" },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <Typography fontWeight={700}>
          Add New Tenant
        </Typography>
        <IconButton onClick={handleClose} aria-label="close" size="large" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={256}>
            <CircularProgress color="primary" size={56} thickness={4} />
          </Box>
        ) : (
          <>
            <Tabs
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              sx={{ mb: 3 }}
              variant="fullWidth"
              centered
            >
              <Tab label="Tenant Details" />
              <Tab label="Seat Map" />
            </Tabs>

            {/* Tenant Details Tab */}
            {tabIndex === 0 && (
              <Box>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={4}>
                  <TextField
                    label="Tenant Name"
                    fullWidth
                    value={newTenant.name}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, name: e.target.value })
                    }
                    variant="outlined"
                  />
                  <TextField
                    label="Company"
                    fullWidth
                    value={newTenant.company}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, company: e.target.value })
                    }
                    variant="outlined"
                  />
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={4}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={newTenant.email}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, email: e.target.value })
                    }
                    variant="outlined"
                    type="email"
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    value={newTenant.phone}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, phone: e.target.value })
                    }
                    variant="outlined"
                    type="tel"
                  />
                  <TextField
                    label="Address"
                    fullWidth
                    value={newTenant.address}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, address: e.target.value })
                    }
                    variant="outlined"
                  />
                </Stack>
                <Box mb={2}>
                  <Typography fontWeight={600} gutterBottom>
                    Selected Seats:
                  </Typography>
                  {tempSelectedSeats.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {tempSelectedSeats.map((seat, idx) => (
                        <Chip
                          key={idx}
                          label={seat}
                          size="small"
                          sx={{ bgcolor: blue[50], color: blue[800], mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">
                      No seats selected
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Seat Map Tab */}
            {tabIndex === 1 && (
              <Box bgcolor={grey[50]} p={2} borderRadius={2}>
                <Box
                  sx={{
                    overflowX: "auto",
                    width: "100%",
                    minWidth: "max-content",
                    pb: 1,
                  }}
                >
                  <Stack direction="row" spacing={2} minWidth="max-content">
                    {renderSeatMap(groupPairs1, "map1", "Seat Map 1")}
                    {renderSeatMap(groupPairs2, "map2", "Seat Map 2")}
                    {renderSeatMap(groupPairs3, "map3", "Seat Map 3")}
                    {renderSeatMap(groupPairs4, "map4", "Seat Map 4")}
                    {renderSeatMap(groupPairs5, "map5", "Seat Map 5")}
                  </Stack>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleAddTenant}
          disabled={
            !newTenant.name ||
            !newTenant.company ||
            !newTenant.email ||
            !newTenant.phone ||
            !newTenant.address ||
            tempSelectedSeats.length === 0 ||
            isLoading
          }
          variant="contained"
          color="primary"
        >
          Add Tenant
        </Button>
      </DialogActions>
    </Dialog>
  );
}