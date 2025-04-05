import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export const AnimatedGradientBackground = ({ 
  children,
  colorSets = [
    ["#FF416C", "#FF4B2B"],
    ["#12c2e9", "#c471ed", "#f64f59"],
    ["#8A2387", "#E94057", "#F27121"],
    ["#4776E6", "#8E54E9"],
    ["#00d2ff", "#3a7bd5"]
  ],
  interval = 8000, // Time in ms between color changes
  sx = {}
}) => {
  const [currentColorSetIndex, setCurrentColorSetIndex] = useState(0);
  const [nextColorSetIndex, setNextColorSetIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      
      // After a short delay, update to the next color set
      setTimeout(() => {
        setCurrentColorSetIndex(nextColorSetIndex);
        setNextColorSetIndex((nextColorSetIndex + 1) % colorSets.length);
        setIsTransitioning(false);
      }, 1000); // Transition duration
      
    }, interval);
    
    return () => clearInterval(timer);
  }, [nextColorSetIndex, colorSets.length, interval]);
  
  const currentGradient = `linear-gradient(45deg, ${colorSets[currentColorSetIndex].join(", ")})`;
  const nextGradient = `linear-gradient(45deg, ${colorSets[nextColorSetIndex].join(", ")})`;
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        ...sx
      }}
    >
      {/* Current gradient */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          background: currentGradient,
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 1s ease-in-out',
          zIndex: -2,
        }}
      />
      
      {/* Next gradient (shown during transition) */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          background: nextGradient,
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: -1,
        }}
      />
      
      {/* Content */}
      <Box 
        sx={{
          position: 'relative',
          zIndex: 1,
          padding: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 