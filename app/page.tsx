"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { login, registerUser } from "@/services/auth";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  registerSchema,
  LoginValues,
  RegisterValues,
} from "@/lib/validations/auth";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: LoginValues | RegisterValues) => {
    setError("");

    try {
      let res;

      if (isLogin) {
        res = await login(data as LoginValues);
      } else {
        const { confirmPassword, ...payload } = data as RegisterValues;
        res = await registerUser(payload);
      }

      if (!res.success) {
        setError(res.message);
        return;
      }

      if (!isLogin) {
        setIsLogin(true);
        reset();
        setError("Account created. Please sign in.");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass =
  "w-full pt-2 pb-2 bg-transparent border-b border-[#c6c6c6] text-[16px] outline-none transition focus:border-black placeholder:text-[#a3a3a3] placeholder:font-light";

const labelClass = "text-[12px] font-semibold text-gray-500";

const sectionGap = "space-y-6";

return (
  <div className="min-h-screen bg-white text-black flex flex-col px-18 py-4">
    {/* Navbar */}
    <header className="flex items-center justify-between py-6">
      <h1 className="text-[35px] font-semibold tracking-wide">
        WorkVisibility
      </h1>

      <div className="flex gap-6 text-[18px]">
        <button
          onClick={() => setIsLogin(true)}
          className={`${isLogin ? "border-b-2 border-black" : ""}`}
        >
          SIGN IN
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`${!isLogin ? "border-b-2 border-black" : ""}`}
        >
          REGISTER
        </button>
      </div>
    </header>

    {/* Main */}
    <main className="flex flex-1 gap-16 px-24">
      {/* Left */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        <h1 className="text-[90px] font-black leading-[0.95] tracking-[-0.05em] max-w-[600px]">
          Organize <br /> Your Flow
        </h1>

        <p className="text-[20px] font-light text-gray-600 max-w-md">
          The spatial environment for architectural task management.
        </p>

        <div className="w-full max-w-xl h-[300px] bg-gray-200 rounded-2xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1505691938895-1758d7feb511"
            alt="preview"
            width={800}
            height={400}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Card */}
      <div className="w-[380px] flex items-center">
        <Card className="w-full rounded-2xl shadow-md">
          <CardContent className="p-12 space-y-6">
            <h2 className="text-center text-[20px] font-bold tracking-widest">
              {isLogin ? "SIGN IN" : "START BUILDING"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className={sectionGap}>
              
              {/* REGISTER FIELDS */}
              {!isLogin && (
                <>
                  <div>
                    <label className={labelClass}>COMPANY NAME</label>
                    <input {...register("company_name")} className={inputClass} />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>FIRST NAME</label>
                      <input {...register("first_name")} className={inputClass} />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>LAST NAME</label>
                      <input {...register("last_name")} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>PHONE</label>
                    <input {...register("phone_number")} className={inputClass} />
                  </div>
                </>
              )}

              {/* EMAIL */}
              <div>
                <label className={labelClass}>EMAIL</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={inputClass}
                />
                {typeof errors.email?.message === "string" && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className={labelClass}>PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={inputClass}
                />
                {typeof errors.password?.message === "string" && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              {!isLogin && (
                <div>
                  <label className={labelClass}>CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className={inputClass}
                  />
                  {typeof errors.confirmPassword?.message === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-[14px] font-bold py-6"
              >
                {isSubmitting
                  ? "PLEASE WAIT..."
                  : isLogin
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
              </Button>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="block w-full text-center text-sm underline"
            >
              {isLogin
                ? "Create an account"
                : "Sign In to Workspace"}
            </button>
          </CardContent>
        </Card>
      </div>
    </main>

    {/* Footer */}
    <footer className="flex justify-between py-6 text-xs text-gray-500">
      <span>© 2026 WORKVISIBILITY AUTHORITY. ALL RIGHTS RESERVED.</span>
    </footer>
  </div>
);
}