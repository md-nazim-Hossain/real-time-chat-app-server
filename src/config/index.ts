import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5001,
  db_url: process.env.DATABASE_URL,
  student_pass: process.env.DEFAULT_STUDENT_PASSWORD,
  faculty_pass: process.env.DEFAULT_FACULTY_PASSWORD,
  admin_pass: process.env.DEFAULT_ADMIN_PASSWORD,
  bycrypt_salt: process.env.BYCRYPT_SLAT,
  mailKey: process.env.SENDGRID_API_KEY as string,
  site_url: process.env.SITE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    secret_expire_in: process.env.JWT_EXPIRE_IN,
    refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
    refresh: process.env.JWT_REFRESH_SECRET,
  },
  email: {
    apiKey: process.env.ELASTIC_EMAIL_API_KEY as string,
  },
};
