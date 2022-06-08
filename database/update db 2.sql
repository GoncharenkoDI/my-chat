CREATE OR REPLACE VIEW public.room_members
    AS
     SELECT ro.member AS owner,
    o.user_name AS owner_name,
    ro.room_id,
    ro.room_name,
    rm.member,
    mb.user_name AS member_name,
    ro.id as owner_ru_id,
    rm.id as member_ru_id
   FROM room_users ro
     JOIN room_users rm ON ro.room_id = rm.room_id AND ro.member <> rm.member
     JOIN users o ON ro.member = o.id
     JOIN users mb ON rm.member = mb.id;
