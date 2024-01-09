const express = require("express");
const router = express.Router();
const SantaUser = require("../models/SantaUser");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/add/santaUser", isAuthenticated, async (req, res) => {
    try {
        const { firstName, email } = req.fields;
        const user = await SantaUser.findOne({ email });

        if (!user) {
            if (email && firstName) {
                const newUser = new SantaUser({
                    firstName,
                    email,
                });

                await newUser.save();

                res.status(200).json({
                    _id: newUser._id,
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

router.put("/userRestriction/:userId", isAuthenticated, async (req, res) => {
    try {
        const { restriction } = req.fields;

        const santaUser = await SantaUser.findById(req.params.userId);

        if (restriction && !restriction.includes(req.params.userId)) {
            santaUser.userRestriction.push(restriction);

            santaUser.markModified("userRestriction");
        } else {
            console.log("Il manque une valeur");
        }

        await santaUser.save();

        res.status(200).json("restriction added succesfully !");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put("/assignGiftRecipients", async (req, res) => {
    try {
        const users = await SantaUser.find();

        for (let i = 0; i < users.length; i++) {
            const clickedUser = users[i];

            if (!clickedUser.giftFor.user.length) {
                let availableUsers = users.filter(
                    (user) =>
                        user._id.toString() !== clickedUser._id.toString() &&
                        !user.secretSanta.user.id
                );

                if (clickedUser.userRestriction.length) {
                    availableUsers = availableUsers.filter(
                        (user) =>
                            !clickedUser.userRestriction.includes(
                                user._id.toString()
                            )
                    );
                }

                const randomIndex = Math.floor(
                    Math.random() * availableUsers.length
                );

                const giftRecipient = availableUsers[randomIndex];

                users[i].giftFor.user = {
                    id: giftRecipient._id,
                    firstName: giftRecipient.firstName,
                };

                availableUsers[randomIndex].secretSanta.user = {
                    id: clickedUser._id,
                    firstName: clickedUser.firstName,
                };
            }
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
