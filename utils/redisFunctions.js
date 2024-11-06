const redis = require("./../redis");

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
