"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";
import AddTenantModal from "./AddTenantsProps";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Pagination,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { blue, green, grey, red, purple } from "@mui/material/colors";

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

const ITEMS_PER_PAGE = 8;

export default function SeatMapTable() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [tenantDetailsClient, setTenantDetailsClient] = useState(null);

  // Tabs state
  const [tabIndex, setTabIndex] = useState(0);

  // Pagination state for each tab
  const [page, setPage] = useState([1, 1, 1]);

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(docs);
    }
    fetchData();
  }, []);

  const refreshClients = async () => {
    const querySnapshot = await getDocs(collection(db, "seatMap"));
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(docs);
  };

  // Filtering logic per tab
  const dedicatedDeskClients = clients.filter(
    (client) =>
      client.type === "dedicated" ||
      (!client.type &&
        client.selectedSeats &&
        client.selectedSeats.length > 0 &&
        (!client.officeType || client.officeType === "dedicated desk"))
  );
  const privateOfficeClients = clients.filter(
    (client) =>
      client.type === "private" ||
      client.officeType === "private office"
  );
  const virtualOfficeClients = clients.filter(
    (client) =>
      client.type === "virtual" ||
      client.officeType === "virtual office" ||
      (client.selectedSeats && client.selectedSeats.length === 0)
  );
  const tabClientSets = [dedicatedDeskClients, privateOfficeClients, virtualOfficeClients];

  const totalPages = tabClientSets.map((set) => Math.ceil(set.length / ITEMS_PER_PAGE));
  const paginatedClients = tabClientSets.map((set, i) =>
    set.slice((page[i] - 1) * ITEMS_PER_PAGE, page[i] * ITEMS_PER_PAGE)
  );

  // Rendering seat map modal (as card grid, like your preferred MUI map)
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
                      const isSelected = selectedClient?.selectedSeats?.includes(seatKey);
                      const isWindow = seat.type === "window";
                      let seatBg = grey[100], seatColor = grey[800], barColor = grey[300];
                      if (isSelected) {
                        seatBg = green[400]; seatColor = "#fff"; barColor = red[600];
                      } else if (isWindow) {
                        seatBg = grey[200]; seatColor = grey[900]; barColor = grey[400];
                      }
                      return (
                        <Box key={seat.id} position="relative" mr={isWindow ? 1 : 0.5}>
                          <Box
                            sx={{
                              minWidth: 40, height: 24, p: 0,
                              bgcolor: seatBg, color: seatColor, fontSize: '0.6rem',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${barColor}`, borderRadius: 0.5,
                            }}>
                            <Monitor size={10} style={{ marginBottom: 2 }} />
                            <span>{seat.number}</span>
                          </Box>
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

  const renderTenantDetails = () => (
    <Dialog
      open={showTenantDetails}
      onClose={() => setShowTenantDetails(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Tenant Details
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {tenantDetailsClient?.company}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowTenantDetails(false)}
          aria-label="close"
          size="large"
          sx={{ ml: 2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Name</Typography>
            <Typography variant="body2">{tenantDetailsClient?.name}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Company</Typography>
            <Typography variant="body2">{tenantDetailsClient?.company}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Email</Typography>
            <Typography variant="body2">{tenantDetailsClient?.email || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Phone</Typography>
            <Typography variant="body2">{tenantDetailsClient?.phone || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Selected Seats</Typography>
            <Typography variant="body2">
              {tenantDetailsClient?.selectedSeats && tenantDetailsClient.selectedSeats.length > 0
                ? tenantDetailsClient.selectedSeats.join(", ")
                : "None"}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTenantDetails(false)} color="primary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add button for each tab
  const tabAddButtons = [
    <Button
      key="dedicated"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowAddModal(true)}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Dedicated Desk Tenant
    </Button>,
    <Button
      key="private"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowAddModal(true)}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Private Office Tenant
    </Button>,
    <Button
      key="virtual"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowAddModal(true)}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Virtual Office Tenant
    </Button>,
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Tenants
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Dedicated Desk" />
        <Tab label="Private Office" />
        <Tab label="Virtual Office" />
      </Tabs>
      {tabAddButtons[tabIndex]}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: grey[100] }}>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Company</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Client Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Email</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Phone</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Selected Seats</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClients[tabIndex].map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{client.company}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: purple[500], width: 28, height: 28, fontSize: 16 }}>
                        {client.name?.[0]?.toUpperCase() || "?"}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>{client.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {client.email || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {client.phone || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {client.selectedSeats && client.selectedSeats.length > 0
                        ? client.selectedSeats.map((seat, idx) => (
                            <Chip
                              key={idx}
                              label={seat}
                              size="small"
                              sx={{
                                bgcolor: blue[50],
                                color: blue[800],
                                mb: 0.5,
                              }}
                            />
                          ))
                        : <Typography variant="body2" color="text.secondary">None</Typography>}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Seat Map">
                        <Button
                          variant="text"
                          sx={{ color: blue[700], fontWeight: 600, textTransform: 'none' }}
                          onClick={() => {
                            setSelectedClient(client);
                            setShowModal(true);
                          }}
                        >
                          View Map
                        </Button>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <Button
                          variant="text"
                          sx={{ color: green[700], fontWeight: 600, textTransform: 'none' }}
                          onClick={() => {
                            setTenantDetailsClient(client);
                            setShowTenantDetails(true);
                          }}
                        >
                          Details
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="center" mt={3} mb={2}>
          <Pagination
            count={totalPages[tabIndex]}
            page={page[tabIndex]}
            onChange={(_, val) => {
              const newPages = [...page];
              newPages[tabIndex] = val;
              setPage(newPages);
            }}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Paper>
      {/* View Seat Map Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {selectedClient?.name}&apos;s Seat Map
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {selectedClient?.company}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowModal(false)}
            aria-label="close"
            size="large"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography fontWeight={600} gutterBottom>
              Selected Seats:
            </Typography>
            <Typography color="text.secondary">
              {selectedClient?.selectedSeats && selectedClient.selectedSeats.length > 0
                ? `${selectedClient.selectedSeats.length} seat${selectedClient.selectedSeats.length > 1 ? "s" : ""}`
                : "0"}
            </Typography>
          </Box>
          <Box bgcolor={grey[50]} p={2} borderRadius={2}>
            <Box
              sx={{
                overflowX: "auto",
                width: "100%",
                minWidth: "max-content",
                pb: 1
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Tenant Details Modal */}
      {showTenantDetails && renderTenantDetails()}
      {/* Add Tenant Modal */}
      {showAddModal && (
        <AddTenantModal 
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          refreshClients={refreshClients}
        />
      )}
    </Box>
  );
}