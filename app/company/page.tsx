"use client";

import { addUserToCompany, getCompanyDetails } from "@/services/company";
import { useEffect, useMemo, useState } from "react";
import { getProfile } from "@/services/user";


type User = {
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Company = {
  id: number;
  uid: string;
  name: string;
  logo: string | null;
  description: string | null;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone_number: string;
};

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompanyDetails();
        setCompany(data.company);
        setUsers(data.users);
        setCompanyId(data.company.id);

        const profile = await getProfile();
        setCurrentUser(profile.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isManager = currentUser?.role === "MANAGER";

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [query, users]);

  if (loading) return <CompanySkeleton />;

  return (
    <div className="h-full w-full overflow-y-auto bg-[#f9f9f9]">
      {/* COVER */}
      <div className="w-full h-48 bg-gradient-to-r from-gray-200 to-gray-300" />

      {/* CONTENT */}
      <div className="w-full px-6 -mt-16 pb-8">
        {/* HEADER CARD */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4">
            {/* CIRCULAR LOGO */}
            <div className="w-24 h-24 rounded-full bg-white border flex items-center justify-center text-2xl font-bold shadow">
              {company?.name?.[0]}
            </div>

            <div>
              <h1 className="text-2xl font-semibold">{company?.name}</h1>
              <p className="text-sm text-gray-400">UID: {company?.uid}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4 max-w-3xl">
            {company?.description || "No description available"}
          </p>

          {/* CONTACT INLINE */}
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
            <span>
              <strong>Contact:</strong> {company?.contact_person_name}
            </span>
            <span>
              <strong>Email:</strong> {company?.contact_person_email}
            </span>
            <span>
              <strong>Phone:</strong> {company?.contact_person_phone_number}
            </span>
          </div>
        </div>

        {/* PEOPLE SECTION */}
        <div className="bg-white rounded-xl border p-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              People ({filteredUsers.length})
            </h2>

            {/* SEARCH */}
            <div className="flex gap-2">
                 {/* SEARCH */}
                <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="border rounded-lg px-3 py-2 text-sm w-48 outline-none"
                />

                {/* ADD USER BUTTON */}
                {isManager && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-3 py-2 bg-black text-white rounded-lg text-sm"
                  >
                    Add User
                  </button>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.uid}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {u.first_name[0]}
                    {u.last_name[0]}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                  {u.role}
                </span>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <p className="text-sm text-gray-400">No users found</p>
            )}
          </div>
        </div>
      </div>
      {isManager && showModal && (
        <AddUserModal
            onClose={() => setShowModal(false)}
            onSuccess={(newUser: any) => {
                const [first_name = "", last_name = ""] = newUser.name.split(" ");

                const formattedUser = {
                    uid: newUser.user_uid,
                    email: newUser.email,
                    role: newUser.role,
                    first_name,
                    last_name,
                };

                setUsers((prev) => [...prev, formattedUser]);
            setShowModal(false);
            }}

            companyId={companyId}
        />
        )}
    </div>

    
  );
}

// SKELETON

function CompanySkeleton() {
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

          <div className="mt-4 h-3 w-2/3 bg-gray-200 rounded" />

          <div className="mt-4 flex gap-6">
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-48 bg-gray-200 rounded" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                  <div className="h-2 w-40 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onSuccess, companyId }: any) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.first_name || !form.email || !form.password) return;

    try {
      setLoading(true);
      const body = {
        ...form, 
        company_id: companyId, 
      }

      const res = await addUserToCompany(body);

      onSuccess(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Add User</h2>

        <input
          placeholder="First Name"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) =>
            setForm({ ...form, first_name: e.target.value })
          }
        />

        <input
          placeholder="Last Name"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) =>
            setForm({ ...form, last_name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full border px-3 py-2 rounded"
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="MEMBER">Member</option>
          <option value="MANAGER">Manager</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
