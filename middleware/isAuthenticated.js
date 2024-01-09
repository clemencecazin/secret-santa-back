const Admin = require("../models/Admin");

const isAuthenticated = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.replace("Bearer ", "");

            const admin = await Admin.findOne({ token: token });

            if (admin) {
                req.user = admin;
                return next();
            } else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = isAuthenticated;
