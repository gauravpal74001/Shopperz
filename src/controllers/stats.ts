import { myCache } from "../app.js";
import { Trycatch } from "../middlewares/error.js";
import {User} from "../models/user.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { calculatePercentage, categoryInventory, sixMonthOrderInventory } from "../utils/features.js";
import { getAdminProducts } from "./product.js";
import { disconnect } from "process";
import { Allorders } from "./order.js";


export const getDashboardStats = Trycatch(async(req , res, next )=>{
   let stats;
   if(myCache.has("admin-stats")){
    stats = JSON.parse(myCache.get("admin-stats") as string);
   }
   else{
      const today=new Date();
      const sixMonthAgo =new Date();
      sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
      const thisMonth={
        start:new Date(today.getFullYear(), today.getMonth(), 1),
        end:today
      };
      const lastMonth={
        start:new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end:new Date(today.getFullYear(), today.getMonth(), 0)
      };

      const thisMonthUsersPromise = User.find({
        createdAt:{
            $gte:thisMonth.start,
            $lte:thisMonth.end
        }
      });
      const lastMonthUsersPromise = User.find({
        createdAt:{
            $gte:lastMonth.start,
            $lte:lastMonth.end
        }
      });
      const thisMonthProductsPromise = Product.find({
        createdAt:{
            $gte:thisMonth.start,
            $lte:thisMonth.end
        }
      });
      const lastMonthProductsPromise = Product.find({
        createdAt:{
            $gte:lastMonth.start,
            $lte:lastMonth.end
        }
      });
      const thisMonthOrdersPromise = Order.find({
        createdAt:{
            $gte:thisMonth.start,
            $lte:thisMonth.end
        }
      });
      const lastMonthOrdersPromise = Order.find({
        createdAt:{
            $gte:lastMonth.start,
            $lte:lastMonth.end
        }
      });

      const sixMonthOrderPromise = Order.find({
        createdAt:{
            $gte:sixMonthAgo,
            $lte:today
        }
      });

      const latestTransactionPromise = Order.find({}).select(["totalAmount" , "status" , "orderItems" , "discount"]);

      const [thisMonthUsers, thisMonthOrders, thisMonthProducts, lastMonthUsers, lastMonthOrders, lastMonthProducts  , sixMonthOrders , UsersCount , allOrders , ProductsCount , categories , femaleCount , latestTransaction] = await Promise.all([
         thisMonthUsersPromise,
         thisMonthOrdersPromise, 
         thisMonthProductsPromise,
         lastMonthUsersPromise,
         lastMonthOrdersPromise,
         lastMonthProductsPromise , 
         sixMonthOrderPromise,
         User.countDocuments(),
         Order.find({}).select("totalAmount"),
         Product.countDocuments(),
         Product.find({}).distinct("category"), 
         User.countDocuments({gender:"female"}), 
         latestTransactionPromise
      ])
      //
      const thisMonthRevenue = thisMonthOrders.reduce((acc , order)=> acc + order.totalAmount || 0 ,  0);
      const lastMonthRevenue = lastMonthOrders.reduce((acc, order)=> acc+ order.totalAmount || 0 , 0);
       


       const changePercentage ={
        revenuePercentage: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
        UserPercentage:calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
        OrderPercentage:calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
        ProductPercentage:calculatePercentage(thisMonthProducts.length, lastMonthProducts.length)
      };
      const Revenue = allOrders.reduce((acc , curr)=> acc+ curr.totalAmount || 0 , 0);
      const count={
        users:UsersCount,
        orders:allOrders.length,
        products:ProductsCount
      };
      
      const sixMonthOrderCount = new Array(6).fill(0);
      const sixMonthOrderRevenue = new Array(6).fill(0);

      sixMonthOrders.forEach((order)=>{
        const creationDate =order.createdAt;
        const monthDiff = (creationDate.getMonth() -today.getMonth() + 12) % 12; 
        if(monthDiff < 6 ){
            sixMonthOrderCount[6 - monthDiff - 1]++;
            sixMonthOrderRevenue[6- monthDiff -1] += order.totalAmount || 0;
        }
      });

    //   const categoryCountPromise = categories.map((category)=>
    //         Product.countDocuments({category}) // return implicitly promise 
    //   );                               //map(()=>{})  no return promise  {}
    //   const categoryCount = await Promise.all(categoryCountPromise);

    //   const categoriesCount : Record<string ,number>[] = [];
      
    //   categories.forEach((category  ,  i)=>{
    //      categoriesCount.push({[category]: Math.round( (categoryCount[i]/ProductsCount)*100)});
    //   });
    
     const categoriesCount = await categoryInventory(categories, ProductsCount);

      const ratio={
        male: UsersCount - femaleCount, 
        female:femaleCount
      };

      const modifiedLatestTransaction = latestTransaction.map((i)=>{ return {
        _id:i._id,
        discount:i.discount,
        amount:i.totalAmount,
        status:i.status,
        quantity:i.orderItems.length
    }});
    
      stats={
       Revenue,
       changePercentage,
       count, 
       sixMonthOrderCount,
       sixMonthOrderRevenue, 
       categoriesCount,
       ratio,
       modifiedLatestTransaction
      }
      myCache.set("admin-stats" , JSON.stringify(stats));
    }

   res.status(200).json({
     success:true,
     stats
   })
}); 


