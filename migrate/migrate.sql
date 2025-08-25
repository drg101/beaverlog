-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
    id BIGSERIAL PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL UNIQUE,
    public_key VARCHAR(255) NOT NULL,
    private_key VARCHAR(255) NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    uid VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    meta JSONB
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    uid VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    data JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_uid ON events(uid);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_events_app_id ON events(app_id);

CREATE INDEX IF NOT EXISTS idx_logs_uid ON logs(uid);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_app_id ON logs(app_id);

CREATE INDEX IF NOT EXISTS idx_apps_app_id ON apps(app_id);

-- Create uids table
CREATE TABLE IF NOT EXISTS uids (
    uid VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    first_seen BIGINT NOT NULL,
    last_seen BIGINT NOT NULL,
    PRIMARY KEY (uid, app_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) NOT NULL,
    uid VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    PRIMARY KEY (session_id, app_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_uids_app_id ON uids(app_id);
CREATE INDEX IF NOT EXISTS idx_uids_last_seen ON uids(last_seen);

CREATE INDEX IF NOT EXISTS idx_sessions_uid ON sessions(uid);
CREATE INDEX IF NOT EXISTS idx_sessions_app_id ON sessions(app_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions(end_time);