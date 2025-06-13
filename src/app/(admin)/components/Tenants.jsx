"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";
import AddTenantModal from "./AddTenantsProps";
import AddtenantPO from "./AddTenantPO";
import TenantDetailsModal from "./TenantDetailsModal";
import ExtensionBillingModal from "./ExtensionBillingModal";
import AddTenantVirtual from "./AddTenantVirtual";
import EditTenantModal from "./EditTenantModal"; // <--- NEW: Import your EditTenantModal component
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
import { sendSubscriptionExpiryNotification } from "../../(admin)/utils/email"; // Make sure this is the correct import

// Utility functions (keeping them as is)
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
  const [virtualOfficeClients, setVirtualOfficeClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [tenantDetailsClient, setTenantDetailsClient] = useState(null);
  const [addModalType, setAddModalType] = useState("dedicated");
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState([1, 1, 1]);
  const [isPrivateTabLoaded, setIsPrivateTabLoaded] = useState(false);
  const [isVirtualTabLoaded, setIsVirtualTabLoaded] = useState(false);
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [clientToExtend, setClientToExtend] = useState(null);
  const [showVirtualOfficeModal, setShowVirtualOfficeModal] = useState(false);

  // --- NEW: State for editing tenant details ---
  const [editTenantModalOpen, setEditTenantModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    client: null,
    isPrivate: false,
  });

  // --- EMAIL NOTIFICATION HOOKS (keeping them as is) ---
  // Dedicated Desk
  useEffect(() => {
    if (!clients || clients.length === 0) return;

    clients.forEach(async (client) => {
      if (!client.billing?.billingEndDate || !client.email) return;

      const now = new Date();
      const end = new Date(client.billing.billingEndDate);
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (daysLeft === 30 && !client.billing?.notified30days) {
        try {
          await sendSubscriptionExpiryNotification({
            ...client,
            expiry_date: end.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          const clientRef = doc(db, "seatMap", client.id);
          await updateDoc(clientRef, { "billing.notified30days": true });
        } catch (err) {
          console.error("Failed to send notification to", client.email, err);
        }
      }
    });
  }, [clients]);

  // Private Office
  useEffect(() => {
    if (!privateOfficeClients || privateOfficeClients.length === 0) return;

    privateOfficeClients.forEach(async (client) => {
      if (!client.billing?.billingEndDate || !client.email) return;

      const now = new Date();
      const end = new Date(client.billing.billingEndDate);
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (daysLeft === 30 && !client.billing?.notified30days) {
        try {
          await sendSubscriptionExpiryNotification({
            ...client,
            expiry_date: end.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          const clientRef = doc(db, "privateOffice", client.id);
          await updateDoc(clientRef, { "billing.notified30days": true });
        } catch (err) {
          console.error("Failed to send notification to", client.email, err);
        }
      }
    });
  }, [privateOfficeClients]);

  // Virtual Office
  useEffect(() => {
    if (!virtualOfficeClients || virtualOfficeClients.length === 0) return;

    virtualOfficeClients.forEach(async (client) => {
      if (!client.billing?.billingEndDate || !client.email) return;

      const now = new Date();
      const end = new Date(client.billing.billingEndDate);
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (daysLeft === 30 && !client.billing?.notified30days) {
        try {
          await sendSubscriptionExpiryNotification({
            ...client,
            expiry_date: end.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              mday: "numeric",
            }),
          });
          const clientRef = doc(db, "virtualOffice", client.id);
          await updateDoc(clientRef, { "billing.notified30days": true });
        } catch (err) {
          console.error("Failed to send notification to", client.email, err);
        }
      }
    });
  }, [virtualOfficeClients]);
  // --- END EMAIL NOTIFICATION HOOKS ---

  // Initial data fetching for dedicated desks
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

  // Fetch private office data when tab is selected for the first time
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

  // Fetch virtual office data when tab is selected for the first time
  useEffect(() => {
    async function fetchVirtualOfficeData() {
      const querySnapshot = await getDocs(collection(db, "virtualOffice"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVirtualOfficeClients(docs);
      setIsVirtualTabLoaded(true);
    }
    if (tabIndex === 2 && !isVirtualTabLoaded) {
      fetchVirtualOfficeData();
    }
  }, [tabIndex, isVirtualTabLoaded]);

  // Function to refresh client data across all relevant collections
  const refreshClients = async () => {
    // Dedicated Desks
    const seatMapSnapshot = await getDocs(collection(db, "seatMap"));
    const seatMapDocs = seatMapSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(seatMapDocs);

    // Private Office
    const privateOfficeSnapshot = await getDocs(collection(db, "privateOffice"));
    const privateOfficeDocs = privateOfficeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPrivateOfficeClients(privateOfficeDocs);

    // Virtual Office
    const virtualOfficeSnapshot = await getDocs(collection(db, "virtualOffice"));
    const virtualOfficeDocs = virtualOfficeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVirtualOfficeClients(virtualOfficeDocs);
  };

  const handleOpenExtensionModal = (client) => {
    setClientToExtend(client);
    setExtensionModalOpen(true);
    setShowTenantDetails(false); // Close details modal when opening extension
  };

  // --- NEW: Edit Handlers ---
  const handleEditTenant = (client) => {
    setClientToEdit(client);
    setEditTenantModalOpen(true);
    setShowTenantDetails(false); // Close the details modal when opening edit
  };

  const handleCloseEditModal = () => {
    setEditTenantModalOpen(false);
    setClientToEdit(null);
  };

  const handleSaveEditedTenant = async (updatedClientData) => {
    let collectionName;
    // Determine the correct collection based on the client's type or identifying fields
    if (updatedClientData.type === "private" || (updatedClientData.selectedPO && updatedClientData.selectedPO.length > 0)) {
      collectionName = "privateOffice";
    } else if (updatedClientData.type === "virtual" || (updatedClientData.virtualOfficeFeatures && updatedClientData.virtualOfficeFeatures.length > 0)) {
      collectionName = "virtualOffice";
    } else {
      collectionName = "seatMap"; // Default to dedicated desks
    }

    try {
      const clientRef = doc(db, collectionName, updatedClientData.id);
      await updateDoc(clientRef, updatedClientData);
      console.log(`Client ${updatedClientData.id} updated successfully in ${collectionName}!`);
      handleCloseEditModal(); // Close the edit modal
      await refreshClients(); // Refresh data in the table
    } catch (error) {
      console.error("Error updating client:", error);
      // You might want to add user-facing error feedback here
    }
  };
  // --- END NEW: Edit Handlers ---


  // Filtering clients based on active status and type
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
  const virtualTabClients = virtualOfficeClients.filter(
    (client) => client.active !== false
  );

  const tabClientSets = [
    dedicatedDeskClients,
    privateOfficeActiveClients,
    virtualTabClients,
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

  const handleDeactivateClient = (client, isPrivate) => {
    setConfirmDialog({
      open: true,
      client,
      isPrivate,
    });
  };

  const confirmDeactivate = async () => {
    const { client, isPrivate } = confirmDialog;
    let collectionName;
    if (tabIndex === 0) collectionName = "seatMap"; // Dedicated
    else if (tabIndex === 1 || isPrivate) collectionName = "privateOffice"; // Private
    else if (tabIndex === 2) collectionName = "virtualOffice"; // Virtual (using "virtualOffice" as per your useEffect)
    
    // Safety check for client.id
    if (!client?.id || !collectionName) {
      console.error("Cannot deactivate: Missing client ID or collection name.");
      setConfirmDialog({ open: false, client: null, isPrivate: false });
      return;
    }

    try {
      const clientRef = doc(db, collectionName, client.id);
      await deleteDoc(clientRef);
      console.log(`Client ${client.id} deactivated from ${collectionName}.`);
    } catch (error) {
      console.error("Error deactivating client:", error);
    }
    
    setConfirmDialog({ open: false, client: null, isPrivate: false });
    await refreshClients(); // Refresh the data after deletion
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
      onClick={() => { setShowVirtualOfficeModal(true); }}
      sx={{ bgcolor: blue[600], "&:hover": { bgcolor: blue[700] }, mb: 2 }}
      fullWidth
    >
      Add Virtual Office Tenant
    </Button>,
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} >
        Tenants
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => {
          setTabIndex(newValue);
          // Re-fetch data if tab is switched to and not yet loaded, though refreshClients handles this broadly now
          // if (newValue === 1) setIsPrivateTabLoaded(false); // No longer strictly needed due to refreshClients
          // if (newValue === 2) setIsVirtualTabLoaded(false); // No longer strictly needed due to refreshClients
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
          <Table
            sx={{
              minWidth: 750,
              borderCollapse: "collapse",
              "& .MuiTableCell-root": { border: "1px solid #bdbdbd" },
              "& .MuiTableHead-root .MuiTableCell-root": { backgroundColor: grey[100], fontWeight: 600 }
            }}
          >
            <TableHead>
              <TableRow>
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
                <TableRow
                  key={client.id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { borderBottom: "1px solid #bdbdbd" }
                  }}
                >
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
                      {tabIndex === 0 && (
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
                      )}
                      {tabIndex === 1 && (
                        <Tooltip title="View Office">
                          <Button
                            variant="text"
                            sx={{ color: blue[700], fontWeight: 600, textTransform: 'none' }}
                            onClick={() => {
                              setSelectedClient(client);
                              setShowModal(true);
                            }}
                          >
                            View Office
                          </Button>
                        </Tooltip>
                      )}
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
          ) : tabIndex === 0 ? (
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
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Details Modal */}
      <TenantDetailsModal
        open={showTenantDetails}
        onClose={() => setShowTenantDetails(false)}
        client={tenantDetailsClient}
        onExtend={handleOpenExtensionModal}
        onEdit={handleEditTenant} 
      />

      {/* Add Tenant Modals (unchanged) */}
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
      {showVirtualOfficeModal && (
        <AddTenantVirtual
          showAddModal={showVirtualOfficeModal}
          setShowAddModal={setShowVirtualOfficeModal}
          refreshClients={refreshClients}
        />
      )}

      {/* Extension Billing Modal (unchanged) */}
      <ExtensionBillingModal
        open={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
        client={clientToExtend}
        refreshClients={refreshClients}
      />

      {/* --- NEW: Edit Tenant Modal --- */}
      {editTenantModalOpen && (
        <EditTenantModal
          open={editTenantModalOpen}
          onClose={handleCloseEditModal}
          client={clientToEdit}
          onSave={handleSaveEditedTenant} // Pass the function to handle saving updates
        />
      )}
      {/* --- END NEW: Edit Tenant Modal --- */}

      {/* Confirm Deactivate Dialog (unchanged) */}
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