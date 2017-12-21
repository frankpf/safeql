CREATE TABLE users (
        id             text             NOT NULL PRIMARY KEY,
        email          text             UNIQUE, -- email is case insensitive and must be unique
        pwd_hash       char(60)         NOT NULL,
        join_date      timestamptz      NOT NULL,
        is_valid       boolean          NOT NULL,
        deleted        boolean          NOT NULL DEFAULT false,
        last_active    timestamptz
);

CREATE INDEX users_email_index ON users (email);
