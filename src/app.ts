import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";
import {config} from "dotenv";
import morgan from "morgan";
import Razorpay from "razorpay";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";
import { Redis } from "ioredis";
import ErrorHandler from "./utils/utility-class.js";



config({
    path:"./.env"
});

const razorpayid={
    key_id:process.env.RAZORPAY_KEY_ID || "",
    key_secret:process.env.RAZORPAY_KEY_SECRET || ""
};

const port = process.env.PORT || 4000;
const uri = process.env.MONGO_URI || "";
// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const REDIS_TTL=process.env.REDIS_TTL || 4*60*60;

//importing routes
import userRoutes from "./routes/user.js"
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/order.js"
import paymentRoutes from "./routes/payment.js"
import dashboardRoutes from "./routes/stats.js";

// Initialize Redis
export const redis = new Redis({
    host: 'redis',
    port: 6379,
    maxRetriesPerRequest: 5
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});

// Connect to MongoDB
connectDB(uri);

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//caching using node-cache
export const razorpay = new Razorpay(razorpayid);
export const myCache = new NodeCache();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

  const allowedOrigins = [
    "http://localhost:5173",
    "https://shopperz-frontend-rxss-ceqv62csr-gauravs-projects-9c3630b4.vercel.app"
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
  



app.get("/", (req, res) => {
    res.send("api is working with path /api/v1");
});

//using routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/uploads" , express.static("uploads"));


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorMiddleware(err as ErrorHandler, req, res, next);
});

app.listen(port, ()=>{
    console.log(`express is running on port ${port}`)
});

