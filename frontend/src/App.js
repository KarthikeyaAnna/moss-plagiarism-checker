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

// --- Firebase Function URLs ---
const FIREBASE_FUNCTIONS = {
  CHECK_PLAGIARISM: 'https://us-central1-moss79-3e1dd.cloudfunctions.net/plagiarism_checker',
  FETCH_COMPARISON: 'https://us-central1-moss79-3e1dd.cloudfunctions.net/comparison_fetcher'
};

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

// --- MossResultsDisplay component (NO CHANGES NEEDED HERE) ---
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
                        // This calls the onViewMatch prop passed from App
                        onClick={() => onViewMatch(match.comparison_url)}
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
      {!hasMultipleComparisons && results.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            // This also calls the onViewMatch prop passed from App
            onClick={() => onViewMatch(results[0].comparison_url)}
          >
            View MOSS Comparison
          </Button>
        </Box>
      )}
    </Box>
  );
}

// --- CodeComparisonDialog (NO CHANGES NEEDED HERE, only used for Test Backend now) ---
const CodeComparisonDialog = ({ open, onClose, data, loading }) => {
    if (!open) return null; // Don't render anything if the dialog is not open

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Code Comparison (Test Backend)
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : data ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">{data.file1?.name || 'File 1 (Test Data)'}</Typography>
                            {data.file1?.code?.length > 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
                                    <pre style={{ margin: 0 }}>
                                        {data.file1.code.join('\n')}
                                    </pre>
                                </Paper>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    {data.message || 'No code available for preview.'}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">{data.file2?.name || 'File 2 (Test Data)'}</Typography>
                            {data.file2?.code?.length > 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
                                    <pre style={{ margin: 0 }}>
                                        {data.file2.code.join('\n')}
                                    </pre>
                                </Paper>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    {data.message || 'No code available for preview.'}
                                </Typography>
                            )}
                        </Grid>
                        {data.sourceUrl && data.sourceUrl !== 'test' && ( // Only show if a real URL exists
                          <Grid item xs={12}>
                              <Button
                                  variant="outlined"
                                  startIcon={<LaunchIcon />}
                                  href={data.sourceUrl}
                                  target="_blank"
                              >
                                  View Complete Comparison on MOSS
                              </Button>
                          </Grid>
                        )}
                         {data.message && ( // Display message from backend if present
                          <Grid item xs={12}>
                            <Alert severity={data.file1 ? "info" : "success"}>{data.message}</Alert>
                          </Grid>
                        )}
                    </Grid>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        The comparison feature is available, but no data was loaded.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};


