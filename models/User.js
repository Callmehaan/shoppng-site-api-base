const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    address: {
        type: String,
        required: true,
    },
    cityId: {
        type: Number,
        requried: true,
    },
});

const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        roles: {
            type: [String],
            enum: ["ADMIN", "USER", "SELLER"],
            default: "USER",
        },
        addresses: [addressSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
