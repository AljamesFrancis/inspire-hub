"use client";
import React, { useState, useEffect } from "react";
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
  MeetingRoom as MeetingRoomIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

// Helper to format number as PHP currency with thousands separator
function formatPHP(amount) {
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// 13 Offices
const PRIVATE_OFFICES = [
  "Bicol",
  "Cebu",
  "Pampanga",
  "Nueva Ecija",
  "Panggasinan",
  "Laguna",
  "Rizal",
  "Bacolod",
  "Iloilo",
  "Batangas",
  "Mindoro",
  "Cagayan de Oro",
  "Quezon"
];

export default function AddTenantPO({
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
    selectedPO: [],
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
  const [tempSelectedOffices, setTempSelectedOffices] = useState([]);
  const [occupiedOffices, setOccupiedOffices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    name: false,
    company: false,
    email: false,
    phone: false,
    address: false,
    offices: false,
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

  // Effect to fetch occupied offices and reset state on open
 useEffect(() => {
    async function fetchOccupiedOffices() {
      try {
        // Fetch from "privateOffice" collection, highlight based on selectedPO field
        const querySnapshot = await getDocs(collection(db, "privateOffice"));
        const allOccupiedOffices = [];
        querySnapshot.forEach((doc) => {
          const tenantData = doc.data();
          // The field is "selectedPO" (not "selectedOffices")
          if (tenantData.selectedPO) {
            if (Array.isArray(tenantData.selectedPO)) {
              allOccupiedOffices.push(...tenantData.selectedPO);
            } else if (typeof tenantData.selectedPO === "string") {
              allOccupiedOffices.push(tenantData.selectedPO);
            }
          }
        });
        setOccupiedOffices(allOccupiedOffices);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching occupied offices: ", error);
        setIsLoading(false);
      }
    }

    if (showAddModal) {
      setIsLoading(true);
      fetchOccupiedOffices();
      setTabIndex(0);
      setNewTenant(prev => ({
        ...prev,
        billing: {
          ...prev.billing,
          billingEndDate: calculateBillingEndDate(prev.billing.startDate, prev.billing.monthsToAvail),
          currency: "PHP",
        }
      }));
    }
  }, [showAddModal]);

  const calculateTotal = () => {
    const rate = parseFloat(newTenant.billing.rate) || 0;
    const officeCount = tempSelectedOffices.length;
    const months = parseInt(newTenant.billing.monthsToAvail) || 1;
    return rate * officeCount * months;
  };

  const validateForm = () => {
    const newErrors = {
      name: !newTenant.name,
      company: !newTenant.company,
      email: !newTenant.email || !/^\S+@\S+\.\S+$/.test(newTenant.email),
      phone: !newTenant.phone,
      address: !newTenant.address,
      offices: tempSelectedOffices.length === 0,
      billingRate: newTenant.billing.rate <= 0,
      monthsToAvail: newTenant.billing.monthsToAvail <= 0,
      total: calculateTotal() <= 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddTenant = async () => {
    if (!validateForm()) return;

    try {
      const computedTotal = calculateTotal();
      const tenantWithOffices = {
        ...newTenant,
        selectedPO: tempSelectedOffices,
        createdAt: new Date().toISOString(),
        billing: {
          ...newTenant.billing,
          total: computedTotal,
        },
        officeType: "private office",
        type: "private",
      };

      await addDoc(collection(db, "privateOffice"), tenantWithOffices);

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
      selectedPO: [],
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
    setTempSelectedOffices([]);
    setTabIndex(0);
    setErrors({
      name: false,
      company: false,
      email: false,
      phone: false,
      address: false,
      offices: false,
      billingRate: false,
      monthsToAvail: false,
    });
  };

  const toggleOfficeSelection = (office) => {
    if (occupiedOffices.includes(office)) {
      alert("This office is already occupied!");
      return;
    }

    setTempSelectedOffices((prev) =>
      prev.includes(office)
        ? prev.filter((o) => o !== office)
        : [...prev, office]
    );
    setErrors((prev) => ({ ...prev, offices: false }));
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

      updatedBilling.currency = "PHP";

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
            Add New Private Office Tenant
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
                    <MeetingRoomIcon fontSize="small" sx={{ mr: 1 }} />
                    Office Selection
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
                    />
                  </Grid>
                </Grid>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: grey[50],
                    borderRadius: 2,
                    border: `1px solid ${errors.offices ? red[200] : grey[200]}`,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <MeetingRoomIcon
                      color={errors.offices ? "error" : "action"}
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      fontWeight={600}
                      color={errors.offices ? "error" : "text.primary"}
                    >
                      Selected Private Offices:
                    </Typography>
                  </Box>
                  {tempSelectedOffices.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {tempSelectedOffices.map((office, idx) => (
                        <Chip
                          key={idx}
                          label={office}
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
                          onDelete={() =>
                            setTempSelectedOffices((prev) =>
                              prev.filter((o) => o !== office)
                            )
                          }
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      color={errors.offices ? "error" : "text.secondary"}
                    >
                      {errors.offices
                        ? "Please select at least one office"
                        : "No offices selected"}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}

            {/* Office Selection Tab */}
            {tabIndex === 1 && (
                <Box>
                    <Box
                    sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: "#f4f8fb",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        boxShadow: "none",
                        border: `1px solid #e0e5e9`,
                    }}
                    >
                    <Typography fontWeight={600} gutterBottom>
                        Office Selection Guide
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ ml: 2 }}>
                        <Box display="flex" alignItems="center">
                        <Box width={16} height={16} bgcolor={green[400]} mr={1} border={`1px solid ${green[600]}`} />
                        <Typography variant="caption">Selected</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                        <Box width={16} height={16} bgcolor={red[400]} mr={1} border={`1px solid ${red[600]}`} />
                        <Typography variant="caption">Occupied</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                        <Box width={16} height={16} bgcolor={grey[50]} mr={1} border={`1px solid ${grey[300]}`} />
                        <Typography variant="caption">Available</Typography>
                        </Box>
                    </Stack>
                    </Box>
                    <Grid container spacing={3}>
                    {PRIVATE_OFFICES.map((office) => {
                        const isSelected = tempSelectedOffices.includes(office);
                        const isOccupied = occupiedOffices.includes(office);

                        // Professional, minimalist look
                        let borderColor = "#e0e5e9";
                        let cardBg = "#fff";
                        let shadow = "0 2px 10px 0 rgba(40,40,40,0.04)";
                        let labelColor = "#233044";
                        let subtitleColor = "#6c7985";
                        let knobColor = "#c8c8c8";
                        let knobShadow = "none";

                        if (isOccupied) {
                        borderColor = red[400];
                        cardBg = "#f8d7da";
                        shadow = "0 0 0 1.5px #e57373";
                        labelColor = red[800];
                        subtitleColor = red[700];
                        knobColor = "#e57373";
                        } else if (isSelected) {
                        borderColor = green[400];
                        cardBg = "#e6f7ec";
                        shadow = "0 0 0 2px #43a04733";
                        labelColor = green[900];
                        subtitleColor = green[800];
                        knobColor = green[400];
                        knobShadow = "0 0 0 2px #fff";
                        }

                        return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={office}>
                            <Card
                            elevation={0}
                            sx={{
                                border: `2px solid ${borderColor}`,
                                borderRadius: 4,
                                boxShadow: shadow,
                                bgcolor: cardBg,
                                minHeight: 125,
                                cursor: isOccupied ? "not-allowed" : "pointer",
                                position: "relative",
                                transition: "border 0.15s, box-shadow 0.15s, background 0.2s",
                                "&:hover": !isOccupied && {
                                border: `2.5px solid ${blue[400]}`,
                                boxShadow: "0 4px 28px 0 #3a99d819",
                                background: "#f0f7ff",
                                },
                            }}
                            onClick={() => !isOccupied && toggleOfficeSelection(office)}
                            >
                            <CardContent
                                sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                py: 3,
                                px: 2,
                                position: "relative",
                                }}
                            >
                                <MeetingRoomIcon
                                fontSize="large"
                                sx={{
                                    color: borderColor,
                                    mb: 1,
                                }}
                                />
                                <Typography
                                variant="h6"
                                fontWeight={700}
                                color={labelColor}
                                sx={{ letterSpacing: 1, fontSize: 20, mb: 0.5 }}
                                >
                                {office}
                                </Typography>
                                <Typography
                                variant="subtitle2"
                                color={subtitleColor}
                                sx={{ letterSpacing: 0.4, fontSize: 13 }}
                                >
                                Private Office
                                </Typography>
                                {/* Knob */}
                                <Box
                                sx={{
                                    position: "absolute",
                                    right: 18,
                                    bottom: 14,
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    bgcolor: knobColor,
                                    boxShadow: knobShadow,
                                    border: "2px solid #e0e5e9",
                                    zIndex: 2,
                                }}
                                />
                            </CardContent>
                            </Card>
                        </Grid>
                        );
                    })}
                    </Grid>
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
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Rate per Office"
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
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={newTenant.billing.paymentMethod}
                        onChange={(e) => handleBillingChange('paymentMethod', e.target.value)}
                        label="Payment Method"
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
                          <TableCell>Private Office Rental</TableCell>
                          <TableCell align="right">{tempSelectedOffices.length}</TableCell>
                          <TableCell align="right">
                            {formatPHP(newTenant.billing.rate)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPHP(newTenant.billing.rate * tempSelectedOffices.length)}
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
        >
          Add Tenant
        </Button>
      </DialogActions>
    </Dialog>
  );
}