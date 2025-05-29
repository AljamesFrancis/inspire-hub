"use client";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import seatMap1 from "../../(admin)/seatMap1.json";
import seatMap2 from "../../(admin)/seatMap2.json";
import seatMap3 from "../../(admin)/seatMap3.json";
import seatMap4 from "../../(admin)/seatMap4.json";
import seatMap5 from "../../(admin)/seatMap5.json";

import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Chip,
  Card,
  CardContent,
  Tooltip
} from "@mui/material";
import { red, grey, blue } from "@mui/material/colors";
import { Info as InfoIcon } from '@mui/icons-material';

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

export default function OccupiedSeatsMap() {
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  useEffect(() => {
    async function fetchOccupiedSeats() {
      const querySnapshot = await getDocs(collection(db, "seatMap"));
      const allSelectedSeats = querySnapshot.docs.flatMap(doc =>
        doc.data().selectedSeats || []
      );
      setOccupiedSeats(allSelectedSeats);
    }
    fetchOccupiedSeats();
  }, []);

  const isSeatOccupied = (seat, mapType) => {
    const seatKey = `${mapType}-${seat.number}`;
    return occupiedSeats.includes(seatKey);
  };

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
                      const isOccupied = isSeatOccupied(seat, mapType);
                      const isWindow = seat.type === "window";

                      const seatColor = isOccupied ? red[400] : 
                                      isWindow ? grey[200] : grey[50];
                      const barColor = isOccupied ? red[600] : 
                                     isWindow ? grey[400] : grey[300];
                      const borderColor = isOccupied ? red[600] : barColor;
                      const textColor = isOccupied ? '#fff' : grey[900];

                      const tooltipTitle = isOccupied 
                        ? "Occupied seat" 
                        : isWindow 
                        ? "Window seat (vacant)" 
                        : "Vacant seat";

                      return (
                        <Tooltip key={seat.id} title={tooltipTitle} arrow>
                          <Box position="relative" mr={isWindow ? 1 : 0.5}>
                            <Box
                              sx={{
                                minWidth: 40,
                                height: 24,
                                p: 0,
                                bgcolor: seatColor,
                                color: textColor,
                                fontSize: '0.6rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${borderColor}`,
                                borderRadius: 0.5,
                              }}
                            >
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
                        </Tooltip>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Current Seat Occupancy
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Real-time view of all occupied seats across workspaces
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <Chip 
            icon={<Box sx={{ width: 14, height: 14, bgcolor: red[400], border: `1px solid ${red[600]}` }} />}
            label="Occupied seat"
            size="small"
          />
          <Chip 
            icon={<Box sx={{ width: 14, height: 14, bgcolor: grey[50], border: `1px solid ${grey[300]}` }} />}
            label="Vacant seat"
            size="small"
          />
          <Chip 
            icon={<Box sx={{ width: 14, height: 14, bgcolor: grey[200], border: `1px solid ${grey[400]}` }} />}
            label="Window seat"
            size="small"
          />
        </Stack>

        <Box sx={{ overflowX: 'auto', py: 1 }}>
          <Stack direction="row" spacing={2} sx={{ width: 'max-content' }}>
            {renderSeatMap(groupPairs1, "map1", "Seat Map 1")}
            {renderSeatMap(groupPairs2, "map2", "Seat Map 2")}
            {renderSeatMap(groupPairs3, "map3", "Seat Map 3")}
            {renderSeatMap(groupPairs4, "map4", "Seat Map 4")}
            {renderSeatMap(groupPairs5, "map5", "Seat Map 5")}
          </Stack>
        </Box>
      </Paper>

      <Card sx={{ bgcolor: blue[50], border: `1px solid ${blue[100]}` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="medium">
              Occupancy Summary
            </Typography>
          </Stack>
          <Typography variant="body1">
            Total occupied seats: <Box component="span" fontWeight="bold">{occupiedSeats.length}</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}