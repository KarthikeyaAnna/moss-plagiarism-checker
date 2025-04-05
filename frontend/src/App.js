import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Divider
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';

// --- Icons ---
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LaunchIcon from '@mui/icons-material/Launch';
import PercentIcon from '@mui/icons-material/Percent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// --- Transitions ---
import Fade from '@mui/material/Fade';

// --- Theme Definition ---
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
        // Dark mode palette values
        primary: { main: '#90caf9' }, // Light blue
        secondary: { main: '#f48fb1' }, // Pinkish
        background: {
          default: '#121212', // Standard dark
          paper: '#1e1e1e', // Slightly lighter for paper elements
        },
        text: {
          primary: '#e0e0e0', // Lighter grey
          secondary: '#b0b0b0', // Darker grey
        },
      }
      : {
        // Light mode palette values - more explicit definitions
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        background: {
          default: '#f7f7f7',
          paper: '#ffffff',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
      }),
  },
  typography: {
    h4: {
      fontWeight: 500,
      color: mode === 'dark' ? '#e0e0e0' : '#333333',
    },
    body1: {
      color: mode === 'dark' ? '#e0e0e0' : '#333333',
    },
    body2: {
      color: mode === 'dark' ? '#b0b0b0' : '#666666',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0px 3px 15px rgba(0, 0, 0, 0.5)' 
            : '0px 3px 15px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: mode === 'dark' 
            ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
            : '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? '#e0e0e0' : '#333333',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'dark' 
            ? 'rgba(30, 30, 46, 0.9)' 
            : 'rgba(245, 245, 245, 0.9)',
        },
      },
    },
  },
});

