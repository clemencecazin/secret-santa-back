const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const formidable = require("express-formidable");

app.use(formidable());
app.use(cors());

const santaUser = require("./routes/santaUser");
const admin = require("./routes/admin");

app.use(santaUser);
app.use(admin);

mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

app.get("/", (req, res) => {
    res.json("API Secret Santa");
});

app.all("*", (req, res) => {
    res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
    console.log("Server Started");
});
