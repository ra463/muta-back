const User = require("../models/User");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { getDataUri } = require("../utils/dataUri");
const cloudinary = require("cloudinary");
const { oauth2Client } = require("../utils/googleConfig");
const axios = require("axios");
const dotenv = require("dotenv");
const { generateCode } = require("../utils/generateCode");
const { resetPasswordCode } = require("../utils/sendEmail");

dotenv.config({ path: "../config/config.env" });

const isStrongPassword = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numericRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

  if (
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    numericRegex.test(password) &&
    specialCharRegex.test(password)
  ) {
    return true;
  } else {
    return false;
  }
};

const sendData = async (res, statusCode, user, message) => {
  const token = await user.getToken();
  res.status(statusCode).json({
    success: true,
    user,
    token,
    message,
  });
};

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return next(new ErrorHandler("Please Enter all the fields", 400));
  }

  if (password !== confirmPassword)
    return next(new ErrorHandler("Confirm Password does not match", 400));

  const user_exist = await User.findOne({ email: email.toLowerCase() });
  if (user_exist) return next(new ErrorHandler(`Email already exists`, 400));

  if (!isStrongPassword(password)) {
    return next(
      new ErrorHandler(
        "Password must contain one Uppercase, Lowercase, Numeric and Special Character",
        400
      )
    );
  }

  const file = req.file;

  let secure_url = null;
  let public_id = null;

  if (file) {
    const fileUri = await getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "mutaengine",
    });

    secure_url = myCloud.secure_url;
    public_id = myCloud.public_id;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    avatar: {
      public_id: public_id,
      url: secure_url,
    },
  });

  sendData(res, 201, user, "User Registered Successfully");
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password, value } = req.body;

  // const v2 = await axios.post(
  //  `https://www.google.com/recaptcha/api/siteverify/secret=${process.env.GOOGLE_SECRET_KEY}&response=${value}`
  //);

 // if (!v2.data.success) {
   // return next(new ErrorHandler("Invalid Captcha", 400));
 // }

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) return next(new ErrorHandler("Invalid Credentials", 401));

  if (user.is_frozen) {
    const last_attempt = user.last_attempt.getTime();
    const current = Date.now();
    if (current - last_attempt > parseInt(process.env.FROZEN_TIME)) {
      user.is_frozen = false;
      user.attempts = 0;
      user.last_attempt = null;
      await user.save();
    } else {
      return next(
        new ErrorHandler(
          "Your Account is temporary freeze due to too many unsuccessfull attempt, try after 5 minutes",
          423
        )
      );
    }
  }

  const isPasswordMatched = await user.matchPassword(password);

  if (!isPasswordMatched) {
    user.attempts += 1;
    await user.save();
    if (user.attempts === parseInt(process.env.MAX_UNSUCCESSFULL_ATTEMPT)) {
      user.is_frozen = true;
      user.last_attempt = new Date();
      await user.save();
      return next(
        new ErrorHandler(
          "Too many unsuccessfull attempt, try again after 5 minutes",
          423
        )
      );
    }
    return next(new ErrorHandler("Invalid Credentials", 401));
  }

  // set unsuccessfull attempts to 0 as user login successfully
  if (user.attempts) {
    user.attempts = 0;
    await user.save();
  }

  sendData(res, 200, user, "User Logged In Successfully");
});

exports.googleLogin = catchAsyncError(async (req, res, next) => {
  const { google_code } = req.query;

  const goodleAuth = await oauth2Client.getToken(google_code);
  oauth2Client.setCredentials(goodleAuth.tokens);

  const userAuth = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${goodleAuth.tokens.access_token}`
  );

  const { email, name, picture } = userAuth.data;

  const user = await User.findOne({ email });
  if (user) {
    if (user.is_frozen) {
      const last_attempt = user.last_attempt.getTime();
      const current = Date.now();
      if (current - last_attempt > parseInt(process.env.FROZEN_TIME)) {
        user.is_frozen = false;
        user.attempts = 0;
        user.last_attempt = null;
        await user.save();
      } else {
        return next(
          new ErrorHandler(
            "Your Account is temporary freeze due to too many unsuccessfull attempt, try after 5 minutes",
            423
          )
        );
      }
    }

    // set unsuccessfull attempts to 0 as user login successfully
    if (user.attempts) {
      user.attempts = 0;
      await user.save();
    }

    sendData(res, 200, user, "User Logged In Successfully");
  } else {
    const randomPassword = Math.random().toString(36).slice(-8);
    const newUser = await User.create({
      name,
      email,
      password: randomPassword,
      avatar: {
        public_id: "google_id",
        url: picture,
      },
    });
    sendData(res, 200, newUser, "User Logged In Successfully");
  }
});

exports.sendForgotPasswordCode = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please enter your email", 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  const code = generateCode(5);

  user.temp_code = code;
  await user.save();
  await resetPasswordCode(user.email, user.name, code);

  res.status(200).json({
    success: true,
    message: "Password Reset Code sent successfully",
  });
});

exports.validateCode = catchAsyncError(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) return next(new ErrorHandler("Code is required", 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  if (user.temp_code !== code)
    return next(new ErrorHandler("Invalid/Expired Code", 400));

  user.temp_code = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Code Validated successfully",
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  if (password !== confirmPassword)
    return next(new ErrorHandler("Password does not match", 400));

  user.password = password;
  user.temp_code = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Reset Successfully",
  });
});
