ALTER TABLE IF EXISTS public.users
    ADD COLUMN avatar character varying(128) COLLATE pg_catalog."default";
ALTER TABLE IF EXISTS public.room_users
    ADD COLUMN avatar character varying(128) COLLATE pg_catalog."default";
DROP VIEW public.contacts;
CREATE OR REPLACE VIEW public.contacts
 AS
 SELECT u.id AS owner,
    u1.id,
    u1.login,
    u1.user_name,
    u1.state,
    u1.avatar,
    u1.created_at,
    u1.modified_at
   FROM users u
     JOIN users u1 ON u.id <> u1.id
     LEFT JOIN room_members rm ON u.id = rm.owner AND u1.id = rm.member
  WHERE rm.room_id IS NULL
  ORDER BY u1.id;

UPDATE public.users SET avatar = 'avatar-icon-116137-1938.png';
UPDATE public.room_users SET avatar = 'avatar-icon-116137-1938.png';
