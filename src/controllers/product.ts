import { NextFunction , Request , Response } from "express";
import { Trycatch } from "../middlewares/error.js";
import { BaseQuery, newProductRequest } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.js";
import { rm } from "fs";
import { searchRequestQuery } from "../types/types.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";



//revalidate on create , update , delete product and on new order
export const  getLatestProducts = Trycatch(async(req, res, next)=>{
      let products;
      if(myCache.has("latest-product")){
        products=JSON.parse(myCache.get("latest-product") as string);
      }
      else{
        products= await Product.find().sort({createdAt: -1}).limit(5);
        myCache.set("latest_product", JSON.stringify(products)); //key - value pair
      }

      res.status(200).json({
        success: true,
        products
      })
});
//revalidate on create , update , delete product and on new order
export const  getCategories = Trycatch(async(req, res, next)=>{
     let categories;
     if(myCache.has("categories")){
          categories=JSON.parse(myCache.get("categories") as string);
     }
     else{
        categories= await Product.distinct("category");
        // Ensure all categories are lowercase
        categories = categories.map(cat => cat.toLowerCase());
        myCache.set("categories", JSON.stringify(categories));
     }
     
    res.status(200).json({
      success: true,
      categories
    })
});

//revalidate on create , update , delete product and on new order
export const getAdminProducts = Trycatch(async(req, res , next)=>{
   let products;
   if(myCache.has("products")){
       products=JSON.parse(myCache.get("products") as string);
   }
   else{
    products= await Product.find();
    myCache.set("products", JSON.stringify(products));
   }
   
   res.status(200).json({
    success: true,
    products
   })
});

//revalidate on create , update , delete product and on new order
export const getSingleProduct = Trycatch(async(req, res , next)=>{
    const id=req.params._id;
    let product;
    if(myCache.has(`product ${id}`)){
        product=JSON.parse(myCache.get(`product ${id}`) as string);
    }
    else{
     product= await Product.findById(id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
     }
     myCache.set(`product ${id}`, JSON.stringify(product));
    }
   
    res.status(200).json({
     success: true,
     product
    })
});

 
export const newProduct = Trycatch(async (
    req: Request<{}, {}, newProductRequest>,
    res,
    next
    ) => {
    const { name, price, stock, category } = req.body;
    const photo=req.file;
    if(!photo){
        return next(new ErrorHandler("Photo is required",400));
    }

    if(!name || !price || !stock || !category){
        rm(photo.path , ()=>{
            console.log("Photo deleted");
        })
        return next (new ErrorHandler("All fields are required",400));
    }
    const product = await Product.create({
        name,
        price,
        stock,
        category:category.toLowerCase(),
        photo:photo?.path
    });

    await invalidateCache({product:true , admin:true});
  //revalidate on create product
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
        product
    });
});


export const updateProduct = Trycatch(async(req, res , next)=>{
     const id=req.params._id;
     const product=await Product.findById(id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
     }

     const {name, price ,stock ,category} = req.body;
     const photo = req.file;
     if(photo){
        rm(product.photo , ()=>{
            console.log("old photo deleted");
        })

        product.photo=photo.path;
     }

     if(name) product.name=name;
     if(price) product.price=price;
     if(stock) product.stock=stock;
     if(category) product.category=category;

     await product.save();  
     //revalidate on update product
     await invalidateCache({product:true , admin:true});

     res.status(200).json({
         success:true,
         message:"Product updated successfully",
         product
     })

});

export const deleteProduct = Trycatch(async (req, res, next) =>{
    const id = req.params._id;
    const product = await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("product not found " , 404));
    }

    // Delete the photo file if it exists
    if(product.photo) {
        rm(product.photo, () => {
            console.log("Product photo deleted");
        });
    }

    await product.deleteOne();
    //revalidate on delete product
    await invalidateCache({product:true , admin:true});
    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
});


export const getAllProducts = Trycatch(async (req : Request<{},{},{}, searchRequestQuery > , res, next) =>{
      const {sort, search , category , price , stock} = req.query;
      const page=Number(req.query.page) || 1;
      const limit = Number( process.env.PRODUCT_PER_PAGE) || 10; //concept of pagination
      const skip= (page-1)*limit;//concept of pagination

      const baseQuery:BaseQuery = {};
        if(search){
            baseQuery.name={
                        $regex:search,
                        $options:"i"
            }
        }
        if(category){
            baseQuery.category=category
        }
        if(price){
            baseQuery.price={
                $lte:Number(price)
            }
        }

        //cmd 1 
        // const products =await Product.find(baseQuery).sort(
        //     sort && { price : sort === "asc" ? 1 :-1}  //1-> asc , -1-> desc
        // ).limit(limit).skip(skip);
        //cmd 2 
        // const filterOnlyProduct = await Product.find(baseQuery);
        

        // we can run cmd 1 and cmd 2 parallelly using promise.all
        const [products, filterOnlyProduct]=await Promise.all([
            Product.find(baseQuery).sort(
                sort && { price : sort === "asc" ? 1 :-1}  //1-> asc , -1-> desc
            ).limit(limit).skip(skip) , 
            Product.find(baseQuery)
        ])
        const totalPage= Math.ceil(filterOnlyProduct.length / limit);

        return res.status(200).json({
            success:true,
            products, 
            totalPage
        })
      
});


