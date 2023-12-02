const userModel = require("../Models/userModel");
const sessionModel = require("../Models/sessionModel");
const securityModel = require("../Models/securityModel");


require('dotenv').config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");

const userController = {
    register: async (req, res) => {
        try {
            //get the data from the request body
            //not sure about the profile
            const { email, password, profile } = req.body;

            //check if the user already exists
            const existingUser = await userModel.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            //hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            //create a new user
            const newUser = new userModel({
                email,
                password: hashedPassword,
                profile,
            });
            //save the user to the database
            await newUser.save();
            //send a success message
            res.status(201).json({ message: "User registered successfully" });
            
        } catch (error) {
            console.error("Error in userController.register: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
    login : async (req, res) => {
        try {
            const {email, password} = req.body;
            //find the user by email
            const user = await userModel.findOne({email: email});
            //if user not found
            if(!user){
                return res.status(400).json({message: "Invalid credentials"});
            }
            //compare the password
            const isMatch = await bcrypt.compare(password, user.password);
            //if password not match
            if(!isMatch){
                return res.status(400).json({message: "Invalid credentials"});
            }
            const session = await sessionModel.findOne({userID: user._id});
            console.log("session|| "+ session)
            let n;
            if(session){
                n = await sessionModel.findByIdAndDelete(session._id)
            }
            console.log("n|| "+ n)
            //generate the access token
            const currentDateTime = new Date();
            const expirationDateTime = new Date(+currentDateTime +1800000); //expires in 30 minutes
            const accessToken = jwt.sign({
                user: {userId: user._id, role: user.role}},
                secretKey,
                {
                    expiresIn: 3*60*60,
                }
            );
            let timeStamps = {
                createdAt: currentDateTime,
                expiredAt: expirationDateTime
            }
            let newSession = new sessionModel({
                userID: user._id,
                token: accessToken,
                timeStamps: timeStamps,
            });
            await newSession.save();
            return res
            .cookie ("accessToken", accessToken,{
                expirationDateTime: expirationDateTime,
                withCredentials: true,
                httpOnly: true,
                sameSite: "none",  //should be none for cross origin
            })
            .status(200)
            .json({message: "User logged in successfully",user: user});
        } catch (error) {
            console.error("Error in userController.login: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
    
    logout: async (req, res) => {
        try {
            const accessToken = req.cookies.accessToken;
            const session = await sessionModel.findOne({token: accessToken});
    
            if (session) {
                await sessionModel.deleteOne({token: accessToken});
                return res
                .clearCookie("accessToken")
                .status(200)
                .json({message: "User logged out successfully"});
            } else {
                return res.status(400).json({message: "User is already logged out"});
            }
        } catch (error) {
            console.error("Error in userController.logout: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
    // Create new User
    createUser: async (req, res) => {
		try {
			// Extract user data from the request body
			const {email, password, role, profile } = req.body;

			// Create a new user
			const newUser = new userModel({
				email,
				password,
				role,
				profile,
			});
         

			// Save the user to the database
			await newUser.save();

			res
				.status(201)
				.json({ message: "User created successfully", user: newUser });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "server error" });
		}
	},
	// Route to assign a role to a user, accessible only to admins
	assignRole: async (req, res) => {
		try {
			const { email, newRole } = req.body;
			// Find the user by user ID
			const user = await userModel.findone(email);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Update the user's role
			user.role = newRole;
			await user.save();

			res.status(200).json({ message: "Role assigned successfully", user });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "server error" });
		}
	},
	//Admin getting all users
	getAllUsers: async (req, res) => {
		try {
			//getting all users and outputting them
			const allUsers = await User.find();
			res.status(200).json({ users: allUsers });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "server error" });
		}
	},
	// Route to update user profile, accessible to all authenticated users
	updateProfile: async (req, res) => {
		try {
			// Extract user data from the request body
			const { firstName, lastName, email } = req.body;
			// const user = await User.findById(userId);
			// Update the user's profile
			req.user.profile.firstName = firstName;
			req.user.profile.lastName = lastName;
			req.user.profile.email = email;

			//user.profile.firstName = firstName;
			//user.profile.lastName = lastName;
			//user.profile.email = email;
			// Save the updated user to the database
			await req.user.save();
			//await user.save();
			res
				.status(200)
				.json({ message: "Profile updated successfully", user: req.user });
			//res.status(200).json({ message: 'Profile updated successfully', user: user });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "server error" });
		}
	},
	// Route to get user profile, accessible to all authenticated users
	getProfile: async (req, res) => {
		//const user = await User.findById(userId);
		//   res.status(200).json({ users: user});
		res.status(200).json({ user: req.user });
	},
};
module.exports = userController;


                
            

