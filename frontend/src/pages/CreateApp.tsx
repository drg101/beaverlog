import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
  Card,
  CardContent,
  IconButton,
  Snackbar
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

interface AppCredentials {
  app_id: string;
  public_key: string;
  private_key: string;
}

export default function CreateApp() {
  const [credentials, setCredentials] = useState<AppCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const createApp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create app');
      }
      
      const data = await response.json();
      setCredentials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
  };

  const copyAllCredentials = () => {
    if (credentials) {
      const text = `App ID: ${credentials.app_id}\nPublic Key: ${credentials.public_key}\nPrivate Key: ${credentials.private_key}`;
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New App
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Generate new API credentials for your application. You'll receive a public key for writing data 
          and a private key for reading data.
        </Typography>

        {!credentials && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={createApp}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Creating...' : 'Create New App'}
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {credentials && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              App created successfully! Save these credentials securely.
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  App ID
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={credentials.app_id}
                    InputProps={{ readOnly: true }}
                    size="small"
                  />
                  <IconButton onClick={() => copyToClipboard(credentials.app_id)}>
                    <ContentCopy />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Public Key (for writing data)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={credentials.public_key}
                    InputProps={{ readOnly: true }}
                    size="small"
                  />
                  <IconButton onClick={() => copyToClipboard(credentials.public_key)}>
                    <ContentCopy />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Private Key (for reading data)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={credentials.private_key}
                    InputProps={{ readOnly: true }}
                    size="small"
                    type="password"
                  />
                  <IconButton onClick={() => copyToClipboard(credentials.private_key)}>
                    <ContentCopy />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={copyAllCredentials}
                sx={{ mr: 2 }}
              >
                Copy All Credentials
              </Button>
              <Button
                variant="contained"
                onClick={() => setCredentials(null)}
              >
                Create Another App
              </Button>
            </Box>
          </Box>
        )}

        <Snackbar
          open={copySuccess}
          autoHideDuration={3000}
          onClose={() => setCopySuccess(false)}
          message="Copied to clipboard!"
        />
      </Paper>
    </Container>
  );
}