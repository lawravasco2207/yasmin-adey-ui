"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db.ts
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'yasmin_owner', // Your PostgreSQL username
    host: 'ep-soft-art-a8a52vwt-pooler.eastus2.azure.neon.tech',
    database: 'yasmin',
    password: 'npg_Zszqo7n3Ejcw', // Replace with your postgres password
    port: 5432, // Default PostgreSQL port
});
exports.default = pool;
//# sourceMappingURL=db.js.map