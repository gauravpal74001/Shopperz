import { Trycatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";

export  const adminonly = Trycatch(async(req, res, next ) =>{
     const {id} = req.query;
     if(!id){
        return next(new ErrorHandler("please provide id" , 400))
     }

     const user =await User.findById(id);
     if(!user){
        return next(new ErrorHandler("user not found" , 400));
     }

     if(user.role !== "admin"){
        return next(new ErrorHandler("you are not authorized to access this resource" , 403));
     }

     next();
});