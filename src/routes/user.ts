import express from "express";
import { newUser , getAllUsers , getUserId , deleteUser} from "../controllers/user.js";
import { adminonly } from "../middlewares/auth.js";

const app=express.Router();


// path -> "api/v1/user/new"
app.post("/new", newUser);

//path ->"api/v1/user/all"
app.get("/all", adminonly , getAllUsers);

//path ->"api/v1/user/DynamicId"
app.route("/:id").get( getUserId).delete(adminonly , deleteUser);


export default app;

