const express = require("express");
const router = express.Router();
const {
  genratecapsual,
  sendPendingCapsules,
} = require("../controller/idcreation.js");
const auth = require("../middelware/auth.js");

router.post("/capsual", auth, genratecapsual);
router.get("/send-pending-capsules", auth, sendPendingCapsules);

module.exports = router;
