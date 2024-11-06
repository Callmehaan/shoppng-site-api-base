const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

const isProductionMode = process.env.NODE_ENV === "production";
if (!isProductionMode) {
    dotenv.config();
}

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected : ${mongoose.connection.host}`);
    } catch (err) {
        console.error("Error in mongoose connection : ", err);
        process.exit(1);
    }
}

async function startServer() {
    const port = +process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(
            `Server Is Running In ${
                isProductionMode ? "production" : "development"
            } Mode On Port ${port}`
        );
    });
}

async function run() {
    await connectToDB();
    await startServer();
}

run();
