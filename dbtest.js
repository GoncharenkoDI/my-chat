'use strict';
const { Pool } = require('pg');
const pool = new Pool({
  connectionString:
    'postgres://kiqyxgwnfftzps:665f4ae97d8303ac4ea4488f1fec95dc4e4d3e59196f33ac5c23a5435ccde44d@ec2-34-194-158-176.compute-1.amazonaws.com:5432/d1l09rlbrveb9k',
  ssl: {
    rejectUnauthorized: false,
  },
});

const sql = 'select * from public.users';
(async () => {
  const client = await pool.connect();
  const result = await client.query(sql, []);
  console.dir(result);
})();
