import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Divider,
  Stack,
} from "@mui/material";

/**
 * TenantExtensionHistory component
 * 
 * Props:
 * - history: Array of extension history objects (see note below)
 *   Each item should have:
 *      - from: start date (string or Date)
 *      - to: end date (string or Date)
 *      - extendedBy: (optional) who performed the extension
 *      - extendedAt: (optional) date of extension
 *      - amount: (optional) price or amount
 *      - remarks: (optional) extra info
 */
export default function TenantExtensionHistory({ history }) {
  if (!Array.isArray(history) || !history.length) return null;

  return (
    <Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Extension History
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small" sx={{ minWidth: 350, border: '1px solid #ccc' }}>
          <TableBody>
            {history.map((item, idx) => (
              <TableRow key={idx} sx={{ '& td': { border: '1px solid #ccc' } }}>
                <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 150 }}>
                  From
                </TableCell>
                <TableCell>
                  {item.from ? new Date(item.from).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 150 }}>
                  To
                </TableCell>
                <TableCell>
                  {item.to ? new Date(item.to).toLocaleDateString() : "N/A"}
                </TableCell>
                {item.amount !== undefined && (
                  <>
                    <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 110 }}>
                      Amount
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                  </>
                )}
                {item.extendedBy && (
                  <>
                    <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 110 }}>
                      Extended By
                    </TableCell>
                    <TableCell>{item.extendedBy}</TableCell>
                  </>
                )}
                {item.extendedAt && (
                  <>
                    <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 110 }}>
                      Extended At
                    </TableCell>
                    <TableCell>
                      {new Date(item.extendedAt).toLocaleDateString()}
                    </TableCell>
                  </>
                )}
                {item.remarks && (
                  <>
                    <TableCell sx={{ fontWeight: 600, background: "#f8f8f8", width: 110 }}>
                      Remarks
                    </TableCell>
                    <TableCell>{item.remarks}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}