"use client";

import { getProfile } from "@/services/user";
import { useEffect, useState } from "react";

// TYPES

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <ProfileSkeleton />;

    return (
        <div className="h-full w-full overflow-y-auto bg-[#f9f9f9]">
            {/* COVER */}
            <div className="w-full h-48 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1600&auto=format&fit=crop"
                    alt="cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* CONTENT */}
            <div className="relative w-full px-6 -mt-24 pb-8 z-10">
                {/* HEADER */}
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-white border flex items-center justify-center text-2xl font-bold shadow">
                            {profile?.first_name?.[0]}
                            {profile?.last_name?.[0]}
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold">
                                {profile?.first_name} {profile?.last_name}
                            </h1>
                            <p className="text-sm text-gray-400">{profile?.role}</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4">{profile?.email}</p>
                </div>

                {/* DETAILS */}
                <div className="bg-white rounded-xl border p-6 mt-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide mb-4">
                        Profile Details
                    </h2>

                    <div className="text-sm text-gray-600 space-y-2">
                        <p>
                            <strong>First Name:</strong> {profile?.first_name}
                        </p>
                        <p>
                            <strong>Last Name:</strong> {profile?.last_name}
                        </p>
                        <p>
                            <strong>Email:</strong> {profile?.email}
                        </p>
                        <p>
                            <strong>Role:</strong> {profile?.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// SKELETON

function ProfileSkeleton() {
  return (
    <div className="h-full w-full bg-[#f9f9f9] animate-pulse">
      <div className="w-full h-48 bg-gray-200" />

      <div className="px-6 -mt-16 space-y-6 pb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="mt-4 h-3 w-64 bg-gray-200 rounded" />
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-3">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-60 bg-gray-200 rounded" />
          <div className="h-3 w-52 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
