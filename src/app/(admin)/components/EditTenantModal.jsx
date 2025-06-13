// components/EditTenantModal.js
"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { green, blue, grey } from "@mui/material/colors";

export default function EditTenantModal({ open, onClose, client, onSave }) {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    billing: {
      plan: "",
      rate: "",
      currency: "USD",
      paymentMethod: "",
      startDate: "",
      billingStartDate: "",
      billingEndDate: "",
      price: "",
      frequency: "monthly",
      billingAddress: "",
      monthsToAvail: "",
      total: "",
    },
    selectedSeats: [],
    selectedPO: [],
    virtualOfficeFeatures: "",
    type: "dedicated",
  });

  // Effect to update form data when the 'client' prop changes
  useEffect(() => {
    if (client) {
      setFormData({
        company: client.company || "",
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        billing: {
          plan: client.billing?.plan || "",
          rate: client.billing?.rate || "",
          currency: client.billing?.currency || "USD",
          paymentMethod: client.billing?.paymentMethod || "",
          startDate: client.billing?.startDate || "",
          billingStartDate: client.billing?.billingStartDate || "",
          billingEndDate: client.billing?.billingEndDate || "",
          price: client.billing?.price || "",
          frequency: client.billing?.frequency || "monthly",
          billingAddress: client.billing?.billingAddress || "",
          monthsToAvail: client.billing?.monthsToAvail || "",
          total: client.billing?.total || "",
        },
        selectedSeats: Array.isArray(client.selectedSeats) ? client.selectedSeats : [],
        selectedPO: Array.isArray(client.selectedPO) ? client.selectedPO : [],
        virtualOfficeFeatures: client.virtualOfficeFeatures || "",
        type: client.type || "dedicated",
        id: client.id,
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("billing.")) {
      setFormData((prev) => ({
        ...prev,
        billing: {
          ...prev.billing,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSeatInputChange = (e) => {
    const { value } = e.target;
    const seatsArray = value.split(',').map(seat => seat.trim()).filter(seat => seat !== '');
    setFormData(prev => ({
      ...prev,
      selectedSeats: seatsArray,
    }));
  };

  const handleDeleteSeat = (seatToDelete) => {
    setFormData(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.filter(seat => seat !== seatToDelete),
    }));
  };

  const handlePOInputChange = (e) => {
    const { value } = e.target;
    const poArray = value.split(',').map(po => po.trim()).filter(po => po !== '');
    setFormData(prev => ({
      ...prev,
      selectedPO: poArray,
    }));
  };

  const handleDeletePO = (poToDelete) => {
    setFormData(prev => ({
      ...prev,
      selectedPO: prev.selectedPO.filter(po => po !== poToDelete),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email) {
      alert("Company, Name, and Email are required fields.");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        {/* FIX: Use `component="span"` for Typography inside DialogTitle */}
        <Typography variant="h6" fontWeight={600} component="span">
          Edit Tenant Details
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="subtitle1" fontWeight={500} mt={1}>
            Client Information
          </Typography>
          <TextField
            label="Company Name"
            name="company"
            value={formData.company}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Client Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={2}
          />

          <Typography variant="subtitle1" fontWeight={500}>
            Billing Details
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Plan"
              name="billing.plan"
              value={formData.billing.plan}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Rate"
              name="billing.rate"
              type="number"
              value={formData.billing.rate}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                id="currency"
                name="billing.currency"
                value={formData.billing.currency}
                label="Currency"
                onChange={handleChange}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="PHP">PHP</MenuItem>
                {/* Add more currencies as needed */}
              </Select>
            </FormControl>
            <TextField
              label="Payment Method"
              name="billing.paymentMethod"
              value={formData.billing.paymentMethod}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Contract Start Date"
              name="billing.startDate"
              type="date"
              value={formData.billing.startDate}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Billing Start Date"
              name="billing.billingStartDate"
              type="date"
              value={formData.billing.billingStartDate}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Billing End Date"
              name="billing.billingEndDate"
              type="date"
              value={formData.billing.billingEndDate}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Price"
              name="billing.price"
              type="number"
              value={formData.billing.price}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel id="frequency-label">Billing Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              id="frequency"
              name="billing.frequency"
              value={formData.billing.frequency}
              label="Billing Frequency"
              onChange={handleChange}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="annually">Annually</MenuItem>
              <MenuItem value="one-time">One-Time</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Billing Address"
            name="billing.billingAddress"
            value={formData.billing.billingAddress}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={2}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Months to Avail"
              name="billing.monthsToAvail"
              type="number"
              value={formData.billing.monthsToAvail}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Total"
              name="billing.total"
              type="number"
              value={formData.billing.total}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              inputProps={{ min: 0 }}
            />
          </Stack>

          {/* Conditional Fields based on Tenant Type */}
          {formData.type === "dedicated" && (
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                Dedicated Desk Details
              </Typography>
              <TextField
                label="Selected Seats (e.g., map1-A1, map2-B3)"
                name="selectedSeats"
                value={formData.selectedSeats.join(", ")}
                onChange={handleSeatInputChange}
                fullWidth
                variant="outlined"
                size="small"
                helperText="Enter seat numbers separated by commas."
                sx={{ mt: 1 }}
              />
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                {formData.selectedSeats.map((seat, index) => (
                  <Chip
                    key={index}
                    label={seat}
                    size="small"
                    onDelete={() => handleDeleteSeat(seat)}
                    sx={{ bgcolor: blue[50], color: blue[800], mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {formData.type === "private" && (
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                Private Office Details
              </Typography>
              <TextField
                label="Selected Private Office(s) (e.g., PO1, PO2)"
                name="selectedPO"
                value={formData.selectedPO.join(", ")}
                onChange={handlePOInputChange}
                fullWidth
                variant="outlined"
                size="small"
                helperText="Enter office numbers separated by commas."
                sx={{ mt: 1 }}
              />
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                {formData.selectedPO.map((office, index) => (
                  <Chip
                    key={index}
                    label={office}
                    size="small"
                    onDelete={() => handleDeletePO(office)}
                    sx={{ bgcolor: blue[50], color: blue[800], mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {formData.type === "virtual" && (
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                Virtual Office Details
              </Typography>
              <TextField
                label="Virtual Office Features (e.g., Mail Handling, Meeting Room Hours)"
                name="virtualOfficeFeatures"
                value={formData.virtualOfficeFeatures}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={3}
                helperText="Describe the virtual office services/features."
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: grey[700], borderColor: grey[300], '&:hover': { borderColor: grey[500] } }}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          variant="contained"
          sx={{ bgcolor: green[600], "&:hover": { bgcolor: green[700] } }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}