const express = require("express");
const router = express.Router();
const { genratecapsual } = require("../controller/idcreation.js");
const auth = require("../middelware/auth.js");

router.post("/capsual", auth, genratecapsual);

module.exports = router;
