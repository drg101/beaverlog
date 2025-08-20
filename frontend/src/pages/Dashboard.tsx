import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Input,
  InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Visibility, VisibilityOff, Event, Message } from '@mui/icons-material';

interface Event {
  id: number;
  name: string;
  timestamp: number;
  session_id: string;
  uid: string;
  app_id: string;
  meta: any;
}

interface Log {
  id: number;
  message: string;
  timestamp: number;
  session_id: string;
  uid: string;
  app_id: string;
  data: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const [appId, setAppId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(new Date(Date.now() - 24 * 60 * 60 * 1000)); // 24 hours ago
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = () => {
    if (appId && privateKey) {
      setAuthenticated(true);
      fetchData();
    }
  };

  const fetchData = async () => {
    if (!fromDate || !toDate) return;
    
    setLoading(true);
    setError(null);
    
    const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
    const toTimestamp = Math.floor(toDate.getTime() / 1000);
    
    try {
      // Fetch events
      const eventsResponse = await fetch(
        `/api/events?from=${fromTimestamp}&to=${toTimestamp}`,
        {
          headers: {
            'app_id': appId,
            'private_key': privateKey
          }
        }
      );
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      // Fetch logs
      const logsResponse = await fetch(
        `/api/logs?from=${fromTimestamp}&to=${toTimestamp}`,
        {
          headers: {
            'app_id': appId,
            'private_key': privateKey
          }
        }
      );
      
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }
      
      if (!eventsResponse.ok && !logsResponse.ok) {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Event sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{event.name}</Typography>
          <Chip 
            label={formatTimestamp(event.timestamp)} 
            size="small" 
            sx={{ ml: 'auto' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Session: {event.session_id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User: {event.uid}
          </Typography>
        </Box>
        {event.meta && Object.keys(event.meta).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Metadata:</Typography>
            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {JSON.stringify(event.meta, null, 2)}
            </pre>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderLogCard = (log: Log) => (
    <Card key={log.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Message sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            {log.message}
          </Typography>
          <Chip 
            label={formatTimestamp(log.timestamp)} 
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Session: {log.session_id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User: {log.uid}
          </Typography>
        </Box>
        {log.data && Object.keys(log.data).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Data:</Typography>
            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {JSON.stringify(log.data, null, 2)}
            </pre>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (!authenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your app credentials to view events and logs.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth variant="standard">
              <InputLabel htmlFor="private-key">Private Key</InputLabel>
              <Input
                id="private-key"
                type={showPrivateKey ? 'text' : 'password'}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>

          <Button
            variant="contained"
            onClick={authenticate}
            disabled={!appId || !privateKey}
            fullWidth
          >
            Access Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setAuthenticated(false)}
          >
            Logout
          </Button>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <DateTimePicker
              label="From"
              value={fromDate}
              onChange={setFromDate}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DateTimePicker
              label="To"
              value={toDate}
              onChange={setToDate}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button
              variant="contained"
              onClick={fetchData}
              disabled={loading || !fromDate || !toDate}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh Data'}
            </Button>
          </Box>
        </LocalizationProvider>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`Events (${events.length})`} />
            <Tab label={`Logs (${logs.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {events.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No events found for the selected time period.
            </Typography>
          ) : (
            events.map(renderEventCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {logs.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No logs found for the selected time period.
            </Typography>
          ) : (
            logs.map(renderLogCard)
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}