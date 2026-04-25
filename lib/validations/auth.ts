import { z } from "zod";

const baseSchema = {
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
};

export const loginSchema = z.object(baseSchema);

export const registerSchema = z
  .object({
    ...baseSchema,
    company_name: z.string().min(2, "Company name required"),
    first_name: z.string().min(2, "First name required"),
    last_name: z.string().min(2, "Last name required"),
    phone_number: z.string().min(10, "Invalid phone"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;