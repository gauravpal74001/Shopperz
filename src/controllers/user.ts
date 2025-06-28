import { Request, Response , NextFunction } from "express"; 
import { User } from "../models/user.js";
import { newUserRequest } from "../types/types.js";
import { Trycatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser = Trycatch(async(
    req: Request<{}, {}, newUserRequest>,
    res: Response,
    next: NextFunction
) => {
    const { _id, name, email, photo, gender, dob } = req.body;

    let user=await User.findById(_id);
    if(user){
        return res.status(200).json({
            success:true,
            message:`welcomem ${user.name}`
        })
    }

    if(!_id || !name || !email || !photo || !gender || !dob){
        return next(new ErrorHandler("please fill all the fields",400))
    }
        
    user = await User.create({
        _id,
        name,
        email,
        photo,
        gender,
        dob: new Date(dob)
    });

    return res.status(201).json({
        success: true,
        message: `User created successfully: ${user.name}`,
        user
    });
    
});

export const getAllUsers= Trycatch(async(req:Request,res:Response,next:NextFunction)=>{
    const users=await User.find();
    return res.status(200).json({
        success:true, 
        users
    })
});

export const getUserId= Trycatch(async(req:Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user) { return next(new ErrorHandler("user not found " , 404))}
    return res.status(200).json({
        success:true, 
        user
    })
});

export const deleteUser= Trycatch(async(req:Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user) { return next(new ErrorHandler("user not found " , 404))}
    await user.deleteOne();
    return res.status(200).json({
        success:true, 
        message:"user deleted successfully"
    })
});

