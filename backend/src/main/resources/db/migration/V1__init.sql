-- Growth keywords (operator-managed)
CREATE TABLE growth_keywords (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    name_en     VARCHAR(50),
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO growth_keywords (name, name_en, sort_order) VALUES
    ('기획', 'Planning', 1),
    ('협업', 'Collaboration', 2),
    ('의사결정', 'Decision-making', 3),
    ('실행', 'Execution', 4),
    ('커뮤니케이션', 'Communication', 5);

-- Participants (created on QR auth)
CREATE TABLE participants (
    id              BIGSERIAL    PRIMARY KEY,
    session_token   VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(100),
    role            VARCHAR(20)  NOT NULL DEFAULT 'PARTICIPANT',
    onboarding_done BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_active_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participants_session ON participants(session_token);
CREATE INDEX idx_participants_role ON participants(role);

-- Booths (registered by booth operators)
CREATE TABLE booths (
    id               BIGSERIAL    PRIMARY KEY,
    code             VARCHAR(10)  NOT NULL UNIQUE,
    name             VARCHAR(200) NOT NULL,
    operator_id      BIGINT       REFERENCES participants(id),
    idea_summary     TEXT,
    wrong_assumption TEXT,
    trial_moments    TEXT,
    learning_pivot   TEXT,
    current_state    TEXT,
    location_desc    VARCHAR(200),
    qr_token         VARCHAR(255) NOT NULL UNIQUE,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booths_code ON booths(code);
CREATE INDEX idx_booths_qr_token ON booths(qr_token);

-- Booth-keyword association
CREATE TABLE booth_keywords (
    booth_id    BIGINT NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
    keyword_id  BIGINT NOT NULL REFERENCES growth_keywords(id) ON DELETE CASCADE,
    PRIMARY KEY (booth_id, keyword_id)
);

-- Check-ins (participant visits a booth)
CREATE TABLE check_ins (
    id              BIGSERIAL   PRIMARY KEY,
    participant_id  BIGINT      NOT NULL REFERENCES participants(id),
    booth_id        BIGINT      NOT NULL REFERENCES booths(id),
    method          VARCHAR(10) NOT NULL DEFAULT 'QR',
    checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(participant_id, booth_id)
);

CREATE INDEX idx_checkins_booth ON check_ins(booth_id);
CREATE INDEX idx_checkins_participant ON check_ins(participant_id);

-- Learning records
CREATE TABLE learning_records (
    id              BIGSERIAL    PRIMARY KEY,
    participant_id  BIGINT       NOT NULL REFERENCES participants(id),
    booth_id        BIGINT       NOT NULL REFERENCES booths(id),
    content         TEXT         NOT NULL,
    is_released     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_records_booth ON learning_records(booth_id);
CREATE INDEX idx_learning_records_participant ON learning_records(participant_id);

-- Learning record keyword association
CREATE TABLE learning_record_keywords (
    record_id   BIGINT NOT NULL REFERENCES learning_records(id) ON DELETE CASCADE,
    keyword_id  BIGINT NOT NULL REFERENCES growth_keywords(id) ON DELETE CASCADE,
    PRIMARY KEY (record_id, keyword_id)
);

-- Resonance reactions
CREATE TABLE resonances (
    id              BIGSERIAL   PRIMARY KEY,
    record_id       BIGINT      NOT NULL REFERENCES learning_records(id) ON DELETE CASCADE,
    participant_id  BIGINT      NOT NULL REFERENCES participants(id),
    type            VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(record_id, participant_id, type)
);

CREATE INDEX idx_resonances_record ON resonances(record_id);

-- Crowd status snapshots
CREATE TABLE crowd_snapshots (
    id          BIGSERIAL   PRIMARY KEY,
    booth_id    BIGINT      NOT NULL REFERENCES booths(id),
    head_count  INT         NOT NULL DEFAULT 0,
    level       VARCHAR(10) NOT NULL DEFAULT 'LOW',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crowd_snapshots_booth ON crowd_snapshots(booth_id);
CREATE INDEX idx_crowd_snapshots_time ON crowd_snapshots(recorded_at);
