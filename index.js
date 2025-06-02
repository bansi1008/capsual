// index.js
require("dotenv").config();
const express = require("express");
const pool = require("./db.js");
const feedRoutes = require("./routing/userrouting.js");
const capsualRoutes = require("./routing/capsualrouting.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing JSON request bodies

app.use("/v1", feedRoutes);
app.use("/v1", capsualRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
