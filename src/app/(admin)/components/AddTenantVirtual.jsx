"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
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
  Grid,
  InputAdornment,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
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
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

// Helper to format number as PHP currency with thousands separator
function formatPHP(amount) {
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to calculate billing end date
function calculateBillingEndDate(startDate, monthsToAvail) {
  if (!startDate || !monthsToAvail) return "";
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(start.getMonth() + Number(monthsToAvail));
  if (end.getDate() < start.getDate()) {
    end.setDate(0);
  }
  return end.toISOString().split('T')[0];
}

export default function AddVirtualOfficeTenantModal({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    company: false,
    email: false,
    phone: false,
    address: false,
    billingRate: false,
    monthsToAvail: false,
  });

  // Effect to calculate initial billing end date and reset form when modal opens
  useEffect(() => {
    if (showAddModal) {
      setIsLoading(false);
      setNewTenant((prev) => ({
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
    const rate = parseFloat(`${newTenant.billing.rate}`) || 0;
    const months = parseInt(`${newTenant.billing.monthsToAvail}`) || 1;
    return rate * months;
  };

  const validateForm = () => {
    const newErrors = {
      name: !newTenant.name,
      company: !newTenant.company,
      email: !newTenant.email || !/^\S+@\S+\.\S+$/.test(newTenant.email),
      phone: !newTenant.phone,
      address: !newTenant.address,
      billingRate: newTenant.billing.rate <= 0,
      monthsToAvail: newTenant.billing.monthsToAvail <= 0,
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
      const tenantData = {
        ...newTenant,
        createdAt: new Date().toISOString(),
        billing: {
          ...newTenant.billing,
          total: computedTotal,
        },
        type: "virtual-office", // Optionally tag as virtual office
      };
      await addDoc(collection(db, "virtualOffice"), tenantData);

      refreshClients();
      handleClose();
    } catch (error) {
      console.error("Error adding virtual office tenant: ", error);
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
    setErrors({
      name: false,
      company: false,
      email: false,
      phone: false,
      address: false,
      billingRate: false,
      monthsToAvail: false,
    });
  };

  const handleInputChange = (field, value) => {
    setNewTenant({ ...newTenant, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleBillingChange = (field, value) => {
    setNewTenant((prev) => {
      const updatedBilling = {
        ...prev.billing,
        [field]: value,
        currency: "PHP",
      };
      if (field === 'startDate' || field === 'monthsToAvail') {
        updatedBilling.billingEndDate = calculateBillingEndDate(
          updatedBilling.startDate,
          updatedBilling.monthsToAvail
        );
      }
      return {
        ...prev,
        billing: updatedBilling,
      };
    });

    if (field === 'rate') {
      setErrors((prev) => ({ ...prev, billingRate: value <= 0 }));
    }
    if (field === 'monthsToAvail') {
      setErrors((prev) => ({ ...prev, monthsToAvail: value <= 0 }));
    }
  };

  return (
    <Dialog
      open={showAddModal}
      onClose={handleClose}
      maxWidth="md"
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
            Add Virtual Office Tenant
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
          <Box>
            {/* Client Details */}
            <Grid container spacing={3} mb={3} direction="column">
              <Grid item xs={12}>
                <TextField
                  label="Tenant Name"
                  fullWidth
                  value={newTenant.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
                  onChange={(e) => handleInputChange("company", e.target.value)}
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
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                  onChange={(e) => handleInputChange("phone", e.target.value)}
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
                  onChange={(e) => handleInputChange("address", e.target.value)}
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

            {/* Billing Section */}
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
                    label="Rate"
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
                        <TableCell>Virtual Office Rental</TableCell>
                        <TableCell align="right">{newTenant.billing.monthsToAvail}</TableCell>
                        <TableCell align="right">
                          {formatPHP(newTenant.billing.rate)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPHP(newTenant.billing.rate * newTenant.billing.monthsToAvail)}
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
          </Box>
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