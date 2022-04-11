-- SEQUENCE: messages_id_seq

-- DROP SEQUENCE IF EXISTS messages_id_seq;

CREATE SEQUENCE IF NOT EXISTS messages_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE messages_id_seq
    OWNER TO honcharenko;

--ALTER SEQUENCE messages_id_seq OWNED BY messages.id;
-- SEQUENCE: room_members_id_seq

-- DROP SEQUENCE IF EXISTS room_members_id_seq;

CREATE SEQUENCE IF NOT EXISTS room_members_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE room_members_id_seq
    OWNER TO honcharenko;

-- SEQUENCE: users_id_seq

-- DROP SEQUENCE IF EXISTS users_id_seq;

CREATE SEQUENCE IF NOT EXISTS users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE users_id_seq
    OWNER TO honcharenko;

-- Table: rooms

-- DROP TABLE IF EXISTS rooms;

CREATE TABLE IF NOT EXISTS rooms
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    state integer NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    room_type integer NOT NULL DEFAULT 0,
    CONSTRAINT rooms_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS rooms
    OWNER TO honcharenko;

-- Table: session

-- DROP TABLE IF EXISTS session;

CREATE TABLE IF NOT EXISTS session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS session
    OWNER TO honcharenko;
-- Index: IDX_session_expire

-- DROP INDEX IF EXISTS "IDX_session_expire";

CREATE INDEX IF NOT EXISTS "IDX_session_expire"
    ON session USING btree
    (expire ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: users

-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    login character varying COLLATE pg_catalog."default" NOT NULL,
    user_name character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    state integer NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT login UNIQUE (login)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS users
    OWNER TO honcharenko;

ALTER SEQUENCE users_id_seq OWNED BY users.id;
-- Table: room_users

-- DROP TABLE IF EXISTS room_users;

CREATE TABLE IF NOT EXISTS room_users
(
    id integer NOT NULL DEFAULT nextval('room_members_id_seq'::regclass),
    room_id uuid NOT NULL,
    member integer NOT NULL,
    room_name character varying COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT room_members_pkey PRIMARY KEY (id),
    CONSTRAINT room_members_unique UNIQUE (room_id, member),
    CONSTRAINT rooms_member_fkey FOREIGN KEY (member)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT rooms_rooms_fkey FOREIGN KEY (room_id)
        REFERENCES rooms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS room_users
    OWNER TO honcharenko;


ALTER SEQUENCE room_members_id_seq OWNED BY room_users.id;
-- Table: messages

-- DROP TABLE IF EXISTS messages;

CREATE TABLE IF NOT EXISTS messages
(
    id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    destination uuid NOT NULL,
    author integer NOT NULL,
    text character varying(1024) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT author_in_room_fkey FOREIGN KEY (author, destination)
        REFERENCES room_users (member, room_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT messages_author_fkey FOREIGN KEY (author)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT messages_destination_fkey FOREIGN KEY (destination)
        REFERENCES rooms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS messages
    OWNER TO honcharenko;

ALTER SEQUENCE messages_id_seq OWNED BY messages.id;
-- View: room_members

-- DROP VIEW room_members;

CREATE OR REPLACE VIEW room_members
 AS
 SELECT ro.member AS owner,
    o.user_name AS owner_name,
    ro.room_id,
    ro.room_name,
    rm.member,
    mb.user_name AS member_name
   FROM room_users ro
     JOIN room_users rm ON ro.room_id = rm.room_id AND ro.member <> rm.member
     JOIN users o ON ro.member = o.id
     JOIN users mb ON rm.member = mb.id;

ALTER TABLE room_members
    OWNER TO honcharenko;

-- View: contacts

-- DROP VIEW contacts;

CREATE OR REPLACE VIEW contacts
 AS
 SELECT u.id AS owner,
    u1.id,
    u1.login,
    u1.user_name,
    u1.state,
    u1.created_at,
    u1.modified_at
   FROM users u
     JOIN users u1 ON u.id <> u1.id
     LEFT JOIN room_members rm ON u.id = rm.owner AND u1.id = rm.member
  WHERE rm.room_id IS NULL
  ORDER BY u1.id;

ALTER TABLE contacts
    OWNER TO honcharenko;

