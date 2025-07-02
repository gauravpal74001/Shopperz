import { Trycatch } from "../middlewares/error.js";
import { Request } from "express";
import { newOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reducestock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { redis, REDIS_TTL } from "../app.js";



export const newOrder = Trycatch(async(req : Request<{},{},newOrderRequestBody>, res , next )=>{
    const {shippingInfo , user, subTotal, tax, shippingCharges, discount, totalAmount, status, orderItems } =req.body;     
    
     if(!shippingInfo || !user || !subTotal || !tax || !shippingCharges || !discount || !totalAmount || !status || !orderItems){
        return next (new ErrorHandler("please fill all the fields",400));
     }

    const order =await Order.create({
        shippingInfo,
        user,
        subTotal,
        tax,
        shippingCharges,
        discount,
        totalAmount,
        status,
        orderItems
    })


    //reduce stock
    await reducestock(orderItems);

    ///invaldate cache on new order placed
    await invalidateCache({product:true , order:true , admin:true , user_id:order.user });

    res.status(201).json({
        success:true,
        order
    })
});
//
export const myOrders = Trycatch (async (req, res,next )=>{
    const {user : user_id}= req.query;
    if(!user_id){
        return next (new ErrorHandler("user id is required",400));
    }
    let orders;
    const key= `my_orders-${user_id}`;
    orders=await redis.get(key);
    if(orders){
        orders=JSON.parse(orders);
    }
    else{
        orders = await Order.find({user : user_id});
        redis.setex(key, REDIS_TTL, JSON.stringify(orders));
    }
     
    res.status(200).json({
        success:true,
        orders
    })

});

export const Allorders = Trycatch (async (req, res,next )=>{
    let orders;
    const key =  "all-orders";
    orders=await redis.get(key);
    if(orders){
        orders=JSON.parse(orders);
    }
    else{
        orders= await Order.find({}).populate( "user" , "name"); //populate user name 
            redis.setex(key, REDIS_TTL, JSON.stringify(orders));
    }
    res.status(200).json({
        success:true, 
        orders   
    })

});

export const getSingleOrder = Trycatch (async (req, res,next )=>{
  const {id}=req.params;
  let order;
  const key= `order-${id}`;
  order=await redis.get(key);
  if(order){
     order = JSON.parse(order) 
  }
  else{
    order = await Order.findById(id).populate("user" , "name");
    redis.setex(key, REDIS_TTL, JSON.stringify(order));
  }

  res.status(200).json({
    success:true, 
    order
  })
  
});



export const processOrder = Trycatch(async(req , res , next )=>{
    const {id}=req.params;
    const order = await Order.findById(id);
    if(!order){
        return next (new ErrorHandler("order not found",404));
    }

    if(order.status==="processing"){order.status="shipped"}
    else if(order.status==="shipped"){order.status="delivered"}
    else{
        return next (new ErrorHandler("order is already delivered",400));
    }

    await order.save();

    ///invaldate cache on new order placed
    await invalidateCache({product:false , order:true , admin:true , user_id:order.user });

    res.status(200).json({
        success:true,
        order
    })
});

export const deleteOrder = Trycatch(async (req , res, next ) =>{
    const {id}=req.params;
    const order = await Order.findById(id);
    if(!order){
        return next (new ErrorHandler("order not found",404));
    }

    await order.deleteOne();
    //invalidate cache
    await invalidateCache({product:false , order:true , admin:true , user_id:order.user });

    res.status(200).json({
        success:true,
        message:"order deleted successfully"
    })

});


