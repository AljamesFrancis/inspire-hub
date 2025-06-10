'use client';
import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';

export default function NotAuthorized() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <LockOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          You do not have permission to view this page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/')}
        >
          Go to Main Page
        </Button>
      </Box>
    </Container>
  );
}