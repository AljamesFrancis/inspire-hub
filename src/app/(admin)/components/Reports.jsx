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
} from "@mui/material";
import { green, red } from "@mui/material/colors";

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
        id: doc.id,
        name: doc.name,
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

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Card variant="outlined" sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
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
            <TableContainer component={Paper} sx={{ mt: 1 }}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}