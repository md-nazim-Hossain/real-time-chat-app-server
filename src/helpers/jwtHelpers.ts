import jwt, { Secret } from "jsonwebtoken";
import { IUser } from "../interfaces/user.interfaces";

const createToken = (
  payload: Pick<IUser, "_id" | "email">,
  secret: Secret,
  expiredTime: string
): string => {
  return jwt.sign(
    {
      _id: payload._id,
      email: payload.email,
    },
    secret,
    {
      expiresIn: expiredTime,
    }
  );
};

const verifyToken = (token: string, secret: Secret): jwt.JwtPayload => {
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

export const jwtTokenHelpers = {
  createToken,
  verifyToken,
};
