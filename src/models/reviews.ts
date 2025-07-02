import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
     comment:{
        type:String
     },
     ratings:{
        type:Number,
        default:0,
        required:[true , "Please enter ratings"],
        min:[1 , "Please enter ratings between 1 and 5"],
        max:[5 , "Please enter ratings between 1 and 5"]
     },
     user_id:{
        type:String,
        ref:"User",
        required:true
     },
     product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
     }, 
     user:{
      name:{
        type:String,
      },
      photo:{
        type:String,
      }
     }
}, {
    timestamps:true
});

export default mongoose.model("Review" , reviewSchema);