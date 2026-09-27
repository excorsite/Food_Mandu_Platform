const hx = require("bcryptjs");
const User = require("./models/userModel");
const adminSeeder = async () => {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!email || !plainPassword) return;
  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await hx.hash(plainPassword, saltRounds);

  // Check if admin already exists
  const isAdminExisted = await User.findOne({ email });
  if (!isAdminExisted) {
    // admin data seeding after connection arrives
    await User.create({
      name: "Rustam",
      phone: 9861473532,
      password: hashedPassword,
      email,
      role: "admin",
    });
    console.log("admin seeded successfully");
  } else {
    console.log("admin already exists");
  }
};

// exprot above module
module.exports = adminSeeder;