// --- MossResultsDisplay component with Max % column ---
function MossResultsDisplay({ results, mossUrl, onViewMatch }) {
  if (!results || results.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No matches were found between the submitted files.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<LaunchIcon />} 
          href={mossUrl} 
          target="_blank" 
          sx={{ mt: 2 }}
        >
          View on MOSS Website
        </Button>
      </Box>
    );
  }

  // Check if we have more than two files (which means multiple comparisons)
  const hasMultipleComparisons = results.length > 1;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Plagiarism Check Results
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table aria-label="plagiarism results table">
          <TableHead>
            <TableRow>
              <TableCell>File 1</TableCell>
              <TableCell>File 2</TableCell>
              <TableCell align="center">Overall Match</TableCell>
              <TableCell align="center">Lines Matched</TableCell>
              {/* Add View Comparison column only if multiple comparisons exist */}
              {hasMultipleComparisons && (
                <TableCell align="center">View Comparison</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((match, index) => {
              // Calculate max percentage between the two files
              const file1Percent = parseInt(match.file1.percentage) || 0;
              const file2Percent = parseInt(match.file2.percentage) || 0;
              const maxPercent = Math.max(file1Percent, file2Percent);
              
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileIcon fontSize="small" color="primary" />
                      <Typography>{match.file1.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PercentIcon fontSize="small" sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        {match.file1.percentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileIcon fontSize="small" color="secondary" />
                      <Typography>{match.file2.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PercentIcon fontSize="small" sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        {match.file2.percentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  {/* New Max % column */}
                  <TableCell align="center">
                    <Typography 
                      variant="body1" 
                      fontWeight="medium"
                      color={maxPercent > 50 ? "error.main" : (maxPercent > 30 ? "warning.main" : "inherit")}
                    >
                      {maxPercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="medium">{match.lines_matched}</Typography>
                  </TableCell>
                  {/* Add View Comparison button for each row if multiple comparisons exist */}
                  {hasMultipleComparisons && (
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => window.open(`${mossUrl}/match${index}`, '_blank')}
                      >
                        View Match
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Show the main comparison button for single comparison */}
      {!hasMultipleComparisons && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<VisibilityIcon />}
            onClick={() => window.open(`${mossUrl}/match0`, '_blank')}
          >
            View MOSS Comparison
          </Button>
        </Box>
      )}
    </Box>
  );
}

// Code comparison component
const CodeComparisonDialog = ({ open, onClose }) => {
    if (!open) return null; // Don't render anything if the dialog is not open

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Code Comparison
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary">
                    The comparison feature has been disabled.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// Near the top of your App.js file, add this constant
// This allows you to easily change the API URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.41.15:5001';

function App() {
  // Add state for theme mode with 'dark' as default
  const [mode, setMode] = useState('dark');
  
  // Your existing state variables
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mossBaseUrl, setMossBaseUrl] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mossResults, setMossResults] = useState(null);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [currentComparisonUrl, setCurrentComparisonUrl] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Update theme to be dynamic based on mode state
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
      setMossBaseUrl('');
      setMossResults(null);
      setError('');
      setSnackbarMessage('');
    },
    multiple: true
  });

  // Then define dropzoneSx here, after isDragActive is available
  const dropzoneSx = {
    border: `2px dashed ${theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#aaaaaa'}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive 
      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)') 
      : (theme.palette.mode === 'dark' ? theme.palette.background.default : '#ffffff'),
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(0, 0, 0, 0.02)',
    }
  };

  const handleCheckPlagiarism = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file.');
      setSnackbarMessage('');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setMossBaseUrl('');
    setMossResults(null);
    setError('');
    setSnackbarMessage('');
    const formData = new FormData();
    
    for (const file of files) {
      const text = await file.text();
      if (!text.trim()) {
        setError(`File ${file.name} appears to be empty.`);
        setSnackbarMessage('');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
      formData.append('files', file, file.name);
    }
    
    formData.append('language', language);
    console.log('Language selected:', language);

    try {
      console.log('Sending request to backend...');
      const response = await axios.post(`${API_BASE_URL}/check-plagiarism`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Full response:', response);
      
      if (response.data && response.data.url) {
        setMossBaseUrl(response.data.url);
        setMossResults(response.data.results || []);
        setSnackbarMessage('Plagiarism check completed successfully!');
        setError('');
        setOpenSnackbar(true);
      } else {
        const errorMsg = response.data?.error || 'No results URL received from server.';
        setError(errorMsg);
        setSnackbarMessage('');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error);
      const errorMsg = error.response?.data?.error || 'An error occurred during plagiarism check.';
      const details = error.response?.data?.full_output ? ` Details: ${error.response.data.full_output}` : '';
      setError(`${errorMsg}${details}`);
      setSnackbarMessage('');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleCloseComparisonDialog = () => {
    setComparisonDialogOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
          {/* Theme toggle switch - placed in the top right corner of the Paper */}
          <Box sx={{ 
            position: 'absolute',
            top: 12,
            right: 16,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            {/* Light mode icon */}
            <Brightness7Icon 
              fontSize="small" 
              sx={{ 
                color: mode === 'light' ? theme.palette.primary.main : theme.palette.text.secondary,
                mr: 1,
              }} 
            />
            
            {/* Switch with adjusted thumb positioning */}
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              color="primary"
              size="small"
              sx={{
                '& .MuiSwitch-switchBase': {
                  transform: 'translateY(-2px)', // Move the thumb up by 2px
                },
                '& .MuiSwitch-thumb': {
                  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)', // Optional: add shadow for better visibility
                }
              }}
            />
            
            {/* Dark mode icon */}
            <Brightness4Icon 
              fontSize="small"
              sx={{ 
                color: mode === 'dark' ? theme.palette.primary.main : theme.palette.text.secondary,
                ml: 1,
              }} 
            />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            Moss 
          </Typography>
          
         
         
          <Box sx={{ mb: 3 }}>
            <Box {...getRootProps()} sx={dropzoneSx}>
              <input {...getInputProps()} />
              <UploadFileIcon sx={{ fontSize: 48, mb: 1 }} />
              {isDragActive ? (
                <Typography>Drop the files here ...</Typography>
              ) : (
                <Typography>Drag & drop files, or click to select</Typography>
              )}
            </Box>
          </Box>

          <Fade in={files.length > 0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selected Files:
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => setFiles([])} 
                  sx={{ ml: 2 }}
                >
                  Clear All
                </Button>
              </Typography>
              <List dense>
                {files.map((file, index) => (
                  <ListItem 
                    key={index} 
                    disablePadding
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        size="small"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setFiles(newFiles);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <InsertDriveFileIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      primaryTypographyProps={{ 
                        style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Fade>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="c">C</MenuItem>
              <MenuItem value="cc">C++</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="csharp">C#</MenuItem>
              <MenuItem value="php">PHP</MenuItem>
              <MenuItem value="perl">Perl</MenuItem>
              <MenuItem value="ruby">Ruby</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="scala">Scala</MenuItem>
              <MenuItem value="haskell">Haskell</MenuItem>
              <MenuItem value="lisp">Lisp</MenuItem>
              <MenuItem value="scheme">Scheme</MenuItem>
              <MenuItem value="fortran">Fortran</MenuItem>
              <MenuItem value="matlab">Matlab</MenuItem>
              <MenuItem value="vhdl">VHDL</MenuItem>
              <MenuItem value="verilog">Verilog</MenuItem>
            </Select>
          </FormControl>

          {/* --- Action Buttons --- */}
          <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%',
              mt: 2, mb: 2
          }}>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckPlagiarism}
                  disabled={files.length === 0 || loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ 
                      minWidth: 200,
                      py: 1
                  }}
              >
                  {loading ? 'Checking...' : 'Check Plagiarism'}
              </Button>
          </Box>

          {mossResults !== null && (
            <Fade in={true}>
              <Box>
                <MossResultsDisplay 
                  results={mossResults} 
                  mossUrl={mossBaseUrl}
                  onViewMatch={(url) => window.open(url, '_blank')} 
                />
              </Box>
            </Fade>
          )}
          
          {/* Privacy notice at the bottom of the paper */}
          <Divider sx={{ mt: 4, mb: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, fontSize: '0.9rem' }}>
            <strong>Privacy Notice:</strong> This MOSS Plagiarism Checker is designed with your privacy in mind. We do not store, access, or retain your code submissions beyond the temporary processing required for plagiarism detection. Files are temporarily cached during analysis and automatically deleted afterward. All code comparison is performed through Stanford's MOSS service, which generates publicly accessible result URLs. We recommend avoiding the submission of proprietary or sensitive code. By using this service, you acknowledge that your submissions will be processed through the Stanford MOSS system according to their terms of service.
          </Typography>
        </Paper>
        
        {/* Developer credit outside the Paper component */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 2, fontStyle: 'italic' }}
        >
          Developed by Sri Karthikeya
        </Typography>

        {/* Add new line for association */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 0.5, fontStyle: 'italic' }}
        >
          In Association with COM
        </Typography>

        {/* Comparison Dialog */}
        <CodeComparisonDialog
          open={comparisonDialogOpen}
          onClose={handleCloseComparisonDialog}
        />

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={error ? "error" : "success"}
            variant="filled"
            sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
            iconMapping={{
              success: <CheckCircleOutlineIcon fontSize="inherit" />,
              error: <ErrorOutlineIcon fontSize="inherit" />,
            }}
          >
            {error || snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App; 