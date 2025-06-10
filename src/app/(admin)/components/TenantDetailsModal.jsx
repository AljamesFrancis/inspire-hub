import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Stack,
  Divider,
  Box,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EditIcon from "@mui/icons-material/Edit"; // Import the Edit icon
import TenantExtensionHistory from "./TenantExtensionHistory";

/**
 * TenantDetailsModal component
 *
 * Props:
 * - open: boolean (controls open/close state)
 * - onClose: function (called to close the modal)
 * - client: tenantDetailsClient object (shows data)
 * - onExtend: function (called when "Extend Availability" button is clicked)
 * - onEdit: function (NEW: called when "Edit Details" button is clicked, passes the client object)
 */
export default function TenantDetailsModal({
  open,
  onClose,
  client,
  onExtend,
  onEdit // Add the new onEdit prop
}) {
  if (!client) return null;

  const extensionHistory =
    client.extensionHistory ||
    (client.billing && client.billing.extensionHistory) ||
    [];

  // --- Notification for 30 days left ---
  let show30DayNotif = false;
  let daysLeft = null;
  if (client?.billing?.billingEndDate) {
    const now = new Date();
    const end = new Date(client.billing.billingEndDate);
    daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysLeft === 30) {
      show30DayNotif = true;
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {client?.company}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={4}>
          {/* 30 days left notification */}
          {show30DayNotif && (
            <Alert severity="warning" sx={{ mb: 2, fontWeight: 600 }}>
              This tenant has only 30 days left in their current monthly availability. Please notify them or extend their availability soon.
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Client Information
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small" sx={{ minWidth: 350, border: '1px solid #ccc' }}>
                <TableBody>
                  {[
                    { label: "Name", value: client?.name },
                    { label: "Company", value: client?.company },
                    { label: "Email", value: client?.email },
                    { label: "Phone", value: client?.phone },
                    { label: "Address", value: client?.address },
                    {
                      label: "Selected Seats",
                      value:
                        client?.selectedSeats?.length > 0
                          ? client.selectedSeats.join(", ")
                          : "None",
                    },
                  ].map(({ label, value }) => (
                    <TableRow key={label} sx={{ '& td': { border: '1px solid #ccc' } }}>
                      <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 150 }}>
                        {label}
                      </TableCell>
                      <TableCell>{value || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Billing Details
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" sx={{ minWidth: 350, border: '1px solid #ccc' }}>
                <TableBody>
                  {[
                    { label: "Plan", value: client?.billing?.plan },
                    {
                      label: "Rate",
                      value:
                        client?.billing?.rate !== undefined
                          ? `${client.billing.rate} ${client.billing.currency || ""}`
                          : null,
                    },
                    { label: "Currency", value: client?.billing?.currency },
                    { label: "Payment Method", value: client?.billing?.paymentMethod },
                    { label: "Start Date", value: client?.billing?.startDate },
                    { label: "Billing End Date", value: client?.billing?.billingEndDate },
                    { label: "Billing Address", value: client?.billing?.billingAddress },
                    {
                      label: "Current Period",
                      value: client?.billing?.startDate && client?.billing?.billingEndDate
                        ? `${new Date(client.billing.startDate).toLocaleDateString()} - ${new Date(client.billing.billingEndDate).toLocaleDateString()}`
                        : "N/A"
                    },
                    {
                      label: "Remaining Days",
                      value: client?.billing?.billingEndDate
                        ? `${Math.ceil((new Date(client.billing.billingEndDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                        : "N/A"
                    },
                    {
                      label: "Months to Avail",
                      value:
                        client?.billing?.monthsToAvail !== undefined
                          ? client.billing.monthsToAvail
                          : null,
                    },
                    {
                      label: "Total",
                      value:
                        client?.billing?.total !== undefined
                          ? `${client.billing.total} ${client.billing.currency || ""}`
                          : null,
                    },
                  ].map(({ label, value }) => (
                    <TableRow key={label} sx={{ '& td': { border: '1px solid #ccc' } }}>
                      <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 150 }}>
                        {label}
                      </TableCell>
                      <TableCell>{value || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {/* Extension History Section */}
          <TenantExtensionHistory history={extensionHistory} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
        {/* New Edit Details Button */}
        <Button
          onClick={() => {
            onClose(); // Optionally close the details modal when opening the edit form
            onEdit(client); // Call the onEdit prop, passing the current client data
          }}
          startIcon={<EditIcon />}
          color="secondary" // You can choose a different color if you like
          variant="contained"
        >
          Edit Details
        </Button>
        <Button
          onClick={() => onExtend(client)}
          startIcon={<EventAvailableIcon />}
          color="primary"
          variant="contained"
        >
          Extend Availability
        </Button>
      </DialogActions>
    </Dialog>
  );
}