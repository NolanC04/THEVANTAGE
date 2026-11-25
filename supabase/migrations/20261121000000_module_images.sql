-- Airman Apex migration, carried over unchanged (already applied to the shared project). See 20261124100000_airman_prefix.sql.
-- Module paintings, seeded from docs/design/pilot-app/data.js (n -> img). Regenerate with `npm run seed:images`.
alter table modules add column if not exists image_url text;
update modules m set image_url = v.url
from (values
  (1, '/images/modules/AAPEX_M01.png'),
  (2, '/images/modules/AAPEX_M02.png'),
  (3, '/images/modules/AAPEX_M03.png'),
  (4, '/images/modules/AAPEX_M04.png'),
  (5, '/images/modules/AAPEX_M05.png'),
  (6, '/images/modules/AAPEX_M06.png'),
  (7, '/images/modules/AAPEX_M07.png'),
  (8, '/images/modules/AAPEX_M08.png'),
  (9, '/images/modules/AAPEX_M09.png'),
  (10, '/images/modules/AAPEX_M10.png'),
  (11, '/images/modules/AAPEX_M11.png'),
  (12, '/images/modules/AAPEX_M12.png'),
  (13, '/images/modules/AAPEX_M13.png'),
  (14, '/images/modules/AAPEX_M14.png'),
  (15, '/images/modules/AAPEX_M15.png'),
  (16, '/images/modules/AAPEX_M16.png'),
  (17, '/images/modules/AAPEX_M17.png'),
  (18, '/images/modules/AAPEX_M18.png'),
  (19, '/images/modules/AAPEX_M19.png'),
  (20, '/images/modules/AAPEX_M20.png'),
  (21, '/images/modules/AAPEX_M21.png'),
  (22, '/images/modules/AAPEX_M22.png'),
  (23, '/images/modules/AAPEX_M23.png'),
  (24, '/images/modules/AAPEX_M24.png')
) as v(n, url)
where m.number = v.n;
grant select (image_url) on modules to authenticated; -- paintings are not class-walled content
