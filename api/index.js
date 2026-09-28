import { app } from '../server/src/server.js';
import { initDb } from '../server/src/db/index.js';

// Initialize SQLite database schema on function cold start
initDb();

export default app;
