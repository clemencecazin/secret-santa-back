const express = require("express");
const router = express.Router();
const SantaUser = require("../models/SantaUser");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/usersList", isAuthenticated, async (req, res) => {
    try {
        const usersList = await SantaUser.find();

        res.json(usersList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put("/add/santaUser", isAuthenticated, async (req, res) => {
    try {
        console.log(req.fields);
        const users = req.fields.usersList;
        let updatedUsers = [];

        for (const user of users) {
            if (!user._id) {
                const newUser = new SantaUser({
                    firstName: user.firstName,
                    email: user.email,
                });

                await newUser.save();

                updatedUsers = [...updatedUsers, newUser];
            } else {
                const existingUser = await SantaUser.findById(user._id);

                if (
                    existingUser.email !== user.email ||
                    existingUser.firstName !== user.firstName
                ) {
                    existingUser.firstName = user.firstName;
                    existingUser.email = user.email;
                    await existingUser.save();

                    updatedUsers = [...updatedUsers, existingUser];
                }
            }
        }

        return res.status(200).json(updatedUsers);
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
