import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

// This function will handle user registration. It will take the username, email, and password from the request body, check if a user with the same email or username already exists, and if not, it will create a new user in the database. After creating the user, it will generate an email verification token and send a verification email to the user's email address. Finally, it will send a response back to the client indicating whether the registration was successful or not.
export async function register(req, res) {
    const {username,email,password} = req.body;
    
    const isUserExist = await userModel.findOne({
        $or:[{email:email},{username:username}]
    })

    if(isUserExist){
        return res.status(400).json({
            message:"User with this credential already exist",
            success:false,
            err:"User with this credential already exist"
        });
    }

    const user = await userModel.create({
        username,
        email,
        password
    });

    const emailVerificationToken = jwt.sign({email:user.email
    }, process.env.JWT_SECRET);

    await sendEmail({
        to:email,
        subject:"Welcome to BennyAI!",
        html:`<h1>Welcome to BennyAI, ${username}!</h1><p>Thank you for registering with us. We're excited to have you on board!</p>
        <p>To verify your email, please click the link below:</p>
        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>`,
        text:`Welcome to BennyAI, ${username}! Thank you for registering with us. We're excited to have you on board!`
    });

    res.status(201).json({
        message:"User registered successfully",
        success:true,   
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    });

}

// This function will handle user login. It will take the email and password from the request body, check if a user with the provided email exists, and if so, it will compare the provided password with the stored hashed password. If the passwords match and the user's email is verified, it will generate a JWT token for session management and send a response back to the client indicating that the login was successful along with the user's information. If any of these checks fail, it will send an appropriate error response back to the client.
export async function login(req,res){
    const {email,password} = req.body;

    const user = await userModel.findOne({email:email});

    if(!user){
        return res.status(400).json({
            message:"User with this email does not exist",
            success:false,
            err:"User with this email does not exist"
        });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        return res.status(400).json({
            message:"Invalid password",
            success:false,
            err:"Invalid password"
        });
    }

    if(!user.verified){
        return res.status(400).json({
            message:"Please verify your email before logging in",
            success:false,
            err:"Please verify your email before logging in"
        });
    }

    const token = jwt.sign({
        id:user._id,
        email:user.email
    }, process.env.JWT_SECRET, {expiresIn:"7d"});

    res.cookie("token",token);

    res.status(200).json({
        message:"User logged in successfully",
        success:true,
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    });

}


// This function will handle email verification. It will take the token from the query parameters, verify it, and then update the user's verified status in the database. Finally, it will send a response back to the client indicating whether the email verification was successful or not.
export async function verifyEmail(req,res){
    const {token} = req.query;

    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({email:decoded.email});

    if(!user){
        return res.status(400).json({
            message:"Invalid token",
            success:false,
            err:"Invalid token"
        });
    }
    user.verified = true;

    await user.save();

    const html = 
    `
    <h1>Email Verified Successfully!</h1>
    <p>Your email has been verified successfully. You can now log in to your account and start using our services.</p>
    <p>Thank you for joining us!</p>
    `;

    return res.send(html);
    } catch (error) {
        return res.status(400).json({
            message:"Invalid token",
            success:false,
            err:"Invalid token"
        });
    }

}