import { useState } from "react";
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
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Event, Message, Person, PlayArrow } from "@mui/icons-material";

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

interface Uid {
  uid: string;
  app_id: string;
  first_seen: number;
  last_seen: number;
}

interface Session {
  session_id: string;
  uid: string;
  app_id: string;
  start_time: number;
  end_time: number;
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
  const [appId, setAppId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ); // 30 days ago
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [uids, setUids] = useState<Uid[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
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

    const fromTimestamp = fromDate.getTime();
    const toTimestamp = toDate.getTime();

    try {
      // Fetch events
      const eventsResponse = await fetch(
        `/api/events?from=${fromTimestamp}&to=${toTimestamp}`,
        {
          headers: {
            app_id: appId,
            private_key: privateKey,
          },
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
            app_id: appId,
            private_key: privateKey,
          },
        }
      );

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      // Fetch UIDs
      const uidsResponse = await fetch("/api/uids", {
        headers: {
          app_id: appId,
          private_key: privateKey,
        },
      });

      if (uidsResponse.ok) {
        const uidsData = await uidsResponse.json();
        setUids(uidsData.uids || []);
      }

      // Fetch Sessions
      const sessionsResponse = await fetch("/api/sessions", {
        headers: {
          app_id: appId,
          private_key: privateKey,
        },
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }

      if (
        !eventsResponse.ok &&
        !logsResponse.ok &&
        !uidsResponse.ok &&
        !sessionsResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    console.log({ timestamp });
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Event sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">{event.name}</Typography>
          <Chip
            label={formatTimestamp(event.timestamp)}
            size="small"
            sx={{ ml: "auto" }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
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
            <pre style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Message sx={{ mr: 1, color: "secondary.main" }} />
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            {log.message}
          </Typography>
          <Chip label={formatTimestamp(log.timestamp)} size="small" />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
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
            <pre style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              {JSON.stringify(log.data, null, 2)}
            </pre>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderUidCard = (uid: Uid) => (
    <Card key={uid.uid} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Person sx={{ mr: 1, color: "success.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {uid.uid}
          </Typography>
          <Chip
            label={`Last seen: ${formatTimestamp(uid.last_seen)}`}
            size="small"
            color="success"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          First seen: {formatTimestamp(uid.first_seen)}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSessionCard = (session: Session) => (
    <Card key={session.session_id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PlayArrow sx={{ mr: 1, color: "info.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {session.session_id}
          </Typography>
          <Chip
            label={`Duration: ${Math.round(
              (session.end_time - session.start_time) / 60000
            )}min`}
            size="small"
            color="info"
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            User: {session.uid}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Started: {formatTimestamp(session.start_time)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ended: {formatTimestamp(session.end_time)}
          </Typography>
        </Box>
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

            <TextField
              fullWidth
              label="Private Key"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button variant="outlined" onClick={() => setAuthenticated(false)}>
            Logout
          </Button>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <DateTimePicker
              label="From"
              value={fromDate}
              onChange={setFromDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <DateTimePicker
              label="To"
              value={toDate}
              onChange={setToDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <Button
              variant="contained"
              onClick={fetchData}
              disabled={loading || !fromDate || !toDate}
            >
              {loading ? <CircularProgress size={20} /> : "Refresh Data"}
            </Button>
          </Box>
        </LocalizationProvider>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab label={`Events (${events.length})`} />
            <Tab label={`Logs (${logs.length})`} />
            <Tab label={`Users (${uids.length})`} />
            <Tab label={`Sessions (${sessions.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {events.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No events found for the selected time period.
            </Typography>
          ) : (
            events.map(renderEventCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {logs.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No logs found for the selected time period.
            </Typography>
          ) : (
            logs.map(renderLogCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {uids.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No users found.
            </Typography>
          ) : (
            uids.map(renderUidCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {sessions.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No sessions found.
            </Typography>
          ) : (
            sessions.map(renderSessionCard)
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}
