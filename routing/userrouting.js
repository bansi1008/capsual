const express = require("express");
const app = express();
const pool = require("../db.js");
const router = express.Router();
const { signup, login } = require("../controller/usercontroller.js");

router.post("/login", login);

router.post("/signup", signup);

module.exports = router;
