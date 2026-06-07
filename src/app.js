import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "../src/routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//  Health Check
app.get("/",(req,res)=>{
    res.json({
        message:"Server is running!"
    })
});

//  This is where we will add our routes for authentication and other features in the future.
app.use("/api/auth", authRouter);

export default app;