"use client";

import { getCompanyDetails } from "@/services/company";
import { createTask } from "@/services/task";
import { getProfile } from "@/services/user";
import { useEffect, useState } from "react";

type User = {
  uid: string;
  first_name: string;
  last_name: string;
  role: string;
};

type TaskForm = {
  user_uid: string;
  title: string;
  description: string;
  assignment_type: "MANAGER" | "SELF";
};

export default function CreateTaskPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<TaskForm>({
    user_uid: "",
    title: "",
    description: "",
    assignment_type: "SELF",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getProfile();
        setCurrentUser(profileRes.data);

        const usersRes = await getCompanyDetails();
        setUsers(usersRes.users);

        setForm((prev) => ({
          ...prev,
          user_uid: profileRes.data.uid,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      await createTask(form);
      alert("Task created successfully");

      setForm({
        user_uid: currentUser?.uid || "",
        title: "",
        description: "",
        assignment_type: "SELF",
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CreateTaskSkeleton />;

  const isManager = currentUser?.role === "MANAGER";

  return (
    <div className="h-full w-full bg-[#f9f9f9] overflow-y-auto p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Task</h1>
        <p className="text-sm text-gray-500">
          Assign and manage tasks within your team
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl border p-6 w-full max-w-4xl">
        
        {/* TITLE */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">Title</label>
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm min-h-[100px]"
          />
        </div>

        {/* ASSIGN */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">Assign To</label>

          {isManager ? (
            <select
              value={form.user_uid}
              onChange={(e) => {
                const selected = e.target.value;

                setForm({
                  ...form,
                  user_uid: selected,
                  assignment_type:
                    selected === currentUser?.uid ? "SELF" : "MANAGER",
                });
              }}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            >
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              disabled
              value={`${currentUser?.first_name} ${currentUser?.last_name}`}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-gray-100"
            />
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="mt-2 px-5 py-2 bg-black text-white rounded-lg text-sm"
        >
          Create Task
        </button>
      </div>
    </div>
  );
}

// SKELETON

function CreateTaskSkeleton() {
  return (
    <div className="h-full w-full bg-[#f9f9f9] p-6 animate-pulse">
      
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-60 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-xl border p-6 max-w-4xl space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-24 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}