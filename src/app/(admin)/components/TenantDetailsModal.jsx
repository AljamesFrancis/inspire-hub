import React, { useRef } from "react";
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
  Alert,
  Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import TenantExtensionHistory from "./TenantExtensionHistory";

export default function TenantDetailsModal({
  open,
  onClose,
  client,
  onExtend,
  onEdit
}) {
  const printRef = useRef();

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tenant Details - ${client.company || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; }
            .print-section { margin-bottom: 25px; }
            .print-section-title { 
              font-size: 18px; 
              font-weight: bold; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .alert-warning { 
              background-color: #fff3cd; 
              color: #856404; 
              padding: 10px; 
              margin-bottom: 20px;
              border-left: 4px solid #ffeeba;
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 10px; 
              border-top: 1px solid #ddd; 
              text-align: center; 
              font-size: 12px;
              color: #777;
            }
            @page { size: auto; margin: 10mm; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Tenant Details Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${show30DayNotif ? `
            <div class="alert-warning">
              IMPORTANT: This tenant has only 30 days left in their current monthly availability.
            </div>
          ` : ''}
          
          <div class="print-section">
            <div class="print-section-title">Client Information</div>
            <table>
              <tbody>
                <tr><th>Name</th><td>${client?.name || 'N/A'}</td></tr>
                <tr><th>Company</th><td>${client?.company || 'N/A'}</td></tr>
                <tr><th>Email</th><td>${client?.email || 'N/A'}</td></tr>
                <tr><th>Phone</th><td>${client?.phone || 'N/A'}</td></tr>
                <tr><th>Address</th><td>${client?.address || 'N/A'}</td></tr>
                <tr><th>Selected Seats</th><td>${
                  client?.selectedSeats?.length > 0 
                    ? client.selectedSeats.join(", ") 
                    : "None"
                }</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">Billing Details</div>
            <table>
              <tbody>
                <tr><th>Plan</th><td>${client?.billing?.plan || 'N/A'}</td></tr>
                <tr><th>Rate</th><td>${
                  client?.billing?.rate !== undefined
                    ? `${client.billing.rate} ${client.billing.currency || ""}`
                    : 'N/A'
                }</td></tr>
                <tr><th>Currency</th><td>${client?.billing?.currency || 'N/A'}</td></tr>
                <tr><th>Payment Method</th><td>${client?.billing?.paymentMethod || 'N/A'}</td></tr>
                <tr><th>Start Date</th><td>${client?.billing?.startDate || 'N/A'}</td></tr>
                <tr><th>Billing End Date</th><td>${client?.billing?.billingEndDate || 'N/A'}</td></tr>
                <tr><th>Billing Address</th><td>${client?.billing?.billingAddress || 'N/A'}</td></tr>
                <tr><th>Current Period</th><td>${
                  client?.billing?.startDate && client?.billing?.billingEndDate
                    ? `${new Date(client.billing.startDate).toLocaleDateString()} - ${new Date(client.billing.billingEndDate).toLocaleDateString()}`
                    : "N/A"
                }</td></tr>
                <tr><th>Remaining Days</th><td>${
                  client?.billing?.billingEndDate
                    ? `${Math.ceil((new Date(client.billing.billingEndDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                    : "N/A"
                }</td></tr>
                <tr><th>Months to Avail</th><td>${client?.billing?.monthsToAvail || 'N/A'}</td></tr>
                <tr><th>Total Amount</th><td>${
                  client?.billing?.total !== undefined
                    ? `${client.billing.total} ${client.billing.currency || ""}`
                    : 'N/A'
                }</td></tr>
              </tbody>
            </table>
          </div>
          
          ${extensionHistory.length > 0 ? `
            <div class="print-section">
              <div class="print-section-title">Extension History</div>
              <table>
                <tbody>
                  ${extensionHistory.map((extension, index) => `
                    <tr>
                      <th>Extension #${index + 1}</th>
                      <td>
                        <p>Previous End Date: ${extension.previousEndDate}</p>
                        <p>New End Date: ${extension.newEndDate}</p>
                        <p>Extended By: ${extension.extendedBy} days</p>
                        <p>Extended On: ${extension.extendedOn}</p>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="footer">
            This is an official document generated by the Tenant Management System
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

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
        <Box>
          <Tooltip title="Print Details">
            <IconButton onClick={handlePrint} aria-label="print" size="large" sx={{ mr: 1 }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} aria-label="close" size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      {/* This div holds the content we'll use for printing */}
      <div ref={printRef} style={{ display: 'none' }}></div>
      
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
        <Button
          onClick={() => {
            onClose();
            onEdit(client);
          }}
          startIcon={<EditIcon />}
          color="secondary"
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