import { Request} from "express";
import { Trycatch } from "../middlewares/error.js";
import { BaseQuery, newProductRequest } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.js";
import { searchRequestQuery } from "../types/types.js";
import { deleteFromCloudinary, findAvgrating, invalidateCache, uploadTocloudinary } from "../utils/features.js";
import  Review  from "../models/reviews.js";
import { User } from "../models/user.js";
import {redis} from "../app.js";
import {REDIS_TTL} from "../app.js";



//revalidate on create , update , delete product and on new order
export const  getLatestProducts = Trycatch(async(req, res, next)=>{
      let products;
      const key="latest-product";
      products= await redis.get(key);

      if(products){
        products=JSON.parse(products);
      }
      else{
        products= await Product.find().sort({createdAt: -1}).limit(5);
        redis.setex(key, REDIS_TTL, JSON.stringify(products)); //key - value pair
      }

      res.status(200).json({
        success: true,
        products
      })
});
//revalidate on create , update , delete product and on new order
export const  getCategories = Trycatch(async(req, res, next)=>{
     let categories;
     const key="categories";
     categories= await redis.get(key);
     if(categories){
          categories=JSON.parse(categories);
     }
     else{
        categories= await Product.distinct("category");
        // Ensure all categories are lowercase
        categories = categories.map(cat => cat.toLowerCase());
        redis.setex(key, REDIS_TTL, JSON.stringify(categories));
     }
     
    res.status(200).json({
      success: true,
      categories
    })
});

//revalidate on create , update , delete product and on new order
export const getAdminProducts = Trycatch(async(req, res , next)=>{
   let products;
   const key="products";
   products= await redis.get(key);
   if(products){
       products=JSON.parse(products);
   }
   else{
    products= await Product.find();
    redis.setex("products", REDIS_TTL, JSON.stringify(products));
   }
   
   res.status(200).json({
    success: true,
    products
   })
});

//revalidate on create , update , delete product and on new order
export const getSingleProduct = Trycatch(async(req, res , next)=>{
    const id=req.params._id;
    const key=`product ${id}`;
    let product;
    product= await redis.get(key);
    if(product){
        product=JSON.parse(product);
    }
    else{
     product= await Product.findById(id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
     }
     redis.setex(key, REDIS_TTL, JSON.stringify(product));
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
    const photos = req.files as Express.Multer.File[] | undefined;


    if (!photos) {
        return next(new ErrorHandler("Please upload at least one photo", 400));
    }

    if (photos.length > 5) {
        return next(new ErrorHandler("Maximum 5 photos allowed", 400));
    }

    if (!name || !price || !stock || !category) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    try {
        const uploadedPhotos = await uploadTocloudinary(photos);
        const product = await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photos: uploadedPhotos
        });

        await invalidateCache({ product: true, admin: true });

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to create product", 500));
    }
});


export const updateProduct = Trycatch(async(req, res,next)=>{
     const id=req.params._id;
     const product=await Product.findById(id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
     }

     const {name, price ,stock ,category} = req.body;
     const photos = req.files as Express.Multer.File[] | undefined;
     
     try {
         if(photos && photos.length > 0){
             // Delete old photos from Cloudinary
             const ids = product.photos.map((i)=>i.public_id);
             await deleteFromCloudinary(ids); 
             
             // Upload new photos and set them in the product
             const uploadedPhotos = await uploadTocloudinary(photos);
             product.set('photos', uploadedPhotos);
         }

         if(name) product.name=name;
         if(price) product.price=price;
         if(stock) product.stock=stock;
         if(category) product.category=category.toLowerCase();

         await product.save();  
         await invalidateCache({product:true , admin:true});

         res.status(200).json({
             success:true,
             message:"Product updated successfully",
             product
         });
     } catch (error) {
         // If upload fails, return error
         return next(new ErrorHandler("Failed to update product", 500));
     }
});

export const deleteProduct = Trycatch(async (req, res, next) =>{
    const id = req.params._id;
    const product = await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("product not found " , 404));
    }

    const ids= product.photos.map((i)=>i.public_id);
    await deleteFromCloudinary(ids);

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

      const baseQuery:BaseQuery = {
        name: { $regex: search, $options: "i" }
      };
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

//review controller
export const createReview = Trycatch(async(req, res, next)=>{
     const {id}=req.params;
     const user_id=req.query.id;
     const user = await User.findById(user_id);
     const product=await Product.findById(id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
     }
     const {comment , ratings}=req.body;
     const alreadyReviewed=await Review.findOne({
        user_id: user_id,
        product_id: id
     });

     if(alreadyReviewed){
        alreadyReviewed.comment=comment;
        alreadyReviewed.ratings=ratings;
        await alreadyReviewed.save();
     }else{
        const review = await Review.create({
            comment,
            ratings,
            user_id:user?._id,
            product_id:id,
            user:{
                name:user?.name,
                photo:user?.photo
            }
        });
        await review!.save();
     }

     const {avg_rating , no_of_reviews}=await findAvgrating(id);

     product.ratings=avg_rating;
     product.no_of_reviews=no_of_reviews;

     await product.save();
     invalidateCache({product:true , admin:true , reviews:true , product_id:id});

     return res.status(alreadyReviewed ? 200 : 201).json({
        success:true,
        message:alreadyReviewed ? "Review updated successfully" : "Review created successfully",
     });
});

export const deleteReview = Trycatch(async(req, res, next)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const review=await Review.findOne({product_id:id , user_id:req.query.id});
    if(!review){
        return next(new ErrorHandler("Review not found",404));
    }

    let authenticatedUser= (req.query.id as string) === review.user_id;
    if(!authenticatedUser){
        return next(new ErrorHandler("You are not authorized to delete this review",403));
    }

    await review.deleteOne();
    await invalidateCache({product:true , admin:true , reviews:true , product_id:id});

    const {avg_rating , no_of_reviews}=await findAvgrating(id);
    product.ratings=avg_rating;
    product.no_of_reviews=no_of_reviews;

    await product.save();

    return res.status(200).json({
        success:true,
        message:"Review deleted successfully",
    })
    
});

export const getReviews = Trycatch(async(req, res, next)=>{
    const {id}=req.params;
    const key=`reviews-${id}`;
    let reviews;
    reviews= await redis.get(key);
    if(reviews){
        reviews=JSON.parse(reviews);
    }
    else{
        reviews = await Review.find({product_id:id}).sort({updatedAt: -1});
        redis.setex(key, REDIS_TTL, JSON.stringify(reviews));
    }
    return res.status(200).json({
        success:true,
        reviews
    });
});



