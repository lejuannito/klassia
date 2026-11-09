-- D1: npm-free schema for verified, published Bassa audio.
CREATE TABLE IF NOT EXISTS bassa_audio (
 id TEXT PRIMARY KEY,
 entry_id TEXT NOT NULL,
 form TEXT NOT NULL,
 sense TEXT NOT NULL,
 mime TEXT NOT NULL,
 size_bytes INTEGER NOT NULL,
 credit TEXT NOT NULL DEFAULT '',
 review_ref TEXT NOT NULL,
 consent_ref TEXT NOT NULL,
 published_by TEXT NOT NULL,
 published_at TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('published','withdrawn'))
);
CREATE INDEX IF NOT EXISTS bassa_audio_status_idx ON bassa_audio(status, published_at);
CREATE INDEX IF NOT EXISTS bassa_audio_entry_idx ON bassa_audio(entry_id, status);
