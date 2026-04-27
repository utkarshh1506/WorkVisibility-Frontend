"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/user";
import { useRouter } from "next/navigation";
import { getCompanyDetails } from "@/services/company";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

function NavbarProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-300 rounded-full" />
      <div className="h-3 w-20 bg-gray-300 rounded" />
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.data);

        const companyRes  =  await getCompanyDetails();
        setCompany(companyRes.company);
      } catch (err) {
        console.error("Profile fetch failed", err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    router.push("/");
  };

  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-16">
      
      {/* Brand */}
      <div className="text-xl font-semibold text-gray-800">
        {loading ? (
            <CompanyNameSkeleton />
        ) : (
            company?.name || "WorkVisibility"
        )}
     </div>

      {/* Profile Section */}
      <div className="relative">
        
        {loading ? (
          <NavbarProfileSkeleton />
        ) : (
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
              {user?.first_name?.charAt(0) || "U"}
            </div>

            {/* Name */}
            <span className="text-gray-700 font-medium">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
        )}

        {/* Dropdown */}
        {!loading && open && (
          <div className="absolute right-0 mt-2 w-44 bg-white shadow-md rounded-lg p-2 z-50">
            
            <div className="px-3 py-2 text-sm text-gray-500 border-b">
              {user?.email}
            </div>

            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>

            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-500"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

function CompanyNameSkeleton() {
  return (
    <div className="h-5 w-40 bg-gray-300 rounded animate-pulse" />
  );
}