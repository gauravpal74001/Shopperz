import express from "express";
import { newOrder , myOrders , Allorders , getSingleOrder , processOrder , deleteOrder } from "../controllers/order.js";
import { adminonly  } from "../middlewares/auth.js";

const app=express.Router();

// path -> "api/v1/order/new"
app.post("/new", newOrder);

//path -> "api/v1/order/my"
app.get("/my" , myOrders);

//path -> "api/v1/order/admin"
app.get("/admin" , adminonly ,  Allorders);


app.route("/:id").get(getSingleOrder).put(adminonly , processOrder).delete(adminonly , deleteOrder);

export default app;

