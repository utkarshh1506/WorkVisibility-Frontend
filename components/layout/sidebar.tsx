"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  User,
  PlusSquare,
  Building2,
  FileText,
} from "lucide-react";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    return (
        <div
            className={`bg-white border-r transition-all duration-300 ${
                collapsed ? "w-16" : "w-64"
            } h-full`}
        >
            <div className="flex flex-col p-2">
                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="self-start shrink-0 text-gray-600 px-2 py-1"
                >
                    ☰
                </button>

                {/* Menu */}
                <div className="mt-2 flex flex-col gap-2 overflow-hidden">
                    <SidebarItem
  label="Dashboard"
  path="/dashboard"
  icon={<LayoutDashboard size={18} />}
  collapsed={collapsed}
  router={router}
/>

<SidebarItem
  label="Profile"
  path="/profile"
  icon={<User size={18} />}
  collapsed={collapsed}
  router={router}
/>

<SidebarItem
  label="Create Task"
  path="/task"
  icon={<PlusSquare size={18} />}
  collapsed={collapsed}
  router={router}
/>

<SidebarItem
  label="Company Details"
  path="/company"
  icon={<Building2 size={18} />}
  collapsed={collapsed}
  router={router}
/>

<SidebarItem
  label="Logs"
  path="/logs"
  icon={<FileText size={18} />}
  collapsed={collapsed}
  router={router}
/>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({
  label,
  path,
  collapsed,
  router,
  icon,
}: {
  label: string;
  path: string;
  collapsed: boolean;
  router: any;
  icon: React.ReactNode;
}) {
  return (
    <div
      onClick={() => router.push(path)}
      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
    >
      {/* ICON */}
      <div className="text-gray-600 flex items-center justify-center">
        {icon}
      </div>

      {/* LABEL */}
      {!collapsed && (
        <span className="text-gray-700 text-sm">{label}</span>
      )}
    </div>
  );
}