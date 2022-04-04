-- Database: vue-chat

-- DROP DATABASE "vue-chat";

CREATE DATABASE "vue-chat"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Ukrainian_Ukraine.1251'
    LC_CTYPE = 'Ukrainian_Ukraine.1251'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- SEQUENCE: public.messages_id_seq

-- DROP SEQUENCE IF EXISTS public.messages_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.messages_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.messages_id_seq
    OWNER TO postgres;

--ALTER SEQUENCE public.messages_id_seq OWNED BY messages.id;
-- SEQUENCE: public.room_members_id_seq

-- DROP SEQUENCE IF EXISTS public.room_members_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.room_members_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.room_members_id_seq
    OWNER TO postgres;

-- SEQUENCE: public.users_id_seq

-- DROP SEQUENCE IF EXISTS public.users_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.users_id_seq
    OWNER TO postgres;

-- Table: public.rooms

-- DROP TABLE IF EXISTS public.rooms;

CREATE TABLE IF NOT EXISTS public.rooms
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    state integer NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    room_type integer NOT NULL DEFAULT 0,
    CONSTRAINT rooms_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rooms
    OWNER to postgres;

-- Table: public.session

-- DROP TABLE IF EXISTS public.session;

CREATE TABLE IF NOT EXISTS public.session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.session
    OWNER to postgres;
-- Index: IDX_session_expire

-- DROP INDEX IF EXISTS public."IDX_session_expire";

CREATE INDEX IF NOT EXISTS "IDX_session_expire"
    ON public.session USING btree
    (expire ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
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

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

ALTER SEQUENCE public.users_id_seq OWNED BY users.id;
-- Table: public.room_users

-- DROP TABLE IF EXISTS public.room_users;

CREATE TABLE IF NOT EXISTS public.room_users
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
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT rooms_rooms_fkey FOREIGN KEY (room_id)
        REFERENCES public.rooms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.room_users
    OWNER to postgres;


ALTER SEQUENCE public.room_members_id_seq OWNED BY room_users.id;
-- Table: public.messages

-- DROP TABLE IF EXISTS public.messages;

CREATE TABLE IF NOT EXISTS public.messages
(
    id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    destination uuid NOT NULL,
    author integer NOT NULL,
    text character varying(1024) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT author_in_room_fkey FOREIGN KEY (author, destination)
        REFERENCES public.room_users (member, room_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT messages_author_fkey FOREIGN KEY (author)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT messages_destination_fkey FOREIGN KEY (destination)
        REFERENCES public.rooms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.messages
    OWNER to postgres;

ALTER SEQUENCE public.messages_id_seq OWNED BY messages.id;
-- View: public.room_members

-- DROP VIEW public.room_members;

CREATE OR REPLACE VIEW public.room_members
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

ALTER TABLE public.room_members
    OWNER TO postgres;

-- View: public.contacts

-- DROP VIEW public.contacts;

CREATE OR REPLACE VIEW public.contacts
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

ALTER TABLE public.contacts
    OWNER TO postgres;

