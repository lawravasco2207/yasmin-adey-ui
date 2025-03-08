"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db.ts
// src/db.ts
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL, // e.g., postgres://user:pass@host:port/db
    ssl: {
        rejectUnauthorized: false, // Allows self-signed certs (common for hosted DBs)
    },
});
pool.on('connect', () => console.log('DB connected successfully'));
pool.on('error', (err) => console.error('DB connection error:', err.stack));
exports.default = pool;
//yasmin_owner:npg_POQUWrE7Jl1V@ep-soft-art-a8a52vwt-pooler.eastus2.azure.neon.tech/yasmin?sslmode=require
//# sourceMappingURL=db.js.map