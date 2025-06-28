import { razorpay } from "../app.js";
import { Trycatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";


export const newPayment = Trycatch(async(req, res, next )=>{
    const {amount}=req.body;
    if( !amount){
        return next(new ErrorHandler("please provide  the amount" , 400));
    }

    const options={
        amount:Number(amount)*100,
        currency:"INR", 
    }

    const order=await razorpay.orders.create(options);

    res.status(201).json({
        success:true,
        order
    })

});



export const newCoupon = Trycatch(async(req, res, next )=>{
    const {code, amount}=req.body;
    if(!code || !amount){
        return next(new ErrorHandler("please fill all the fields" , 400));
    }

    const coupon= await Coupon.create({code, amount });
    res.status(201).json({
        success:true,
        message:`coupon ${code} created successfully`,
        coupon
    })

});

export const getDiscount = Trycatch(async(req, res, next )=>{
    const {code} = req.query;
    const coupon = await Coupon.findOne({ code });
    if(!coupon){
        return next(new ErrorHandler("coupon not found" , 404));
    }

    res.status(200).json({
        success:true,
        discount:coupon.amount
    })

});

export const allCoupons = Trycatch(async(req, res , next )=>{
      const coupon =await Coupon.find();
      res.status(200).json({
        success:true, 
        coupon
      })
});

export const deleteCoupon = Trycatch(async(req, res , next )=>{
    const {id}=req.params;
    const coupon =await Coupon.findById(id);
    if(!coupon){
        return next(new ErrorHandler("coupon not found" , 404));
    }

    await coupon.deleteOne();
    res.status(200).json({
        success:true,
        message:`coupon ${coupon.code} deleted successfully`
    })
});