const mongoose = require("mongoose");

// Define the user schema with database fields as phone, name, and email
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is required"] },
    phone: { type: String, required: [true, "number is required"] },
    password: { type: String, required: [true, "password is required"] },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "seller"],
      required: [true, "role is required"],
      default: "customer",
    },
    otp: { type: Number },
    otpExpiresAt: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
    // appending the cart functionality with product reference
    // thsi will borrow instance of product collection withg stock being the number of product we will populate right after user adds product inside their cart
    cart: [
      {
        quantity: { type: Number, required: true, min: 1 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpiresAt;
        delete ret.isOtpVerified;
        return ret;
      },
    },
  },
);

// create model named User which is in side param assigns it the model we created above
// and assigns it to User variable
const User = mongoose.model("User", userSchema);

// Export the User model
module.exports = User;
