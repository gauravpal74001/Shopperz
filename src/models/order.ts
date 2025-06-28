import mongoose from "mongoose";
import { User } from "./user.js";

const schema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:[true,"please enter address"]
        },
        city:{
            type:String,
            required:[true,"please enter city"]
        },
        state:{
            type:String,
            required:[true,"please enter state"]
        },
        country:{
            type:String,
            required:[true,"please enter country"]
        },
        pinCode:{
            type:Number,
            required:[true,"please enter pin code"]
        }
       
   }, 
   user:{
    type:String,
    ref:User,
    required:[true,"please enter user"]
   }, 

   subTotal:{
    type:Number,
    required:[true,"please enter subtotal"]
   },
   tax:{
    type:Number,
    required:[true,"please enter tax"]
   },
   shippingCharges:{
    type:Number,
    required:[true,"please enter shipping charges"],
    default:0
   },
   discount:{
    type:Number,
    required:[true, "please enter discount"],
    default:0
   }, 
   totalAmount:{
    type:Number,
    required:[true,"please enter total amount"]
   },
   status:{
    type:String,
    enum:["processing", "shipped" , "delivered" ], 
    default:"processing"
   }, 

   orderItems:[
    {
        name:String,
        price:Number,
        quantity:Number,
        photo:String,
        productId:{
            type:mongoose.Types.ObjectId,
            ref:"Product",
            required:[true,"please enter product id"]
        }
    }
   ],

},{
    timestamps: true
});

export const Order = mongoose.model("Order", schema);