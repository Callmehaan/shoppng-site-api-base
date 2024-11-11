const redis = require("./../redis");
const bcrypt = require("bcrypt");

/**
 *
 * @param {String} phone generate our default pattern for store phone numbers in redis
 * @returns a String that contains phone number in desired pattern
 */
export function getOtpRedisPattern(phone) {
    return `otp:${phone}`;
}

export async function getOtpDetails(phone) {
    const convertedPhone = getOtpRedisPattern(phone);
    const otp = await redis.get(convertedPhone);

    if (!otp) return { expired: true, remainingTime: 0 };

    const remainingTime = await redis.ttl(convertedPhone); //? seconds
    const remainingTimeMinutes = Math.floor(remainingTime / 60);
    const remainingTimeSeconds = remainingTime % 60;
    const formattedTime = `
        ${remainingTimeMinutes.toString().padStart(2, "0")}
        :${remainingTimeSeconds.toString().padStart(2, "0")}
    `;

    return {
        expired: false,
        remainingTime: formattedTime,
    };
}

export async function generateOtp(phone, length = 4, expireTime = 1) {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digits[Math.rendom() * digits.length];
    }

    //! This is temprary
    otp = "1111";

    const hashedOtp = await bcrypt.hash(otp, 12);

    await redis.set(
        getOtpRedisPattern(phone),
        hashedOtp,
        "EX",
        expireTime * 60
    );

    return otp;
}
