const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");


const User = require("../database/model/User");
const ResetPasswordLink = require("../database/model/ResetPasswordLink");
const sendLink = require("../utils/mail");



dotenv.config();

const router = express.Router();

/**
 * @desc Create a new User
 * @route POST users/register-user
 * @access Public
 */
router.post("/register-user", async (req, res) => {
  try {
    // Request Body Contents
    const { email,username,password } = req.body;

    // User Already Exists
    if (await User.findOne({ email }) || await User.findOne({username})) {
      return res.status(400).json({ success: false, msg: "User already exists" });
    }

    // Password Encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = new User({
      email,username,password:hashedPassword
    });

    // Save in Database
    user.save();

    // AuthToken
    let data = {
      user: {
        id: user.id,
      },
    };

    const authtoken = await jwt.sign(data, process.env.SECRET_TOKEN);

    // Response
    return res.status(200).json({
        success: true,
        authtoken, 
        userInfo: {
            email,
            username
        }
    });
  } catch (e) {
    return res.status(500).json({success:false, message: e.message });
  }
});

/**
 * @desc Login User
 * @route POST users/login
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    // Request Body Contents
    const { username, password } = req.body;

    // Fetch User from Database
    const user = await User.findOne({ username });

    // User Does not Exists
    if (!user) {
      return res.json({ success: false, msg: "Invalid Credentials" });
    }


    // Hashed Password Check
    const comparepassword = await bcrypt.compare(password, user.password);

    // Password Does not match
    if (!comparepassword) {
      return res.json({ success: false, error: "Invalid Credentials" });
    }

    // AuthToken
    let data = {
      user: {
        id: user.id,
      },
    };

    const authtoken = await jwt.sign(data, process.env.SECRET_TOKEN);

    // Response
    const userInfo = {
      email:user.email,
        username
    }

    return res.status(200).json({
      success: true, authtoken, userInfo
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

/**
 * @desc Forgot Password
 * @route GET users/forgot-password
 * @access Public
 */
router.get("/forgot-password/",async(req,res)=>{
    try {
        // Request Body Contents
        const {email} = req.body;

        // Find the User to check whether user exists
        const user = await User.findOne({email});

        if(!user){
            return res.json({success:false,msg:"User Does not Exists"});
        }

        // Create a reset Link
        const resetlink = await ResetPasswordLink.create({
            userID:user.id,
        });

        await resetlink.save();

        // Send a mail to user
        await sendLink(email,resetlink.id);
        
        // Send the response
        res.status(200).json({success:true})
    } catch (error) {
        return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
})

/**
 * @desc Reset Password
 * @route GET users/reset-password/:id
 * @access Public
 */
router.put("/reset-password/:id",async(req,res)=>{
    try {
        // Get ResetPasswordLink's id
        const {id} = req.params;

        // Request Body contents
        const {password} = req.body;

        // Check whether the link is valid
        const resetlink = await ResetPasswordLink.findById(id);

        if(!resetlink){
            return res.json({success:false,msg:"Link is not valid"});
        }

        // Hash the Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update User
        let user = await User.findByIdAndUpdate(resetlink.userID,hashedPassword);
        user.save();

        // Delete the resetlink record from database
        await ResetPasswordLink.findByIdAndDelete(id);

        // Response
        res.status(200).json({success:true});
    } catch (error) {
        return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
})

module.exports = router;
