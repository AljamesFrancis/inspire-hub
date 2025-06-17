"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteField, serverTimestamp, query, where, getDoc } from "firebase/firestore";
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
import EditTenantModal from "./EditTenantModal";
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
  TextField, // Import TextField for password input
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { blue, green, grey, red, purple } from "@mui/material/colors";
import { sendSubscriptionExpiryNotification } from "../../(admin)/utils/email";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; // Import Firebase Auth functions

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
  const [page, setPage] = useState([1, 1, 1]); // Adjusted for 3 tabs
  const [isPrivateTabLoaded, setIsPrivateTabLoaded] = useState(false); // Unused, can be removed
  const [isVirtualTabLoaded, setIsVirtualTabLoaded] = useState(false); // Unused, can be removed
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [clientToExtend, setClientToExtend] = useState(null);
  const [showVirtualOfficeModal, setShowVirtualOfficeModal] = useState(false);

  const [editTenantModalOpen, setEditTenantModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    client: null,
    type: null, // Now stores the type of client (dedicated, private, virtual)
    password: "", // Add state for password input
    error: "", // Add state for error messages
  });

  // --- EMAIL NOTIFICATION HOOKS (keeping them as is) ---
  // Dedicated Desk
  useEffect(() => {
    if (!clients || clients.length === 0) return;

    clients.forEach(async (client) => {
      if (!client.billing?.billingEndDate || !client.email || client.status === "deactivated") return; // Added status check

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
      if (!client.billing?.billingEndDate || !client.email || client.status === "deactivated") return; // Added status check

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
      if (!client.billing?.billingEndDate || !client.email || client.status === "deactivated") return; // Added status check

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
          const clientRef = doc(db, "virtualOffice", client.id);
          await updateDoc(clientRef, { "billing.notified30days": true });
        } catch (err) {
          console.error("Failed to send notification to", client.email, err);
        }
      }
    });
  }, [virtualOfficeClients]);
  // --- END EMAIL NOTIFICATION HOOKS ---

  // Initial data fetching for all client types (with 'active' status filter)
  useEffect(() => {
    async function fetchData() {
      // Fetch 'seatMap' clients with status "active"
      const seatMapQuery = query(
        collection(db, "seatMap"),
        where("status", "==", "active") // Added status filter
      );
      const seatMapSnapshot = await getDocs(seatMapQuery);
      const seatMapDocs = seatMapSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(seatMapDocs);

      // Fetch 'privateOffice' clients with status "active"
      const privateOfficeQuery = query(
        collection(db, "privateOffice"),
        where("status", "==", "active") // Added status filter
      );
      const privateOfficeSnapshot = await getDocs(privateOfficeQuery);
      const privateOfficeDocs = privateOfficeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrivateOfficeClients(privateOfficeDocs);

      // Fetch 'virtualOffice' clients with status "active"
      const virtualOfficeQuery = query(
        collection(db, "virtualOffice"),
        where("status", "==", "active") // Added status filter
      );
      const virtualOfficeSnapshot = await getDocs(virtualOfficeQuery);
      const virtualOfficeDocs = virtualOfficeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVirtualOfficeClients(virtualOfficeDocs);
    }
    fetchData();
  }, []); // Run only once on mount

  // Function to refresh client data across all relevant collections (now fetches only 'active' clients)
  const refreshClients = async () => {
    // Dedicated Desks
    const seatMapQuery = query(
      collection(db, "seatMap"),
      where("status", "==", "active")
    );
    const seatMapSnapshot = await getDocs(seatMapQuery);
    const seatMapDocs = seatMapSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(seatMapDocs);

    // Private Office
    const privateOfficeQuery = query(
      collection(db, "privateOffice"),
      where("status", "==", "active")
    );
    const privateOfficeSnapshot = await getDocs(privateOfficeQuery);
    const privateOfficeDocs = privateOfficeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPrivateOfficeClients(privateOfficeDocs);

    // Virtual Office
    const virtualOfficeQuery = query(
      collection(db, "virtualOffice"),
      where("status", "==", "active")
    );
    const virtualOfficeSnapshot = await getDocs(virtualOfficeQuery);
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
      handleCloseEditModal();
      await refreshClients();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  // --- MODIFIED: handleDeactivateClient to pass the client type ---
  const handleDeactivateClient = (client, type) => {
    setConfirmDialog({
      open: true,
      client,
      type, // Pass the detected type (dedicated, private, virtual)
      password: "", // Clear password field on open
      error: "", // Clear any previous errors
    });
  };

  // --- NEW: handlePasswordChange for the input field ---
  const handlePasswordChange = (event) => {
    setConfirmDialog((prev) => ({ ...prev, password: event.target.value, error: "" }));
  };

  // --- CORRECTED: confirmDeactivate to use state variables and add password verification ---

const confirmDeactivate = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    setConfirmDialog((prev) => ({ ...prev, error: "No authenticated user found. Please log in again." }));
    return;
  }

  const { client, type, password } = confirmDialog;

  if (!client || !client.id || !type || !password) {
    setConfirmDialog((prev) => ({ ...prev, error: "Missing client data, type, or password." }));
    return;
  }

  try {
    // 1. Reauthenticate the user with their password
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    console.log("User reauthenticated successfully.");

    // --- Fetch user's firstName from Firestore ---
    let deactivatedByName = null; // Initialize as null
    try {
      console.log("Current authenticated user UID:", user.uid); // For debugging
      const userDocRef = doc(db, "users", user.uid); // Reference to the user's document in 'users' collection
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Fetched user data from Firestore:", userData); // For debugging
        if (userData.firstName) {
          deactivatedByName = userData.firstName;
          console.log("Found firstName:", deactivatedByName); // For debugging
        } else {
          console.log("firstName field is missing or empty in user document."); // For debugging
        }
      } else {
        console.log("User document DOES NOT EXIST for UID:", user.uid); // For debugging
      }
    } catch (fetchError) {
      console.warn("Could not fetch user's first name from Firestore:", fetchError);
      // deactivatedByName will remain null, leading to 'deactivatedBy' not being added to updateData
    }
    // --- End: Fetch user's firstName ---

    // 2. If reauthentication is successful, proceed with deactivation
    let collectionName;
    const updateData = {
      status: 'deactivated', // Set status to deactivated
      deactivatedAt: serverTimestamp(), // Use serverTimestamp() directly
      // Conditionally add deactivatedBy field ONLY if deactivatedByName has a value
      ...(deactivatedByName && { deactivatedBy: deactivatedByName }),
      deactivatedById: user.uid, // Store the UID of the user who deactivated
    };

    // Determine collection and specific fields to delete based on client type
    if (type === "dedicated") {
      collectionName = "seatMap";
      updateData.selectedSeats = deleteField(); // Delete 'selectedSeats' for dedicated desks
    } else if (type === "private") {
      collectionName = "privateOffice";
      updateData.selectedPO = deleteField(); // Delete 'selectedPO' for private offices
    } else if (type === "virtual") {
      collectionName = "virtualOffice";
      // For virtual office clients, you might not have specific resource fields like seats or offices
      // to clear out in the same way. Add any relevant fields here if needed.
    } else {
      setConfirmDialog((prev) => ({ ...prev, error: "Unknown client type for deactivation. Aborting." }));
      return;
    }

    const clientRef = doc(db, collectionName, client.id); // Use client.id
    await updateDoc(clientRef, updateData);
    console.log(`Client ${client.id} status set to 'deactivated' and resource fields cleared in ${collectionName}.`);
    setConfirmDialog({ open: false, client: null, type: null, password: "", error: "" });
    await refreshClients(); // Refresh the data after the update
  } catch (error) {
    console.error("Error during deactivation process:", error);
    let errorMessage = "Failed to deactivate client.";
    if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid credentials. Please log in again.";
    } else if (error.code === "auth/user-mismatch") {
      errorMessage = "Authentication failed. User mismatch.";
    }
    setConfirmDialog((prev) => ({ ...prev, error: errorMessage }));
  }
};

  const cancelDeactivate = () => {
    setConfirmDialog({ open: false, client: null, type: null, password: "", error: "" });
  };

  // --- MODIFIED: Filtering clients based on 'status' field ---
  // These filters are now redundant if the fetch/refresh already filters for "active"
  // However, keeping them here ensures robustness if a client-side mutation changes status before refresh
  // but if the data is consistently loaded with `status === 'active'`, these `filter` calls
  // will essentially return the original array.
  const dedicatedDeskClients = clients.filter(
    (client) =>
      (client.type === "dedicated" ||
        (!client.type && // Backward compatibility for old records without 'type'
          client.selectedSeats &&
          client.selectedSeats.length > 0 &&
          (!client.officeType || client.officeType === "dedicated desk"))) &&
      client.status !== 'deactivated' // This filter is now mostly redundant if initial fetch/refresh already filters
  );
  const privateOfficeActiveClients = privateOfficeClients.filter(
    (client) => client.status !== 'deactivated' // This filter is now mostly redundant
  );
  const virtualTabClients = virtualOfficeClients.filter(
    (client) => client.status !== 'deactivated' // This filter is now mostly redundant
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
                          onClick={() => handleDeactivateClient(client, tabIndex === 0 ? "dedicated" : tabIndex === 1 ? "private" : "virtual")}
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

      {/* Add Tenant Modals */}
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

      {/* Extension Billing Modal */}
      <ExtensionBillingModal
        open={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
        client={clientToExtend}
        refreshClients={refreshClients}
      />

      {/* Edit Tenant Modal */}
      {editTenantModalOpen && (
        <EditTenantModal
          open={editTenantModalOpen}
          onClose={handleCloseEditModal}
          client={clientToEdit}
          refreshClients={refreshClients}
          onSave={handleSaveEditedTenant}
        />
      )}

      {/* Confirm Deactivation Dialog with Password Input */}
      <Dialog
        open={confirmDialog.open}
        onClose={cancelDeactivate}
        aria-labelledby="confirm-deactivate-title"
        aria-describedby="confirm-deactivate-description"
      >
        <DialogTitle id="confirm-deactivate-title">Confirm Deactivation</DialogTitle>
        <DialogContent dividers>
          <Typography id="confirm-deactivate-description" gutterBottom>
            Are you sure you want to deactivate **{confirmDialog.client?.name}** ({confirmDialog.client?.company})?
            This action cannot be undone. To proceed, please enter your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Your Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmDialog.password}
            onChange={handlePasswordChange}
            error={!!confirmDialog.error}
            helperText={confirmDialog.error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeactivate} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeactivate}
            color="error"
            variant="contained"
            disabled={!confirmDialog.password} // Disable button if password is empty
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}