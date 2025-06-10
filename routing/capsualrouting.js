const express = require("express");

const router = express.Router();
const {
  genratecapsual,
  getCapsules,
  sendPendingCapsules,
  generateMessage,
} = require("../controller/idcreation.js");
const auth = require("../middelware/auth.js");

router.post("/capsual", auth, genratecapsual);

router.get("/sendpendingcapsules", sendPendingCapsules);
router.post("/ai", generateMessage);
=======
router.get("/send-pending-capsules", sendPendingCapsules);


module.exports = router;