// --- App Component (with modifications) ---
function App() {
  const [mode, setMode] = useState('dark');
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mossBaseUrl, setMossBaseUrl] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mossResults, setMossResults] = useState(null);

  // State for the comparison dialog (now only for Test Backend)
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  // const [currentComparisonUrl, setCurrentComparisonUrl] = useState(''); // No longer needed for main flow
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

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

  const dropzoneSx = { /* ... (dropzone styles remain the same) ... */
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

  // *** NEW *** Handler to directly open MOSS URL
  const handleViewMossUrl = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.error("Attempted to open MOSS comparison with no URL.");
      setError("Could not open MOSS report: URL is missing.");
      setSnackbarMessage(''); // Clear success message if any
      setOpenSnackbar(true);
    }
  };

  // Function to fetch comparison data (now only used by Test Backend button)
  const fetchComparisonData = async (url) => {
    setLoadingComparison(true);
    setComparisonData(null); // Clear previous data
    setError(''); // Clear previous errors
    try {
      const response = await axios.post(FIREBASE_FUNCTIONS.FETCH_COMPARISON,
        { url: url }, // Send the URL (or 'test') in the request body
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Log the received data for debugging
      console.log("Comparison data received:", response.data);

      setComparisonData(response.data); // Store the received data
      setComparisonDialogOpen(true); // Open the dialog
    } catch (error) {
      console.error('Error fetching comparison:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch comparison data';
      setComparisonData({ message: `Error: ${errorMsg}` }); // Put error message in data for dialog display
      setError(`Backend Test Failed: ${errorMsg}`); // Set main error state for snackbar
      setSnackbarMessage('');
      setOpenSnackbar(true); // Show snackbar error
      setComparisonDialogOpen(true); // Still open dialog to show the error message within it
    } finally {
      setLoadingComparison(false);
    }
  };


  const handleCheckPlagiarism = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file.');
      setSnackbarMessage('');
      setOpenSnackbar(true);
      return;
    }
     if (files.length < 2) { // Added check for minimum 2 files
      setError('Please upload at least two files to compare.');
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

    // Check for empty files before appending
    let hasEmptyFile = false;
    for (const file of files) {
      const text = await file.text();
      if (!text.trim()) {
          setError(`File '${file.name}' appears to be empty or contains only whitespace.`);
          setSnackbarMessage('');
          setOpenSnackbar(true);
          setLoading(false);
          hasEmptyFile = true;
          break; // Stop processing if an empty file is found
      }
       // Check file size (e.g., limit to 1MB = 1 * 1024 * 1024 bytes)
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
          setError(`File '${file.name}' (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the size limit of 1 MB.`);
          setSnackbarMessage('');
          setOpenSnackbar(true);
          setLoading(false);
          hasEmptyFile = true; // Reuse the flag to stop processing
          break;
      }
      formData.append('files', file, file.name);
    }
    
    if (hasEmptyFile) {
        return; // Exit if an empty or oversized file was found
    }


    formData.append('language', language);
    console.log('Language selected:', language);

    try {
      console.log('Sending request to Firebase function...');
      const response = await axios.post(FIREBASE_FUNCTIONS.CHECK_PLAGIARISM, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000 // Increase timeout to 180 seconds (3 minutes)
      });

      console.log('Full response:', response);

      if (response.data && response.data.url) {
        setMossBaseUrl(response.data.url);
        setMossResults(response.data.results || []); // Ensure results is an array
        // Check if results array is empty even if URL is present
        if (!response.data.results || response.data.results.length === 0) {
             setSnackbarMessage('Plagiarism check completed, but no matches found.');
        } else {
            setSnackbarMessage('Plagiarism check completed successfully!');
        }
        setError('');
        setOpenSnackbar(true);
      } else if (response.data && response.data.error) {
        if (response.data.status === 'moss_missing') {
          setError(response.data.message || 'MOSS is not available on the server.');
        } else {
            // Display the specific error message from the backend
           setError(`Error from MOSS: ${response.data.error}`);
        }
        setSnackbarMessage('');
        setOpenSnackbar(true);
      } else {
        setError('Received an unexpected response from the server.');
        setSnackbarMessage('');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error during plagiarism check:', error);
       let errorMsg = 'An error occurred during plagiarism check.';
       if (axios.isCancel(error)) {
           errorMsg = 'Request cancelled.';
       } else if (error.code === 'ECONNABORTED') {
            errorMsg = 'The request timed out. MOSS might be taking too long. Try again later or with fewer/smaller files.';
       } else if (error.response) {
           // Error response from the server (e.g., 4xx, 5xx)
           console.error('Error response data:', error.response.data);
           console.error('Error response status:', error.response.status);
           // Try to get a specific error message from the backend response
           const backendError = error.response.data?.error || error.response.data?.message;
           const backendOutput = error.response.data?.full_output;
           errorMsg = backendError ? `Server Error: ${backendError}` : `Server returned status ${error.response.status}`;
           if (backendOutput) {
               errorMsg += ` Details: ${backendOutput}`;
           }
       } else if (error.request) {
           // The request was made but no response was received
           errorMsg = 'No response received from the server. Check your network connection or the server status.';
       } else {
           // Something happened in setting up the request that triggered an Error
           errorMsg = `Request setup error: ${error.message}`;
       }
      setError(errorMsg);
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

  // Renamed for clarity - this uses the dialog
  const handleTestBackendConnection = () => {
    // Call fetchComparisonData with 'test' to trigger the dialog flow
    fetchComparisonData('test');
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
          {/* Theme toggle switch */}
           <Box sx={{
            position: 'absolute',
            top: 12,
            right: 16,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Brightness7Icon
              fontSize="small"
              sx={{
                color: mode === 'light' ? theme.palette.primary.main : theme.palette.text.secondary,
                mr: 1,
              }}
            />
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              color="primary"
              size="small"
              sx={{
                '& .MuiSwitch-switchBase': {
                  transform: 'translateY(-2px)',
                },
                '& .MuiSwitch-thumb': {
                  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                }
              }}
            />
            <Brightness4Icon
              fontSize="small"
              sx={{
                color: mode === 'dark' ? theme.palette.primary.main : theme.palette.text.secondary,
                ml: 1,
              }}
            />
          </Box>


          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3, pr: 8 }}> {/* Add padding to prevent overlap */}
            Moss Plagiarism Checker
          </Typography>

          {/* Test Backend Connection Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
             <Button
              variant="outlined"
              size="small"
              onClick={handleTestBackendConnection} // Changed handler name
              disabled={loadingComparison} // Disable while test is running
              startIcon={loadingComparison ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {loadingComparison ? 'Testing...' : 'Test Backend'}
            </Button>
          </Box>

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
             <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
              Minimum 2 files required. Max 1MB per file.
            </FormHelperText>
          </Box>

          {/* File List */}
          <Fade in={files.length > 0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selected Files: ({files.length})
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                      setFiles([]);
                      setMossBaseUrl(''); // Also clear results when clearing files
                      setMossResults(null);
                      setError('');
                      setSnackbarMessage('');
                  }}
                  disabled={loading} // Disable while checking
                  sx={{ ml: 2 }}
                >
                  Clear All
                </Button>
              </Typography>
              {/* Optional: Add max height and scroll for long lists */}
               <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="small"
                        disabled={loading} // Disable while checking
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          setFiles(newFiles);
                           // If all files removed, clear results too
                          if (newFiles.length === 0) {
                             setMossBaseUrl('');
                             setMossResults(null);
                          }
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
                      secondary={`${(file.size / 1024).toFixed(1)} KB`} // Show file size
                      primaryTypographyProps={{
                        style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Fade>

          {/* Language Selector */}
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
                <MenuItem value="ml">ML</MenuItem>
                <MenuItem value="pascal">Pascal</MenuItem>
                <MenuItem value="ada">Ada</MenuItem>
                <MenuItem value="lisp">Lisp</MenuItem>
                <MenuItem value="scheme">Scheme</MenuItem>
                <MenuItem value="haskell">Haskell</MenuItem>
                <MenuItem value="fortran">Fortran</MenuItem>
                <MenuItem value="ascii">ASCII</MenuItem>
                <MenuItem value="vhdl">VHDL</MenuItem>
                <MenuItem value="perl">Perl</MenuItem>
                <MenuItem value="matlab">Matlab</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="mips">MIPS Assembly</MenuItem>
                <MenuItem value="prolog">Prolog</MenuItem>
                <MenuItem value="spice">Spice</MenuItem>
                <MenuItem value="vb">Visual Basic</MenuItem>
                <MenuItem value="csharp">C#</MenuItem>
                <MenuItem value="modula2">Modula2</MenuItem>
                <MenuItem value="a8086">A8086 Assembly</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="plsql">PL/SQL</MenuItem>
                <MenuItem value="verilog">Verilog</MenuItem>
                {/* Add other languages supported by your backend/MOSS */}
            </Select>
          </FormControl>

          {/* Action Button */}
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
                  disabled={files.length < 2 || loading} // Disable if less than 2 files
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                      minWidth: 200,
                      py: 1
                  }}
              >
                  {loading ? 'Checking...' : 'Check Plagiarism'}
              </Button>
          </Box>

          {/* Results Display */}
          {mossResults !== null && (
            <Fade in={true}>
              <Box>
                {/* Pass the new handler function */}
                <MossResultsDisplay
                  results={mossResults}
                  mossUrl={mossBaseUrl}
                  onViewMatch={handleViewMossUrl}
                />
              </Box>
            </Fade>
          )}

          {/* Privacy Notice */}
          <Divider sx={{ mt: 4, mb: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, fontSize: '0.9rem' }}>
            <strong>Privacy Notice:</strong> This MOSS Plagiarism Checker is designed with your privacy in mind. We do not store, access, or retain your code submissions beyond the temporary processing required for plagiarism detection. Files are temporarily cached during analysis and automatically deleted afterward. All code comparison is performed through Stanford's MOSS service, which generates publicly accessible result URLs. We recommend avoiding the submission of proprietary or sensitive code. By using this service, you acknowledge that your submissions will be processed through the Stanford MOSS system according to their terms of service.
          </Typography>
        </Paper>

        {/* Developer Credit */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2, fontStyle: 'italic' }}
        >
          Developed by Sri Karthikeya
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 0.5, fontStyle: 'italic' }}
        >
          In Association with COM
        </Typography>

        {/* Comparison Dialog (for Test Backend only) */}
        <CodeComparisonDialog
          open={comparisonDialogOpen}
          onClose={handleCloseComparisonDialog}
          data={comparisonData}
          loading={loadingComparison}
        />

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={error ? 10000 : 6000} // Show errors longer
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
