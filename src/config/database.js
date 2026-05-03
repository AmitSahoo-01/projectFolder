import mongoose from "mongoose";

const connectToDB = async ()=>{
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("connected successfully");
}

export default connectToDB;