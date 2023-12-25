import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import optGenerator from "otp-generator";
import config from "../config";
import { jwtTokenHelpers } from "../helpers/jwtHelpers";
import { User } from "../models/user";
import { mailService } from "../services/mailer";
import ApiError from "../shared/ApiError";
import catchAsync from "../shared/catchAsync";
import filterObj from "../shared/filterObj";
import sendResponse from "../shared/sendResponse";

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide email and password"
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid email or password");
  }

  const token = jwtTokenHelpers.createToken(
    {
      _id: user._id,
      email: user.email,
    },
    config.jwt.secret!,
    config.jwt.secret_expire_in!
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(httpStatus.OK).cookie("accessToken", token, options).json({
    success: true,
    message: "Login successful",
    data: user._id.toString(),
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized User");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(httpStatus.OK).clearCookie("accessToken", options).json({
    success: true,
    message: "Logout successfully",
    data: null,
  });
});

const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;
    const filterBody = filterObj(
      req.body,
      "firstName",
      "lastName",
      "email",
      "password"
    );
    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Please provide first name, last name, email and password"
      );
    }
    const user = new User();
    const isUserExit = await user.isUserExist(email);
    if (isUserExit && isUserExit.verified) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Email already in use, Please login."
      );
    } else if (isUserExit) {
      delete filterBody.password;
      await User.findOneAndUpdate({ email }, filterBody, {
        new: true,
        validateModifiedOnly: true,
      });
      req.userId = isUserExit._id;
      next();
    } else {
      const new_user = await User.create(filterBody);
      req.userId = new_user._id;
      next();
    }
  }
);

const sentOtp = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req;
  const newOtp = optGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const expiredTime = Date.now() + 10 * 60 * 1000;
  const user = await User.findByIdAndUpdate(userId, {
    otpExpiredAt: expiredTime,
  });

  if (!user) {
    return sendResponse<any>(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "User not found",
    });
  }

  user.otp = newOtp.toString();
  await user.save({ validateModifiedOnly: true });

  await mailService.sendMail({
    to: user.email,
    subject: "Verification OTP",
    text: `Your OTP is ${newOtp}. Its expires in 10 minutes`,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully ? Check your email",
    data: newOtp,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide email and otp");
  }
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User with this email does not exist"
    );
  }
  if (new Date(user?.otpExpiredAt!).getTime() < Date.now()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP is expired");
  }
  if (user.verified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
  }
  if (!(await user.isCorrectOtp(otp, String(user.otp)))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
  user.verified = true;
  user.otp = undefined;
  user.otpExpiredAt = undefined;

  await user.save({ validateModifiedOnly: true });

  const token = jwtTokenHelpers.createToken(
    {
      _id: user._id,
      email: user.email,
    },
    config.jwt.secret!,
    config.jwt.secret_expire_in!
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(httpStatus.OK).cookie("accessToken", token, options).json({
    success: true,
    message: "Login successful",
    data: user._id.toString(),
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide email address");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User not found, please try again with valid email"
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetUrl = `${config.site_url}/auth/reset-password?code=${resetToken}`;
    await mailService.sendMail({
      to: email,
      subject: "Password reset",
      html: `<div>
      <h3 style="font-weight: bold">Hey ${
        user.firstName + " " + user.lastName
      },</h3>
      \n
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/>
      Please click on the following link, or paste this into your browser to complete the process:<p>
      <strong>Token are expiring in 10 minutes</strong><br/>
      <a href="${resetUrl}" target="_blank">Click here</a>\n
      <p>If you did not request this, please ignore this email and your password will remain unchanged.\n</p></div>`,
    });
    sendResponse<{ resetUrl: string }>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reset password link sent successfully",
      data: {
        resetUrl,
      },
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Sending reset password link failed, try again later"
    );
  }
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide token");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token is invalid or has expired");
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const jwtToken = jwtTokenHelpers.createToken(
    {
      _id: user._id,
      email: user.email,
    },
    config.jwt.secret!,
    config.jwt.secret_expire_in!
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(httpStatus.OK)
    .cookie("accessToken", jwtToken, options)
    .json({
      success: true,
      message: "Password Reset Successfully",
      data: null,
    });
});

export const authController = {
  login,
  logout,
  register,
  sentOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
