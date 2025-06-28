import express from "express";
import { newCoupon , getDiscount , allCoupons , deleteCoupon } from "../controllers/payment.js";
import { adminonly } from "../middlewares/auth.js";
import { newPayment } from "../controllers/payment.js";


const app=express.Router();

//path -> "api/v1/payment/create"
app.post("/create" , newPayment);

// path -> "api/v1/payment/new/coupon
app.post("/new/coupon", adminonly , newCoupon);

// route - /api/v1/payment/coupon/new
app.get("/discount", getDiscount);

//path ->"api/v1/payment/all"
app.get("/all" , adminonly , allCoupons)

//path ->"api/v1/payment/delete/coupon"
app.delete("/delete/:id", adminonly, deleteCoupon);

export default app;

