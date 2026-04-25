import {api} from "@/lib/api";

export const getProfile = async () => {
  const res = await api.get("/api/user/profile");
  return res.data;
};
