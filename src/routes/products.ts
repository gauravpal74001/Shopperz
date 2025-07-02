import express from "express";
import { newProduct } from "../controllers/product.js";
import { multipleUpload, singleUpload } from "../middlewares/multer.js";
import { adminonly } from "../middlewares/auth.js";
import { getLatestProducts , getCategories , getAdminProducts , getSingleProduct , updateProduct , deleteProduct } from "../controllers/product.js";
import { getAllProducts } from "../controllers/product.js";
import { v2 as cloudinary } from "cloudinary";
import { Trycatch } from "../middlewares/error.js";
import { createReview , deleteReview , getReviews} from "../controllers/product.js";

const app = express.Router();

// Create new product  - /api/v1/product/new
app.post("/new", adminonly, multipleUpload, newProduct);

// Get all products
app.get("/all", getAllProducts);

// Get latest products
app.get("/latest", getLatestProducts);

//get categories
app.get("/categories", getCategories);

//get admin products -> api/v1/product/admin
app.get("/admin", adminonly, getAdminProducts);

//single product , update product , delete product
app.route("/:_id")
  .get(getSingleProduct)
  .put(adminonly, multipleUpload, updateProduct)
  .delete(adminonly, deleteProduct);

//review routes
app.post("/review/new/:id", createReview);
app.delete("/review/:id", deleteReview);
app.get("/review/:id" , getReviews);

export default app;

