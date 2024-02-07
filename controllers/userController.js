const ErrorHandler = require('../utils/errorhandler');
const User = require('../models/userModel');
const sentToken = require('../utils/jwtTokens');
const sendEmail=require('../utils/sendEmail')
const crypto=require('crypto')
const cloudinary = require('cloudinary');


module.exports.registerUser = async function (req, res,next) {
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, { folder: "avatar" });
         const { name, email, password } = req.body;
  
      const user = await User.create({
        name,
        email,
        password,
        avatar: {
          public_id:cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        },
      });
  
      sentToken(user,201,res)


    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
  }


module.exports.loginUser=async(req,res,next)=>{

    const { email ,  password }=req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email/Password",400))
    }

    const user=await User.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid Email/Password",401))
    }

    const isPasswordMatched=user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email/Password",401))
    }
   
    sentToken(user,200,res)
}

module.exports.logout=(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        success:true,
        message:"Logout Out"
    })
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        // console.log("Found user:", user);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

        const message = `Your Password reset tokens: ${resetPasswordUrl} If you have not requested this email, please ignore it.`;

        try {
            await sendEmail({
                email: user.email,
                subject: `Shopkart Password Recovery`,
                message,
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully`
            });
        } catch (err) {
            user.resetPasswordExpire = undefined;
            user.resetPasswordToken = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorHandler(err.message, 500));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

exports.resetPassword=async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
console.log(req.params.token)

    const user=await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}})
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is Invalid/expired", 404));
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password not matched",400))
    }
    console.log(req.body.password,req.body.confirmPassword)
    user.password=req.body.password
    user.resetPasswordExpire = undefined;
            user.resetPasswordToken = undefined;

            await user.save()
            sentToken(user,200,res)
}

exports.getUserDetails=async(req ,res,next)=>{
    const user=await User.findById(req.user.id)
    res.status(200).json({success:true,user})
}


exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = user.comparePassword(req.body.oldPassword);
    
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 401));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400))
    }
    
    user.password = req.body.newPassword;
    await user.save();
    console.log("User after update:", user);

sentToken(user, 200, res);
};


exports.updateProfile=async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email
    }
    console.log(newUserData)
    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,user
    })
    next()
}


//all users(admin)
exports.getAllUsers=async(req,res,next)=>{
    const users =await User.find({}) 
res.status(200).json({
    success:true,users
})
}

//single user(admin)
exports.getSingleUser=async(req,res,next)=>{
    const user=await User.findById(req.params.id) 
    if(!user){
        return next(new ErrorHandler(`User does not exist with id :${req.params.id}`))
    }
res.status(200).json({
    success:true,user
})
}
//update (admin)
exports.updateUserRole=async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
    console.log(req.body)
    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    console.log(user)
    res.status(200).json({
        success:true,user
 
    })
    next()
}
//delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            message:'User Deleted Successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};
