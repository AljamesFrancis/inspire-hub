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
  Grid,
  InputAdornment,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  blue,
  green,
  grey,
  red,
} from "@mui/material/colors";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Chair as ChairIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

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

const rowEntries1 = Object.entries(groupedSeats1).sort(([a], [b]) =>
  a.localeCompare(b)
);
const rowEntries2 = Object.entries(groupedSeats2).sort(([a], [b]) =>
  a.localeCompare(b)
);
const rowEntries3 = Object.entries(groupedSeats3).sort(([a], [b]) =>
  a.localeCompare(b)
);
const rowEntries4 = Object.entries(groupedSeats4).sort(([a], [b]) =>
  a.localeCompare(b)
);
const rowEntries5 = Object.entries(groupedSeats5).sort(([a], [b]) =>
  a.localeCompare(b)
);

const groupPairs1 = groupIntoPairs(rowEntries1);
const groupPairs2 = groupIntoPairs(rowEntries2);
const groupPairs3 = groupIntoPairs(rowEntries3);
const groupPairs4 = groupIntoPairs(rowEntries4);
const groupPairs5 = groupIntoPairs(rowEntries5);

// Helper to format number as PHP currency with thousands separator
function formatPHP(amount) {
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
    billing: {
      plan: "monthly",
      rate: 0,
      currency: "PHP",
      startDate: new Date().toISOString().split('T')[0],
      billingEndDate: "",
      paymentMethod: "credit",
      billingAddress: "",
      monthsToAvail: 1,
      total: 0,
    },
  });
  const [tempSelectedSeats, setTempSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    company: false,
    email: false,
    phone: false,
    address: false,
    seats: false,
    billingRate: false,
    monthsToAvail: false,
  });

  // Tabs state
  const [tabIndex, setTabIndex] = useState(0);

  // Function to calculate billing end date
  const calculateBillingEndDate = (startDate, monthsToAvail) => {
    if (!startDate || !monthsToAvail) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + Number(monthsToAvail));
    if (end.getDate() < start.getDate()) {
        end.setDate(0);
    }
    return end.toISOString().split('T')[0];
  };

  // Effect to calculate initial billing end date and when modal opens
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
      // Calculate initial billing end date
      setNewTenant(prev => ({
        ...prev,
        billing: {
          ...prev.billing,
          billingEndDate: calculateBillingEndDate(prev.billing.startDate, prev.billing.monthsToAvail),
          currency: "PHP"
        }
      }));
    }
  }, [showAddModal]);

  const calculateTotal = () => {
    const rate = parseFloat(newTenant.billing.rate) || 0;
    const seatCount = tempSelectedSeats.length;
    const months = parseInt(newTenant.billing.monthsToAvail) || 1;
    return rate * seatCount * months;
  };

  const validateForm = () => {
    const newErrors = {
      name: !newTenant.name,
      company: !newTenant.company,
      email: !newTenant.email || !/^\S+@\S+\.\S+$/.test(newTenant.email),
      phone: !newTenant.phone,
      address: !newTenant.address,
      seats: tempSelectedSeats.length === 0,
      billingRate: newTenant.billing.rate <= 0,
      monthsToAvail: newTenant.billing.monthsToAvail <= 0,
      total: calculateTotal() <= 0
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddTenant = async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const computedTotal = calculateTotal();
      const tenantWithSeats = {
        ...newTenant,
        selectedSeats: tempSelectedSeats,
        createdAt: new Date().toISOString(),
        billing: {
          ...newTenant.billing,
          total: computedTotal,
        },
      };

      await addDoc(collection(db, "seatMap"), tenantWithSeats);

      // Refresh the clients list in parent component
      refreshClients();

      handleClose();
    } catch (error) {
      console.error("Error adding tenant: ", error);
    } finally {
      setIsSubmitting(false);
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
      billing: {
        plan: "monthly",
        rate: 0,
        currency: "PHP",
        startDate: new Date().toISOString().split('T')[0],
        billingEndDate: "",
        paymentMethod: "credit",
        billingAddress: "",
        monthsToAvail: 1,
        total: 0,
      },
    });
    setTempSelectedSeats([]);
    setTabIndex(0);
    setErrors({
      name: false,
      company: false,
      email: false,
      phone: false,
      address: false,
      seats: false,
      billingRate: false,
      monthsToAvail: false,
    });
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
    setErrors((prev) => ({ ...prev, seats: false }));
  };

  const handleInputChange = (field, value) => {
    setNewTenant({ ...newTenant, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleBillingChange = (field, value) => {
    setNewTenant(prev => {
      const updatedBilling = {
        ...prev.billing,
        [field]: value
      };

      // Always set the currency to PHP
      updatedBilling.currency = "PHP";

      // Recalculate billingEndDate if startDate or monthsToAvail changes
      if (field === 'startDate' || field === 'monthsToAvail') {
        updatedBilling.billingEndDate = calculateBillingEndDate(
          updatedBilling.startDate,
          updatedBilling.monthsToAvail
        );
      }

      return {
        ...prev,
        billing: updatedBilling
      };
    });

    if (field === 'rate') {
      setErrors(prev => ({ ...prev, billingRate: value <= 0 }));
    }
    if (field === 'monthsToAvail') {
      setErrors(prev => ({ ...prev, monthsToAvail: value <= 0 }));
    }
  };

  const renderSeatMap = (groupPairs, mapType, title) => (
    <Card variant="outlined" sx={{ minWidth: 200, flexShrink: 0 }}>
      <CardContent>
        <Typography
          variant="subtitle2"
          align="center"
          gutterBottom
          fontWeight="medium"
        >
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
                        <Box
                          position="relative"
                          key={seat.id}
                          mr={isWindow ? 1 : 0.5}
                        >
                          <Button
                            variant="contained"
                            disableElevation
                            sx={{
                              minWidth: 40,
                              height: 24,
                              p: 0,
                              bgcolor: seatBg,
                              color: seatColor,
                              fontSize: "0.6rem",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1px solid ${barColor}`,
                              borderRadius: 0.5,
                              boxShadow: "none",
                              cursor: disabled ? "not-allowed" : "pointer",
                              "&:hover": {
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
                            disabled={disabled || isSubmitting}
                            onClick={
                              !disabled && !isSubmitting
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
        sx: { maxHeight: "90vh", borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: blue[50],
          borderBottom: `1px solid ${grey[200]}`,
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: blue[500], mr: 2, width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            Add New Tenant
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          aria-label="close"
          size="small"
          sx={{
            "&:hover": { bgcolor: grey[100] },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={256}
          >
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
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center">
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    Tenant Details
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center">
                    <ChairIcon fontSize="small" sx={{ mr: 1 }} />
                    Seat Selection
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center">
                    <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                    Billing
                  </Box>
                }
              />
            </Tabs>

            {/* Tenant Details Tab */}
            {tabIndex === 0 && (
              <Box>
                <Grid container spacing={3} mb={3} direction="column">
                  <Grid item xs={12}>
                    <TextField
                      label="Tenant Name"
                      fullWidth
                      value={newTenant.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      variant="outlined"
                      error={errors.name}
                      helperText={errors.name ? "Name is required" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color={errors.name ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Company"
                      fullWidth
                      value={newTenant.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      variant="outlined"
                      error={errors.company}
                      helperText={errors.company ? "Company is required" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color={errors.company ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      fullWidth
                      value={newTenant.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      variant="outlined"
                      type="email"
                      error={errors.email}
                      helperText={
                        errors.email
                          ? !newTenant.email
                            ? "Email is required"
                            : "Please enter a valid email"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color={errors.email ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone"
                      fullWidth
                      value={newTenant.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      variant="outlined"
                      type="tel"
                      error={errors.phone}
                      helperText={errors.phone ? "Phone is required" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color={errors.phone ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      fullWidth
                      value={newTenant.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      variant="outlined"
                      multiline
                      rows={2}
                      error={errors.address}
                      helperText={errors.address ? "Address is required" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color={errors.address ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>
                </Grid>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: grey[50],
                    borderRadius: 2,
                    border: `1px solid ${errors.seats ? red[200] : grey[200]}`,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <ChairIcon
                      color={errors.seats ? "error" : "action"}
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      fontWeight={600}
                      color={errors.seats ? "error" : "text.primary"}
                    >
                      Selected Seats:
                    </Typography>
                  </Box>
                  {tempSelectedSeats.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {tempSelectedSeats.map((seat, idx) => (
                        <Chip
                          key={idx}
                          label={seat}
                          size="small"
                          sx={{
                            bgcolor: blue[50],
                            color: blue[800],
                            mb: 0.5,
                            "& .MuiChip-deleteIcon": {
                              color: blue[400],
                              "&:hover": { color: blue[600] },
                            },
                          }}
                          onDelete={!isSubmitting ? () =>
                            setTempSelectedSeats((prev) =>
                              prev.filter((s) => s !== seat)
                            ) : undefined}
                          disabled={isSubmitting}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      color={errors.seats ? "error" : "text.secondary"}
                    >
                      {errors.seats
                        ? "Please select at least one seat"
                        : "No seats selected"}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}

            {/* Seat Map Tab */}
            {tabIndex === 1 && (
              <Box>
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: blue[50],
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography fontWeight={600} gutterBottom>
                      Seat Selection Guide
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Box display="flex" alignItems="center">
                        <Box
                          width={16}
                          height={16}
                          bgcolor={green[400]}
                          mr={1}
                          border={`1px solid ${green[600]}`}
                        />
                        <Typography variant="caption">Selected</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Box
                          width={16}
                          height={16}
                          bgcolor={red[400]}
                          mr={1}
                          border={`1px solid ${red[600]}`}
                        />
                        <Typography variant="caption">Occupied</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Box
                          width={16}
                          height={16}
                          bgcolor={grey[200]}
                          mr={1}
                          border={`1px solid ${grey[400]}`}
                        />
                        <Typography variant="caption">Window</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Box
                          width={16}
                          height={16}
                          bgcolor={grey[50]}
                          mr={1}
                          border={`1px solid ${grey[300]}`}
                        />
                        <Typography variant="caption">Available</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>

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

            {/* Billing Tab */}
            {tabIndex === 2 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Billing Plan</InputLabel>
                      <Select
                        value={newTenant.billing.plan}
                        onChange={(e) => handleBillingChange('plan', e.target.value)}
                        label="Billing Plan"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Rate per Seat"
                      fullWidth
                      margin="normal"
                      type="number"
                      value={newTenant.billing.rate}
                      onChange={(e) => handleBillingChange('rate', parseFloat(e.target.value))}
                      error={errors.billingRate}
                      helperText={errors.billingRate ? "Rate must be greater than 0" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span style={{ color: errors.billingRate ? 'red' : 'rgba(0, 0, 0, 0.54)' }}>₱</span>
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />

                    <TextField
                      label="Months to Avail"
                      fullWidth
                      margin="normal"
                      type="number"
                      value={newTenant.billing.monthsToAvail}
                      onChange={(e) => handleBillingChange('monthsToAvail', parseInt(e.target.value))}
                      error={errors.monthsToAvail}
                      helperText={errors.monthsToAvail ? "Must be at least 1 month" : ""}
                      inputProps={{ min: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ReceiptIcon color={errors.monthsToAvail ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />

                    <TextField
                      label="Billing Start Date"
                      fullWidth
                      margin="normal"
                      type="date"
                      value={newTenant.billing.startDate}
                      onChange={(e) => handleBillingChange('startDate', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={newTenant.billing.paymentMethod}
                        onChange={(e) => handleBillingChange('paymentMethod', e.target.value)}
                        label="Payment Method"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="credit">Credit Card</MenuItem>
                        <MenuItem value="bank">Bank Transfer</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Billing Address"
                      fullWidth
                      margin="normal"
                      value={newTenant.billing.billingAddress}
                      onChange={(e) => handleBillingChange('billingAddress', e.target.value)}
                      multiline
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </Grid>
                </Grid>

                <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Billing Summary
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Seat Rental</TableCell>
                          <TableCell align="right">{tempSelectedSeats.length}</TableCell>
                          <TableCell align="right">
                            {formatPHP(newTenant.billing.rate)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPHP(newTenant.billing.rate * tempSelectedSeats.length)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle1">
                              Total ({newTenant.billing.monthsToAvail} {newTenant.billing.monthsToAvail > 1 ? 'months' : 'month'})
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {formatPHP(calculateTotal())}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {/* New row for Billing End Date */}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle2">
                              Billing End Date:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {newTenant.billing.billingEndDate || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${grey[200]}` }}>
        <Button
          onClick={handleClose}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 2,
            color: grey[700],
            "&:hover": { bgcolor: grey[100] },
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddTenant}
          variant="contained"
          disableElevation
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 2,
            bgcolor: blue[600],
            "&:hover": { bgcolor: blue[700] },
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Add Tenant"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}