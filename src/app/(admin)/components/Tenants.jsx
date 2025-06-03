"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";
import AddTenantModal from "./AddTenantsProps";
import AddtenantPO from "./AddTenantPO";
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
  Grid,
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
  const [privateOfficeClients, setPrivateOfficeClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [tenantDetailsClient, setTenantDetailsClient] = useState(null);
  const [addModalType, setAddModalType] = useState("dedicated");
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState([1, 1, 1]);
  const [isPrivateTabLoaded, setIsPrivateTabLoaded] = useState(false);

  // For "Deactivate" (which deletes) confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    client: null,
    isPrivate: false,
  });

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

  useEffect(() => {
    async function fetchPrivateOfficeData() {
      const querySnapshot = await getDocs(collection(db, "privateOffice"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrivateOfficeClients(docs);
      setIsPrivateTabLoaded(true);
    }
    if (tabIndex === 1 && !isPrivateTabLoaded) {
      fetchPrivateOfficeData();
    }
  }, [tabIndex, isPrivateTabLoaded]);

  const refreshClients = async () => {
    const querySnapshot = await getDocs(collection(db, "seatMap"));
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(docs);

    if (tabIndex === 1) {
      const privateSnapshot = await getDocs(collection(db, "privateOffice"));
      const privateDocs = privateSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrivateOfficeClients(privateDocs);
      setIsPrivateTabLoaded(true);
    }
  };

  const dedicatedDeskClients = clients.filter(
    (client) =>
      (client.type === "dedicated" ||
        (!client.type &&
          client.selectedSeats &&
          client.selectedSeats.length > 0 &&
          (!client.officeType || client.officeType === "dedicated desk"))) &&
      client.active !== false
  );
  const privateOfficeActiveClients = privateOfficeClients.filter(
    (client) => client.active !== false
  );
  const virtualOfficeClients = clients.filter(
    (client) =>
      (client.type === "virtual" ||
        client.officeType === "virtual office" ||
        (client.selectedSeats && client.selectedSeats.length === 0)) &&
      client.active !== false
  );

  const tabClientSets = [
    dedicatedDeskClients,
    privateOfficeActiveClients,
    virtualOfficeClients,
  ];

  const totalPages = tabClientSets.map((set) => Math.ceil(set.length / ITEMS_PER_PAGE));
  const paginatedClients = tabClientSets.map((set, i) =>
    set.slice((page[i] - 1) * ITEMS_PER_PAGE, page[i] * ITEMS_PER_PAGE)
  );

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
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          pb: 0,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Tenant Details
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {tenantDetailsClient?.company}
          </Typography>
        </Box>
        <IconButton onClick={() => setShowTenantDetails(false)} aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Client Information
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: "Name", value: tenantDetailsClient?.name },
                { label: "Company", value: tenantDetailsClient?.company },
                { label: "Email", value: tenantDetailsClient?.email },
                { label: "Phone", value: tenantDetailsClient?.phone },
                { label: "Address", value: tenantDetailsClient?.address },
                {
                  label: "Selected Seats",
                  value:
                    tenantDetailsClient?.selectedSeats?.length > 0
                      ? tenantDetailsClient.selectedSeats.join(", ")
                      : "None",
                },
              ].map(({ label, value }) => (
                <Grid item xs={6} key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {value || "N/A"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Billing Details
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: "Plan", value: tenantDetailsClient?.billing?.plan },
                {
                  label: "Rate",
                  value:
                    tenantDetailsClient?.billing?.rate !== undefined
                      ? `${tenantDetailsClient.billing.rate} ${tenantDetailsClient.billing.currency || ""}`
                      : null,
                },
                { label: "Currency", value: tenantDetailsClient?.billing?.currency },
                { label: "Payment Method", value: tenantDetailsClient?.billing?.paymentMethod },
                { label: "Start Date", value: tenantDetailsClient?.billing?.startDate },
                { label: "Billing End Date", value: tenantDetailsClient?.billing?.billingEndDate },
                { label: "Billing Address", value: tenantDetailsClient?.billing?.billingAddress },
                {
                  label: "Months to Avail",
                  value:
                    tenantDetailsClient?.billing?.monthsToAvail !== undefined
                      ? tenantDetailsClient.billing.monthsToAvail
                      : null,
                },
                {
                  label: "Total",
                  value:
                    tenantDetailsClient?.billing?.total !== undefined
                      ? `${tenantDetailsClient.billing.total} ${tenantDetailsClient.billing.currency || ""}`
                      : null,
                },
              ].map(({ label, value }) => (
                <Grid item xs={6} key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {value || "N/A"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
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

  // Deactivate (actually deletes)
  const handleDeactivateClient = (client, isPrivate) => {
    setConfirmDialog({
      open: true,
      client,
      isPrivate,
    });
  };

  const confirmDeactivate = async () => {
    const { client, isPrivate } = confirmDialog;
    const collectionName = isPrivate ? "privateOffice" : "seatMap";
    const clientRef = doc(db, collectionName, client.id);
    await deleteDoc(clientRef);
    setConfirmDialog({ open: false, client: null, isPrivate: false });
    await refreshClients();
  };

  const cancelDeactivate = () => {
    setConfirmDialog({ open: false, client: null, isPrivate: false });
  };

  const tabAddButtons = [
    <Button
      key="dedicated"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => { setAddModalType("dedicated"); setShowAddModal(true); }}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Dedicated Desk Tenant
    </Button>,
    <Button
      key="private"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => { setAddModalType("private"); setShowAddModal(true); }}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Private Office Tenant
    </Button>,
    <Button
      key="virtual"
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => { setAddModalType("virtual"); setShowAddModal(true); }}
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
        onChange={(_, newValue) => {
          setTabIndex(newValue);
          if (newValue === 1) setIsPrivateTabLoaded(false);
        }}
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
                  <Typography variant="caption" fontWeight={600}>
                    {tabIndex === 1 ? "Selected Offices" : "Selected Seats"}
                  </Typography>
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
                      {tabIndex === 1 ? (
                        client.selectedPO && client.selectedPO.length > 0
                          ? (Array.isArray(client.selectedPO)
                              ? client.selectedPO
                              : [client.selectedPO]
                            ).map((office, idx) => (
                              <Chip
                                key={idx}
                                label={office}
                                size="small"
                                sx={{
                                  bgcolor: blue[50],
                                  color: blue[800],
                                  mb: 0.5,
                                }}
                              />
                            ))
                          : <Typography variant="body2" color="text.secondary">None</Typography>
                      ) : (
                        client.selectedSeats && client.selectedSeats.length > 0
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
                          : <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={tabIndex === 1 ? "View Office" : "View Seat Map"}>
                        <Button
                          variant="text"
                          sx={{ color: blue[700], fontWeight: 600, textTransform: 'none' }}
                          onClick={() => {
                            setSelectedClient(client);
                            setShowModal(true);
                          }}
                        >
                          {tabIndex === 1 ? "View Office" : "View Map"}
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
                      <Tooltip title="Deactivate Client">
                        <Button
                          variant="text"
                          sx={{ color: red[700], fontWeight: 600, textTransform: 'none' }}
                          onClick={() => handleDeactivateClient(client, tabIndex === 1)}
                        >
                          Deactivate
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
              {selectedClient?.name}&apos;s {tabIndex === 1 ? "Office" : "Seat Map"}
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
          {tabIndex === 1 ? (
            <Box>
              <Typography fontWeight={600} gutterBottom>
                Occupied Offices:
              </Typography>
              <Typography color="text.secondary" mb={2}>
                {selectedClient?.selectedPO && (
                  Array.isArray(selectedClient.selectedPO)
                    ? selectedClient.selectedPO.join(", ")
                    : selectedClient.selectedPO
                )}
              </Typography>
              <Divider />
            </Box>
          ) : (
            <>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {showTenantDetails && renderTenantDetails()}
      {showAddModal && addModalType === "private" && (
        <AddtenantPO
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          refreshClients={refreshClients}
        />
      )}
      {showAddModal && addModalType !== "private" && (
        <AddTenantModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          refreshClients={refreshClients}
          type={addModalType}
        />
      )}
      {/* Confirm Deactivate Dialog (actually deletes) */}
      <Dialog
        open={confirmDialog.open}
        onClose={cancelDeactivate}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Deactivate Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <b>deactivate</b> client <b>{confirmDialog.client?.name}</b> and remove all their data? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeactivate} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeactivate} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}