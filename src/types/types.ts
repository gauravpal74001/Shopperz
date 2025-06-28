import { NextFunction , Response , Request} from "express";
import { invalidateCache } from "../utils/features.js";

export interface newUserRequest{
    _id:string,
    name:string,
    email:string,
    photo:string,
    role:string | "admin" | "user",
    gender: string,
    dob:Date,
    age:number
};


export interface newProductRequest{
    name:string,
    price:number,
    stock:number,
    category:string,
};



export type controllerType = (
    req:Request,
    res:Response,
    next:NextFunction
) => Promise<void | Response <any, Record<string, any>>>;

export type searchRequestQuery = {
    sort?:string,
    page?:string,
    search?:string,
    category?:string,
    price?:string,
    stock?:string,
};

export interface BaseQuery{
    name: {
            $regex ?:string 
            $options?: string
    };
    category?: string;
    price?: {
            $lte: number;
    };
};

export type invalidateCacheProps = {
    //optional 
   product?:boolean,
   order?:boolean,
   admin?:boolean, 
   user_id?:string
};
export type shippingInfo = {
    address:string ,
    city:string,
    state:string,
    country:string,
    pincode:number
}
export type orderItems = {
    name:string,
    photo:string,
    price :number, 
    quantity:number, 
    productId:string
};
export type newOrderRequestBody = {
    shippingInfo: shippingInfo,
    user:string,
    subTotal:number,
    tax:number,
    shippingCharges:number,
    discount:number,
    totalAmount:number,
    status:string,
    orderItems: orderItems[]
};
