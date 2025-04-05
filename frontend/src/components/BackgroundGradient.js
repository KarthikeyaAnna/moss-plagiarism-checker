import React from 'react';
import { Box } from '@mui/material';

export const BackgroundGradient = ({ 
  children, 
  sx = {},
  colors = ["#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef"],
  direction = "to bottom right",
  borderRadius = 3,
  blur = 20,
  intensity = 0.5,
  ...props
}) => {
  return (
    <Box 
      sx={{ 
        position: 'relative',
        borderRadius,
        overflow: 'hidden',
        ...sx
      }}
      {...props}
    >
      {/* Background blur effect */}
      <Box 
        sx={{
          position: 'absolute',
          inset: -blur,
          background: `linear-gradient(${direction}, ${colors.join(", ")})`,
          filter: `blur(${blur}px)`,
          opacity: intensity,
          zIndex: -1,
        }}
      />
      
      {/* Main content with gradient */}
      <Box 
        sx={{
          position: 'relative',
          background: `linear-gradient(${direction}, ${colors.join(", ")})`,
          borderRadius,
          padding: 2,
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 