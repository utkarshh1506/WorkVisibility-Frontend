import { api } from "@/lib/api";

export const getCompanyDetails = async () => {
    const res = await api.get("/api/company/");
    return res.data.data;
};

export const addUserToCompany = async (data: {
    company_id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
}) => {
    const res = await api.post("/api/company/create-user", data);
    return res.data.data;
};