"use client";

import { getTaskLogs } from "@/services/task";
import { useEffect, useState } from "react";


// TYPES

type Log = {
  id: number;
  uid: string;
  action: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
  task: {
    title: string;
    description: string;
  };
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getTaskLogs();
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <LogsSkeleton />;

  return (
    <div className="h-full w-full bg-[#f9f9f9] overflow-y-auto p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <p className="text-sm text-gray-500">
          Track all actions performed on tasks
        </p>
      </div>

      {/* LOG LIST */}
      <div className="bg-white rounded-xl border p-6 w-full">
        <div className="flex flex-col gap-6">
          {logs.map((log) => (
            <div key={log.uid} className="flex gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {log.user.first_name[0]}
                {log.user.last_name[0]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {log.user.first_name} {log.user.last_name}
                  </span>{" "}
                  <span className="text-gray-600">
                    {formatAction(log.action)}
                  </span>{" "}
                  <span className="font-medium">
                    {log.task.title}
                  </span>
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(log.created_at)}
                </p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <p className="text-sm text-gray-400">No logs found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// HELPERS

function formatAction(action: string) {
  switch (action) {
    case "ASSIGNED":
      return "assigned a task";
    case "CREATED":
      return "created a task";
    case "UPDATED":
      return "updated a task";
    default:
      return action.toLowerCase();
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

// SKELETON

function LogsSkeleton() {
  return (
    <div className="h-full w-full bg-[#f9f9f9] p-6 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-60 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-xl border p-6 max-w-4xl space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-2 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
