CREATE TABLE forms (
    id          UUID PRIMARY KEY,
    title       VARCHAR(160) NOT NULL,
    description VARCHAR(600),
    slug        VARCHAR(200) NOT NULL UNIQUE,
    status      VARCHAR(20)  NOT NULL,
    ink         VARCHAR(20)  NOT NULL,
    fields      JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL
);

CREATE TABLE submissions (
    id           UUID PRIMARY KEY,
    form_id      UUID        NOT NULL REFERENCES forms (id) ON DELETE CASCADE,
    data         JSONB       NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_submissions_form ON submissions (form_id, submitted_at DESC);
