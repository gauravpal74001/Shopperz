import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    photos:[{ public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    price: {
        type: Number,
        required: [true, "Please enter price"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter stock"]
    },
    category: {
        type: String,
        required: [true, "Please enter category"],
        trim: true
    },
    ratings:{
        type:Number,
        default:0
    },
    no_of_reviews:{
        type:Number,
        default:0
    }
}, {
    timestamps: true
});

export const Product = mongoose.model("Product", schema);