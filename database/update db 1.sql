ALTER TABLE IF EXISTS public.room_users
    ADD COLUMN avatar character varying(128) COLLATE pg_catalog."default";
