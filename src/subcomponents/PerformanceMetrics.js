import React from 'react';
import { Box, Typography, Grid, Paper, styled } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MetricPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: 'rgba(0, 40, 0, 0.6)',
  border: '1px solid rgba(0, 255, 0, 0.3)',
}));

function PerformanceMetrics() {
  // Mock data - replace with actual performance data
  const data = [
    { name: 'Mon', profit: 4000 },
    { name: 'Tue', profit: 3000 },
    { name: 'Wed', profit: 2000 },
    { name: 'Thu', profit: 2780 },
    { name: 'Fri', profit: 1890 },
    { name: 'Sat', profit: 2390 },
    { name: 'Sun', profit: 3490 },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <MetricPaper>
            <Typography variant="h6">Total Profit</Typography>
            <Typography variant="h4">$12,345</Typography>
          </MetricPaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricPaper>
            <Typography variant="h6">Success Rate</Typography>
            <Typography variant="h4">78%</Typography>
          </MetricPaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricPaper>
            <Typography variant="h6">Active Trades</Typography>
            <Typography variant="h4">5</Typography>
          </MetricPaper>
        </Grid>
      </Grid>
      <Box mt={4} height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="profit" fill="#00ff00" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default PerformanceMetrics;
