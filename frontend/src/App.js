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
  FormHelperText,
  Divider,
  IconButton
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
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

// ===================================================================
// SECURE CONFIGURATION FOR VERCEL
// ===================================================================
const API_BASE_URL = process.env.REACT_APP_API_URL;
const API_SECRET_KEY = process.env.REACT_APP_API_KEY;

const API_ENDPOINTS = {
  CHECK_PLAGIARISM: `${API_BASE_URL}/check-plagiarism`,
};


// --- Theme Definition (remains the same) ---
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'dark'
            ? { /* Dark mode styles */
                primary: { main: '#90caf9' },
                secondary: { main: '#f48fb1' },
                background: { default: '#121212', paper: '#1e1e1e' },
                text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
            }
            : { /* Light mode styles */
                primary: { main: '#1976d2' },
                secondary: { main: '#dc004e' },
                background: { default: '#f7f7f7', paper: '#ffffff' },
                text: { primary: '#333333', secondary: '#666666' },
                divider: 'rgba(0, 0, 0, 0.12)',
            }),
    },
    typography: { /* Typography styles */
        h4: { fontWeight: 500, color: mode === 'dark' ? '#e0e0e0' : '#333333', },
        body1: { color: mode === 'dark' ? '#e0e0e0' : '#333333', },
        body2: { color: mode === 'dark' ? '#b0b0b0' : '#666666', }
    },
    components: { /* Component overrides */
        MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: mode === 'dark' ? '0px 3px 15px rgba(0, 0, 0, 0.5)' : '0px 3px 15px rgba(0, 0, 0, 0.1)', }, }, },
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', padding: '8px 16px', }, contained: { boxShadow: mode === 'dark' ? '0px 2px 4px rgba(0, 0, 0, 0.3)' : '0px 2px 4px rgba(0, 0, 0, 0.1)', }, }, },
        MuiListItem: { styleOverrides: { root: { color: mode === 'dark' ? '#e0e0e0' : '#333333', }, }, },
        MuiTableCell: { styleOverrides: { root: { borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', }, head: { fontWeight: 600, backgroundColor: mode === 'dark' ? 'rgba(30, 30, 46, 0.9)' : 'rgba(245, 245, 245, 0.9)', }, }, },
    },
});

// --- Helper Function to Extract Filename (remains the same) ---
const getBaseFilename = (fullPath) => {
    if (!fullPath || typeof fullPath !== 'string') {
        return fullPath || 'Unknown File';
    }
    const parts = fullPath.split('/');
    return parts[parts.length - 1];
};

