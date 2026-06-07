import  {Router} from 'express';
import { register,login } from "../controllers/auth.controller.js";
import { registerValidator,loginValidator } from "../validators/auth.validators.js";
import { verifyEmail } from "../controllers/auth.controller.js";
const authRouter = Router();


// Register route
//  This route will handle user registration. It will validate the input data and then call the register controller function to create a new user.
authRouter.post("/register", registerValidator, register);


// Login route
// This route will handle user login. It will validate the input data and then call the login controller function to authenticate the user and generate a JWT token for session management.
authRouter.post("/login",loginValidator,login);

// Email verification route
// This route will handle email verification. It will take the token from the query parameters and call the verifyEmail controller function to verify the user's email address. The token will be generated during the registration process and sent to the user's email address. When the user clicks on the verification link, this route will be triggered to verify the token and update the user's verified status in the database.    
authRouter.get("/verify-email",verifyEmail);

export default authRouter;