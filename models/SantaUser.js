const mongoose = require("mongoose");

const SantaUser = mongoose.model("SantaUser", {
    firstName: { type: String, required: true },
    email: {
        unique: true,
        type: String,
        required: true,
    },
    giftFor: {
        user: {
            id: mongoose.Schema.Types.ObjectId,
            firstName: String,
        },
        messages: [String],
    },
    secretSanta: {
        user: {
            id: mongoose.Schema.Types.ObjectId,
            firstName: String,
        },
        messages: [String],
    },
    userRestriction: {
        type: Array,
    },
});

module.exports = SantaUser;
