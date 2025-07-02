import mongoose from "mongoose";
import { invalidateCacheProps, orderItems } from "../types/types.js";
import { myCache, redis } from "../app.js";
import { Product } from "../models/product.js";
import ErrorHandler from "./utility-class.js";
import { NextFunction } from "express";
import { Order } from "../models/order.js";
import { Interface } from "readline";
import {v2 as cloudinary} from "cloudinary";
import Review from "../models/reviews.js";


const getBase64 = (file: Express.Multer.File) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

export const uploadTocloudinary = async(photos:Express.Multer.File[])=>{
    const promise=[];
    for(let i=0;i<photos.length;i++){
        promise.push(cloudinary.uploader.upload(getBase64(photos[i])));
    }
    const result = await Promise.all(promise);

    return result.map((i)=>({
        public_id:i.public_id,
        url:i.secure_url
    }))
   
};

export const deleteFromCloudinary = async (public_ids: string[]): Promise<any[]> => {
    try {
        if (!Array.isArray(public_ids)) {
            throw new Error('public_ids must be an array of strings');
        }

        const deletionPromises = public_ids.map((publicId) => 
            cloudinary.uploader.destroy(publicId)
        );

        const results = await Promise.all(deletionPromises);
        return results;
    } catch (error) {
        console.error('Error deleting files from Cloudinary:', error);
        throw error;
    }
};

export const connectDB=(uri:string )=>{
    mongoose.connect( uri  , {
        dbName:"Ecommerce25"
    }).then(
         (c)=>{console.log(`connected to mongodb ${c.connection.host}`)}
    ).catch(
        (e)=>{console.log(e)}
    )
};

export const  invalidateCache  =  async ( { product , order , admin , user_id , reviews , product_id }: invalidateCacheProps)=>{
    if(product){
         const cacheKeys = ["latest-product" , "categories" , "products"];
         const id= await Product.find({}).select("_id");
         id.forEach((i)=>{
             cacheKeys.push(`product ${i._id}`);
         })
         await redis.del(cacheKeys);
    }
    
    if(order){
        {/*  `my_orders-${user_id}`  all-orders  order-${id}  */}
        const cacheKeys =["all-orders"  , `my_orders-${user_id}`];
         {/* const user_id =await Order.find({}).select("user");
        user_id.forEach((i)=>{
             cacheKeys.push(`my_orders-${i.user}`);
        })*/ } //not  optimized 

        const id =await Order.find({}).select("_id");//this order id can be pased as a paramter of invalidateCache
        id.forEach((i)=>{                            // time : 4:41:40 
            cacheKeys.push(`order-${i._id}`);
        })
        await redis.del(cacheKeys);
    }

    if(admin){
        await redis.del(["admin-stats" , "admin-barcharts" , "admin-linecharts" , "admin-piecharts" ]);
    }

    if(reviews){
        await redis.del([`reviews-${product_id}`]);
    }
};

export const reducestock = async (orderItems: orderItems[])=>{
   for(let i=0;i<orderItems.length;i++){
     const product = await Product.findById(orderItems[i].productId);
     if(!product) throw new Error("product not found ");
     product.stock -= orderItems[i].quantity;
     await product.save();
   }
}; 

export const calculatePercentage = (thisMonth:number , lastMonth:number)=>{
    if(lastMonth===0) return thisMonth*100;
    const percentage= ((thisMonth-lastMonth)/lastMonth)*100;
    return percentage.toFixed(0);
};

export const categoryInventory = async( categories : string [] , ProductsCount:number)=>{
    const categoryCountPromise = categories.map((category)=>
        Product.countDocuments({category}) // return implicitly promise 
  );                               //map(()=>{})  no return promise  {}
  const categoryCount = await Promise.all(categoryCountPromise);

  const categoriesCount : Record<string ,number>[] = [];
  
  categories.forEach((category  ,  i)=>{
     categoriesCount.push({[category]: Math.round( (categoryCount[i]/ProductsCount)*100)});
  });

  return categoriesCount;
};

//custom interface for the document
interface Mydocumnet extends mongoose.Document {
    createdAt: Date;
    discount?: number;
    totalAmount?: number;
}

type INventoryProps = {
   docarr: Mydocumnet[],
   length: number,
   today: Date,
   property?: "discount" | "totalAmount"
};

export const sixMonthOrderInventory = async ({docarr , length , today , property}:INventoryProps) =>{ 
   const data = new Array(length).fill(0);
    docarr.forEach((i)=>{
        const creationDate =i.createdAt;
        const monthDiff = (creationDate.getMonth() -today.getMonth() + 12) % 12; 
        if(monthDiff < length ){
            data[length - monthDiff - 1]+= property ? i[property] : 1 ;
        }
    });
    return data;
};

export const findAvgrating = async (Product_id:string)=>{
    const reviews = await Review.find({product_id:Product_id}).select("ratings");
    let total_rating = 0;
    reviews.forEach((i)=>(
        total_rating+=i.ratings
    ))
    const avg_rating = total_rating/reviews.length;
    return {avg_rating:Math.floor(avg_rating) , no_of_reviews:reviews.length};
}