// --- MossResultsDisplay component (remains the same) ---
function MossResultsDisplay({ results, mossUrl, onViewMatch }) {
  if (!results || results.length === 0) {
    return (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                No matches were found between the submitted files.
            </Typography>
            {mossUrl && (
                <Button
                    variant="outlined"
                    startIcon={<LaunchIcon />}
                    href={mossUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                >
                    View on MOSS Website
                </Button>
            )}
        </Box>
    );
  }

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
              {hasMultipleComparisons && (
                <TableCell align="center">View Comparison</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((match, index) => {
              const file1Percent = parseInt(match.file1.percentage) || 0;
              const file2Percent = parseInt(match.file2.percentage) || 0;
              const maxPercent = Math.max(file1Percent, file2Percent);
              const file1BaseName = getBaseFilename(match.file1.name);
              const file2BaseName = getBaseFilename(match.file2.name);

              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileIcon fontSize="small" color="primary" />
                      <Typography title={match.file1.name}>{file1BaseName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PercentIcon fontSize="small" sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        {match.file1.percentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileIcon fontSize="small" color="secondary" />
                      <Typography title={match.file2.name}>{file2BaseName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PercentIcon fontSize="small" sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        {match.file2.percentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="medium" color={maxPercent > 50 ? "error.main" : (maxPercent > 30 ? "warning.main" : "inherit")} > {maxPercent}% </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="medium">{match.lines_matched}</Typography>
                  </TableCell>
                  {hasMultipleComparisons && (
                    <TableCell align="center">
                      <Button variant="contained" color="primary" size="small" startIcon={<VisibilityIcon />} onClick={() => onViewMatch(match.comparison_url)} > View Match </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!hasMultipleComparisons && results.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => onViewMatch(results[0].comparison_url)} > View MOSS Comparison </Button>
        </Box>
      )}
    </Box>
  );
}

// --- App Component ---
function App() {
  // FIXED: Removed the incorrect 'a.' before useState and useMemo
  const [mode, setMode] = useState('dark');
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mossBaseUrl, setMossBaseUrl] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mossResults, setMossResults] = useState(null);

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

  const dropzoneSx = {
        border: `2px dashed ${theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#aaaaaa'}`,
        borderRadius: theme.shape.borderRadius * 1.5,
        padding: theme.spacing(4),
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)') : (theme.palette.mode === 'dark' ? theme.palette.background.default : '#ffffff'),
        color: theme.palette.text.secondary,
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
        '&:hover': { borderColor: theme.palette.primary.main, color: theme.palette.primary.main, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', }
    };

  const handleViewMossUrl = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            console.error("Attempted to open MOSS comparison with no URL.");
            setError("Could not open MOSS report: URL is missing.");
            setSnackbarMessage('');
            setOpenSnackbar(true);
        }
    };

  const handleCheckPlagiarism = async () => {
        if (files.length < 2) {
            setError('Please upload at least two files to compare.');
            setSnackbarMessage('');
            setOpenSnackbar(true);
            return;
        }

        if (!API_BASE_URL || !API_SECRET_KEY) {
            setError("API connection is not configured. Please contact the administrator.");
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
            formData.append('files', file, file.name);
        }
        formData.append('language', language);

        try {
            console.log('Sending request to secure EC2 server...');
            const response = await axios.post(API_ENDPOINTS.CHECK_PLAGIARISM, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-API-Key': API_SECRET_KEY
                },
                timeout: 180000
            });

            console.log('Full response:', response);

            if (response.data && response.data.url) {
                setMossBaseUrl(response.data.url);
                setMossResults(response.data.results || []);
                if (!response.data.results || response.data.results.length === 0) {
                    setSnackbarMessage('Plagiarism check completed, but no matches found.');
                } else {
                    setSnackbarMessage('Plagiarism check completed successfully!');
                }
                setError('');
            } else {
                throw new Error(response.data?.error || 'Received an unexpected response from the server.');
            }
        } catch (error) {
            console.error('Error during plagiarism check:', error);
            let errorMsg = 'An error occurred during plagiarism check.';
            if (error.response) {
                errorMsg = `Server Error: ${error.response.data?.error || `Status ${error.response.status}`}`;
            } else if (error.code === 'ECONNABORTED') {
                errorMsg = 'The request timed out. The server might be busy. Please try again.';
            } else if (error.request) {
                errorMsg = 'Could not connect to the server. Please check its status.';
            } else {
                errorMsg = `Request setup error: ${error.message}`;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
            setOpenSnackbar(true);
        }
    };

  const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
          {/* Theme toggle switch */}
          <Box sx={{ position: 'absolute', top: 12, right: 16, zIndex: 1, display: 'flex', alignItems: 'center', }}>
            <Brightness7Icon fontSize="small" sx={{ color: mode === 'light' ? theme.palette.primary.main : theme.palette.text.secondary, mr: 1, }} />
            <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" size="small" />
            <Brightness4Icon fontSize="small" sx={{ color: mode === 'dark' ? theme.palette.primary.main : theme.palette.text.secondary, ml: 1, }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3, pr: { xs: 0, sm: 8 } }}>
            Moss Plagiarism Checker
          </Typography>

          {/* Dropzone */}
          <Box sx={{ mb: 3 }}>
            <Box {...getRootProps()} sx={dropzoneSx}>
              <input {...getInputProps()} />
              <UploadFileIcon sx={{ fontSize: 48, mb: 1 }} />
              {isDragActive ? ( <Typography>Drop the files here ...</Typography> ) : ( <Typography>Drag & drop files, or click to select</Typography> )}
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
                <Button size="small" color="error" onClick={() => { setFiles([]); setMossBaseUrl(''); setMossResults(null); setError(''); }} disabled={loading} sx={{ ml: 2 }} >
                  Clear All
                </Button>
              </Typography>
               <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                {files.map((file, index) => (
                  <ListItem key={index} disablePadding secondaryAction={ <IconButton edge="end" aria-label="delete" size="small" disabled={loading} onClick={() => { const newFiles = files.filter((_, i) => i !== index); setFiles(newFiles); if (newFiles.length < 2) { setMossResults(null); } }} > <CloseIcon fontSize="small" /> </IconButton> } >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}> <InsertDriveFileIcon fontSize="small" /> </ListItemIcon>
                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} primaryTypographyProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Fade>

          {/* Language Selector */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select labelId="language-select-label" value={language} label="Language" onChange={(e) => setLanguage(e.target.value)} disabled={loading} >
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
            </Select>
          </FormControl>

          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2, mb: 2 }}>
              <Button variant="contained" color="primary" onClick={handleCheckPlagiarism} disabled={files.length < 2 || loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} sx={{ minWidth: 200, py: 1.5 }} >
                  {loading ? 'Checking...' : 'Check for Plagiarism'}
              </Button>
          </Box>

          {/* Results Display */}
          {mossResults !== null && (
            <Fade in={true}>
              <Box>
                <MossResultsDisplay results={mossResults} mossUrl={mossBaseUrl} onViewMatch={handleViewMossUrl} />
              </Box>
            </Fade>
          )}

          {/* Privacy Notice */}
          <Divider sx={{ mt: 4, mb: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, fontSize: '0.9rem' }}>
            <strong>Privacy Notice:</strong> Your files are sent to the Stanford MOSS service for analysis and are not stored on our server. The results link generated by MOSS is public. Do not submit sensitive or proprietary code.
          </Typography>
        </Paper>

        {/* Developer Credit */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, fontStyle: 'italic' }} > Developed by COM technologies pvt.ltd </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5, fontStyle: 'italic' }} > MOSS </Typography>

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={error ? 10000 : 6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
          <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} variant="filled" sx={{ width: '100%' }} >
            {error || snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
