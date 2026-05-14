import * as yup from "yup";

import { globalConfig } from "@/config";

export interface ILoginForm {
  email: string;
  password: string;
}

export const DEFAULT_LOGIN_FORM: ILoginForm = {
  email: globalConfig.MOCK_EMAIL ?? "user@gmail.com",
  password: globalConfig.MOCK_PASSWORD ?? "123456",
};

export const loginSchema: yup.ObjectSchema<ILoginForm> = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});
