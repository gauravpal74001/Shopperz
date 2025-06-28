import express from "express";
import { newProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminonly } from "../middlewares/auth.js";
import { getLatestProducts , getCategories , getAdminProducts , getSingleProduct , updateProduct , deleteProduct } from "../controllers/product.js";
import { getAllProducts } from "../controllers/product.js";

const app = express.Router();

// Create new product  - /api/v1/product/new
app.post("/new" , adminonly, singleUpload, newProduct);

//get all latest products -> api/v1/product/latest
app.get("/latest" , getLatestProducts);

//get all categories -> api/v1/product/categories
app.get("/categories" ,  getCategories );

//get admin products -> api/v1/product/admin
app.get("/admin" , adminonly, getAdminProducts);

//get all products with feature like sorting , filtering  , pagination 
app.get("/all" , getAllProducts);;

//single product , update product , delete product
app.route("/:_id")
  .get(getSingleProduct)
  .put(adminonly, singleUpload, updateProduct)
  .delete(adminonly, deleteProduct);

export default app;

