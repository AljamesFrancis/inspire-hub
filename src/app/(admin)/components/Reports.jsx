import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, where, query } from "firebase/firestore";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from "@mui/material";
import { green, red, blue } from "@mui/material/colors";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const statusChipProps = {
  Accepted: {
    label: "Accepted",
    style: { backgroundColor: green[100], color: green[800], fontWeight: 600 },
  },
  Rejected: {
    label: "Rejected",
    style: { backgroundColor: red[100], color: red[800], fontWeight: 600 },
  },
};

export default function ReservationReport() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    let unsub = false;
    const fetchReservations = async () => {
      setIsLoading(true);

      const q = query(
        collection(db, "visitMap"),
        where("status", "in", ["accepted", "rejected"])
      );

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const allReservations = docs.map((doc) => ({
        ...doc,
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        company: doc.company,
        details: doc.details,
        reservedSeats: doc.reservedSeats,
        date: doc.date
          ? doc.date.seconds
            ? new Date(doc.date.seconds * 1000)
            : new Date(doc.date)
          : null,
        status: doc.status === "accepted" ? "Accepted" : "Rejected",
      }));

      allReservations.sort(
        (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
      );

      if (!unsub) {
        setReservations(allReservations);
        setIsLoading(false);
      }
    };

    fetchReservations();
    return () => {
      unsub = true;
    };
  }, []);

  const handleOpenModal = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "start", sm: "center" }}
            flexDirection={{ xs: "column", sm: "row" }}
            mb={3}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Visit Schedule Report
            </Typography>
          </Box>

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
            <Box sx={{ overflowX: "auto" }}>
              <TableContainer component={Paper}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" color="text.secondary">
                          Client
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date &amp; Time
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">
                            No reservations found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reservations.map((reservation) => (
                        <TableRow
                          key={reservation.id}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {reservation.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {reservation.date
                                ? format(reservation.date, "PPPpp")
                                : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusChipProps[reservation.status].label}
                              sx={{
                                ...statusChipProps[reservation.status].style,
                                fontSize: "0.875rem",
                                borderRadius: "999px",
                                px: 1.5,
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenModal(reservation)}
                              startIcon={<InfoOutlinedIcon />}
                              sx={{
                                fontWeight: 600,
                                borderRadius: "999px",
                                textTransform: "none",
                                borderColor: blue[100],
                                color: blue[700],
                                "&:hover": {
                                  backgroundColor: blue[50],
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal for client details */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        aria-labelledby="client-details-title"
      >
        <DialogTitle id="client-details-title" sx={{ fontWeight: "bold", pb: 1 }}>
          Client Details
        </DialogTitle>
        <DialogContent dividers>
          {!selectedClient ? (
            <Typography>Loading...</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedClient.name || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedClient.email || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedClient.phone || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">{selectedClient.company || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Visit Date &amp; Time
                </Typography>
                <Typography variant="body1">
                  {selectedClient.date
                    ? format(selectedClient.date, "PPPpp")
                    : "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Reserved Seats
                </Typography>
                <Typography variant="body1">
                  {selectedClient.reservedSeats && selectedClient.reservedSeats.length
                    ? selectedClient.reservedSeats.join(", ")
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={statusChipProps[selectedClient.status]?.label || selectedClient.status}
                  sx={{
                    ...statusChipProps[selectedClient.status],
                    fontWeight: 600,
                    px: 1.5,
                    borderRadius: "999px",
                  }}
                  size="small"
                />
              </Box>
              <Divider />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}