import express from 'express';
import dotenv from 'dotenv';
import compatRouter from './routes/compatibility.js';

// Load backend/.env explicitly
dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

const app = express();
app.use(express.json());
app.use(compatRouter);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Dev server listening on http://localhost:${port}`);
});
