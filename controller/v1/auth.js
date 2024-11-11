const {
    errorResponse,
    successResponse,
} = require("../../helpers/responses.js");
const { sendSms } = require("../../services/otp.js");
const authModel = require("./../../models/auth.js");
const banModel = require("./../../models/Ban.js");
const userModel = require("./../../models/User.js");
const {
    getOtpRedisPattern,
    getOtpDetails,
} = require("./../../utils/redisFunctions.js");
const {
    sendOtpValidator,
    otpVerifyValidator,
} = require("./../../validators/auth.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.send = async (req, res, next) => {
    try {
        const { phone } = req.body;

        await sendOtpValidator.validate(req.body, { abortEarly: false });

        const isBan = await banModel.findOne({ phone });

        if (!isBan)
            return errorResponse(
                res,
                403,
                "This phone number has been banned",
                undefined
            );

        const { expired, remainingTime } = await getOtpDetails(phone);

        if (!expired) {
            return successResponse(res, 200, {
                message: `OTP already sent, please try again after ${remainingTime}`,
            });
        }

        const otp = generateOtp(phone);

        await sendSms(phone, otp);

        return successResponse(res, 200, { message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

exports.verify = async (req, res, next) => {
    try {
        const { phone, otp, isSeller } = req.body;

        await otpVerifyValidator.validate(req.body, { abortEarly: false });

        const savedOtp = await redis.get(getOtpRedisPattern(phone));

        if (!savedOtp)
            return errorResponse(res, 400, "Wrong OTP or expired time");

        const isOtpCorrect = await bcrypt.compare(otp, savedOtp);

        if (!isOtpCorrect)
            return errorResponse(res, 400, "Wrong OTP or expired time");

        const existingUser = await userModel.findOne({ phone });

        if (existingUser) {
            const token = jwt.sign(
                { userId: existingUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "30d" }
            );

            return successResponse(res, 200, { user: existingUser, token });
        }

        const isFirstUser = (await userModel.countDocuments()) === 0;

        const user = await userModel.create({
            phone,
            username: phone,
            roles: isFirstUser
                ? ["ADMIN"]
                : isSeller
                ? ["USER", "SELLER"]
                : ["USER"],
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        return successResponse(res, 201, {
            message: "User registered successfully",
            token,
            user,
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {};
