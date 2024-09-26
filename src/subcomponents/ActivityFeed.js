import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Typography, styled } from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

function ActivityFeed() {
  // Mock data - replace with actual activity data
  const activities = [
    { type: 'success', message: 'Successfully bought COSMIC token', timestamp: '2 mins ago' },
    { type: 'error', message: 'Failed to execute trade for NEBULA', timestamp: '5 mins ago' },
    { type: 'info', message: 'New token STARDUST added to watchlist', timestamp: '10 mins ago' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  return (
    <List>
      {activities.map((activity, index) => (
        <StyledListItem key={index}>
          <ListItemIcon>
            {getIcon(activity.type)}
          </ListItemIcon>
          <ListItemText 
            primary={activity.message}
            secondary={
              <Typography variant="caption" color="textSecondary">
                {activity.timestamp}
              </Typography>
            }
          />
        </StyledListItem>
      ))}
    </List>
  );
}

export default ActivityFeed;
