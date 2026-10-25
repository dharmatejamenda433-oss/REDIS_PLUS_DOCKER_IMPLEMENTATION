import express from "express";
import dotenv from "dotenv";
import connectDb from "./lib/db.js";
import User from "./model/user.model.js";
import Redis from "ioredis";
dotenv.config({ path: "./src/.env" });
const PORT=process.env.PORT || 8000;
const app=express();
const redis=new Redis(process.env.REDIS_URL);
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Hello from redis");
});
app.post("/create",async (req,res)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,email,password
    })
    await redis.del("user:all");
    res.json(user);
});
app.get("/get",async (req,res)=>{
    const users=await User.find();
    res.json(users);
});
app.get("/get-with-redis",async (req,res)=>{
    const cached=await redis.get("user:all");
    if(cached){
        const user=JSON.parse(cached);
        return res.json(user);
    }
    const users=await User.find();
    await redis.set("user:all",JSON.stringify(users));
    res.json(users);
});
app.listen(PORT,()=>{
    connectDb();
    console.log(`Server is running on port ${PORT}`);
});