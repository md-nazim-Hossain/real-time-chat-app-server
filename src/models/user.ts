import bcrypt from "bcrypt";
import crypto from "crypto";
import { Schema, model } from "mongoose";
import config from "../config";
import { IUser, IUserMethods, UserModel } from "../interfaces/user.interfaces";
const userSchema = new Schema<IUser, Record<string, unknown>, IUserMethods>(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    avatar: { type: String },
    about: { type: String },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (email: string) => {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    password: { type: String, required: true },
    passwordConfirm: { type: String },
    passwordChangeAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("otp") || !this.otp) return next();
  this.otp = await bcrypt.hash(this.otp.toString(), +config.bycrypt_salt!);
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, +config.bycrypt_salt!);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew || !this.password)
    return next();
  this.passwordChangeAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.isPasswordMatch = async function (
  givenPass: string,
  savePassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPass, savePassword);
};
userSchema.methods.isCorrectOtp = async function (
  canOtp: string,
  userOtp: string
): Promise<boolean> {
  return await bcrypt.compare(canOtp, userOtp);
};

userSchema.methods.isUserExist = async function (
  email: string
): Promise<Pick<
  IUser,
  "_id" | "password" | "email" | "firstName" | "verified"
> | null> {
  const user = await User.findOne(
    { email },
    { _id: 1, password: 1, email: 1, firstName: 1, verified: 1 }
  ).lean();

  return user;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  return JWTTimestamp < this.passwordChangeAt;
};

export const User = model<IUser, UserModel>("User", userSchema);
