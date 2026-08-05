const Newsletter = require("../models/Newsletter.js");

// @route POST /api/newsletter
const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!/^\S+@\S+\.\S+$/.test(email || "")) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { email: email.toLowerCase() }, { upsert: true });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe };
