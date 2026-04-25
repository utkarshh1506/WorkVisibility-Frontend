import { api } from "@/lib/api";

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/api/user/login", data);
  return res.data;
};

export const registerUser = async (data: {
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}) => {
  const res = await api.post("/api/company/register", data);
  return res.data;
};