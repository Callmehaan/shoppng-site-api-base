const path = require("path");
const express = require("express");
const { setHeaders } = require("./middlewares/headers");

const app = express();

app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json({ limit: "30mb" }));

app.use(setHeaders);

app.use(express.static(path.join(__dirname, "public")));

//* Routers

//! 404 Error handler
app.use((req, res) => {
    console.log("This path not found : ", req.path);

    return res.status(404).status({ message: "404 Error, path not found." });
});

//! Error handler
// app.use(errorHandler);

module.exports = app;
