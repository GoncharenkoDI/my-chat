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

CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    login character varying COLLATE pg_catalog."default" NOT NULL,
    user_name character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    state bigint NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT login UNIQUE (login)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;

-- Table: public.rooms

-- DROP TABLE public.rooms;

CREATE TABLE IF NOT EXISTS public.rooms
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    member bigint NOT NULL REFERENCES users ON DELETE RESTRICT,
    state integer NOT NULL DEFAULT 0, -- 0 - normal, 1 - request-from  2 - request-in 3  - rejection
	room_name character varying COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rooms_pkey PRIMARY KEY (id, member)
)

TABLESPACE pg_default;

ALTER TABLE public.rooms
    OWNER to postgres;    