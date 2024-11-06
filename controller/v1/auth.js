const {
    errorResponse,
    successResponse,
} = require("../../helpers/responses.js");
const authModel = require("./../../models/auth.js");
const banModel = require("./../../models/Ban.js");
const {
    getOtpRedisPattern,
    getOtpDetails,
} = require("./../../utils/redisFunctions.js");

exports.send = async (req, res, next) => {
    try {
        const { phone } = req.body;

        const isBan = await banModel.findOne({ phone });

        if (!isBan)
            return errorResponse(
                res,
                403,
                "This phone number has been banned",
                undefined
            );

        //TODO Validation

        const { expired, remainingTime } = await getOtpDetails(phone);

        if (!expired) {
            return successResponse(res, 200, {
                message: `OTP already sent, please try again after ${remainingTime}`,
            });
        }
    } catch (err) {
        next(err);
    }
};

exports.verify = async (req, res, next) => {};

exports.getMe = async (req, res, next) => {};