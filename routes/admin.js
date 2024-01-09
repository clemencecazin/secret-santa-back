const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const Admin = require("../models/Admin");

router.post("/admin", async (req, res) => {
    try {
        const { email, password } = req.fields;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            if (email && password) {
                const salt = uid2(64);
                const hash = SHA256(req.fields.password + salt).toString(
                    encBase64
                );
                const token = uid2(64);

                const newUser = new Admin({
                    email,
                    token: token,
                    hash: hash,
                    salt: salt,
                });

                await newUser.save();

                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                });
            } else {
                res.status(400).json({ message: "Missing parameters" });
            }
        } else {
            // If user exist error message
            res.status(400).json({
                message: "This email already has an account",
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.fields;

        const loginAdmin = await Admin.findOne({ email });

        if (loginAdmin) {
            const newHash = SHA256(password + loginAdmin.salt).toString(
                encBase64
            );

            if (newHash === loginAdmin.hash) {
                res.status(200).json({
                    _id: loginAdmin._id,
                    token: loginAdmin.token,
                });
            } else {
                res.status(401).json({
                    message: "Unauthorized",
                });
            }
        } else {
            res.status(401).json({
                message: "Unauthorized",
            }); // if the username is not OK
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