export const getDashboardPie = Trycatch(async(req , res, next )=>{
  let charts;
  if(myCache.has("admin-piecharts")){ 
     charts=JSON.parse(myCache.get("admin-piecharts") as string);
  }
  else{
    const [processOrder, shippedOrder, deliveredOrder , categories , ProductsCount , outOfStockProducts , allUsers , adminCount , UserCount , allOrders] = await Promise.all([
       Order.countDocuments({status:"processing"}), 
       Order.countDocuments({status:"shipped"}), 
       Order.countDocuments({status:"delivered"}),  
       Product.find({}).distinct("category"),
       Product.countDocuments(),
       Product.countDocuments({stock:0}),
       User.find({}).select("dob"), 
       User.countDocuments({role:"admin"}),
       User.countDocuments({role:"user"}), 
       Order.find({}).select(["totalAmount" ,"discount" ,"tax" , "shippingCharges" , "subtotal" ])
    ]);


    const grossIncome = allOrders.reduce((acc, curr)=> acc+ curr.totalAmount , 0);
    const discount = allOrders.reduce((acc, curr)=> acc+ curr.discount , 0);
    const productionCost = allOrders.reduce((acc, curr)=> acc+ curr.shippingCharges , 0);
    const burnt = allOrders.reduce((acc, curr)=> acc+ curr.tax , 0);
    const marketingCost = Math.round(grossIncome * 0.3);
    const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;


    const fullfillment ={
        processOrder,
        shippedOrder,
        deliveredOrder, 
    };

    const categoryCount = await categoryInventory(categories, ProductsCount);

    const stockAvailablity = {
        inStock:ProductsCount- outOfStockProducts, 
        outOfStock:outOfStockProducts
    };

   const RevenueDistribution = {
        NetMargin:netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost
   };

   const   AdminsAndCustomers ={
        admins:adminCount,
        customers:UserCount
   };

   const UserAgeGroup ={
     teen:allUsers.filter((i)=>i.age < 19).length, 
     adult : allUsers.filter((i)=>i.age >= 19 && i.age <= 59).length, 
     senior : allUsers.filter((i)=>i.age >= 60).length
   };

    charts ={
         fullfillment,
         categoryCount, 
         stockAvailablity,
         RevenueDistribution, 
         AdminsAndCustomers,
         UserAgeGroup
    }
    myCache.set("admin-piecharts" , JSON.stringify(charts));
  }

  res.status(200).json({
    success:true,
    charts
  })
});

export const getDashboardBar = Trycatch(async(req , res, next )=>{
    let charts;
    if(myCache.has("admin-barcharts")){
        charts=JSON.parse(myCache.get("admin-barcharts") as string);
    }
    else{
        const today= new Date();
        const sixMonthAgo =new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12);

        const [products, users , orders]= await Promise.all([
            Product.find({createdAt:{$gte:sixMonthAgo , $lte:today}}).select("createdAt"), 
            User.find({createdAt:{$gte:sixMonthAgo , $lte:today}}).select("createdAt"),
            Order.find({createdAt:{$gte:twelveMonthAgo , $lte:today}}).select("createdAt")
        ])
        const productsCount = await sixMonthOrderInventory({docarr:products , length:6 , today });
        const usersCount= await sixMonthOrderInventory({docarr:users ,length:6 , today });
        const ordersCount= await sixMonthOrderInventory({docarr:orders ,length:12 , today });

        charts={
            productsCount , 
            usersCount, 
            ordersCount
        }

        myCache.set("admin-barcharts" , JSON.stringify(charts));
    }

    return res.status(200).json({
        success:true,
        charts
    })
   
}); 

export const getDashboardLine = Trycatch(async(req , res, next )=>{
    let charts;
    if(myCache.has("admin-linecharts")){
        charts=JSON.parse(myCache.get("admin-linecharts") as string);
    }
    else{
        const today= new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12);
        const baseQuery ={
            createdAt:{
                $gte:twelveMonthAgo,
                $lte:today
            }
        }
        
        const [products, users , allOrders ]= await Promise.all([
          Product.find(baseQuery).select("createdAt"),
          User.find(baseQuery).select("createdAt"), 
          Order.find(baseQuery).select(["totalAmount" , "discount" , "createdAt"])
        ])
        const productsCount = await sixMonthOrderInventory({docarr:products , length:12 , today });
        const usersCount= await sixMonthOrderInventory({docarr:users ,length:12 , today });
        const revenue = await sixMonthOrderInventory({docarr:allOrders ,length:12, today, property:"totalAmount"});
        const discount = await sixMonthOrderInventory({docarr:allOrders ,length:12, today, property:"discount"});

        charts={
            productsCount , 
            usersCount, 
            revenue, 
            discount
        }

        myCache.set("admin-linecharts" , JSON.stringify(charts));
    }

    return res.status(200).json({
        success:true,
        charts
    })
   

});