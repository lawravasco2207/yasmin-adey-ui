// src/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: 'yasmin_owner',           // Your PostgreSQL username
  host: 'ep-soft-art-a8a52vwt-pooler.eastus2.azure.neon.tech',
  database: 'yasmin',
  password: 'npg_POQUWrE7Jl1V',  // Replace with your postgres password
  port: 5432,                 // Default PostgreSQL port
});

export default pool;

//yasmin_owner:npg_POQUWrE7Jl1V@ep-soft-art-a8a52vwt-pooler.eastus2.azure.neon.tech/yasmin?sslmode=require