// Run with: node server/utils/seed.js
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");
const User = require("../models/User");
const Coupon = require("../models/Coupon");

const run = async () => {
  await connectDB();

  const adminEmail = "admin@nexorastore.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: "Store Admin", email: adminEmail, password: "admin123", role: "admin" });
    console.log(`Admin created — email: ${adminEmail} / password: admin123`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const coupons = [
    { code: "WELCOME10", type: "percent", value: 10 },
    { code: "SAVE20", type: "flat", value: 20 },
  ];
  for (const c of coupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true });
  }
  console.log("Sample coupons seeded: WELCOME10, SAVE20");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
