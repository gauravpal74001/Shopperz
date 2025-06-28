import express from 'express';
import { getDashboardStats , getDashboardPie , getDashboardBar , getDashboardLine } from '../controllers/stats.js';
import { adminonly } from '../middlewares/auth.js';

const app = express.Router();
//path -> "api/v1/dashboard/stats"
app.get("/stats" , adminonly , getDashboardStats);

//path -> "api/v1/dashboard/pie" 
app.get("/pie" , adminonly , getDashboardPie );

//path -> "api/v1/dashboard/bar"
app.get("/bar" , adminonly , getDashboardBar );

//path -> "api/v1/dashboard/line"
app.get("/line" , adminonly , getDashboardLine );



export default app;