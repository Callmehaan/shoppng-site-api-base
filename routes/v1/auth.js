const express = require("express");
const { send, verify, getMe } = require("../../controller/v1/auth.js");

const router = express.Router();

router.post("/send", send);

router.post("/verify", verify);

router.get("/me", getMe);

module.exports = router;
