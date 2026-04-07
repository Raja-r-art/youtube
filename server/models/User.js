const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    channelName: { type: String, unique: true, sparse: true },
    channelBanner: { type: String, default: "" },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    googleId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual("subscriberCount").get(function () {
  return this.subscribers.length;
});

module.exports = mongoose.model("User", userSchema);
