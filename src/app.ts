import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";
import {config} from "dotenv";
import morgan from "morgan";
import Razorpay from "razorpay";
import cors from "cors";

config({
    path:"./.env"
});

const razorpayid={
    key_id:process.env.RAZORPAY_KEY_ID || "",
    key_secret:process.env.RAZORPAY_KEY_SECRET || ""
};

const port =process.env.PORT || 4000;
const uri =process.env.MONGO_URI || "";



console.log(port);

//importing routes
import userRoutes from "./routes/user.js"
import  productRoutes from "./routes/products.js"
import orderRoutes from "./routes/order.js"
import paymentRoutes from "./routes/payment.js"
import dashboardRoutes from "./routes/stats.js";




connectDB(uri);
//caching using node-cache
export const razorpay= new Razorpay(razorpayid);
export const myCache = new NodeCache();

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

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
// Error middleware should be used after all routes
app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`express is running on port ${port}`)
})

