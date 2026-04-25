"use client";

import { useEffect, useState, useRef } from "react";
import { task, addComment, getComments } from "@/services/task";
import KanbanSkeleton from "@/components/skeleton/kanbanboard";
import { CommentSkeleton } from "@/components/skeleton/comment";
import { deleteTask } from "@/services/task";
import { Trash2 } from "lucide-react";
import { getProfile } from "@/services/user";

type Task = {
  id: number;
  uid: string;
  title: string;
  description: string;
  user_id: number;
  assignment_type?: string;
  assigned_by?: { first_name: string };
  status: "TODO" | "IN_PROGRESS" | "DONE";
  user: {
    first_name: string;
    last_name: string;
  };
  latestComment?: {
    message: string;
    user: {
      first_name: string;
    };
  };
};

export default function DashboardPage() {
  const [groupedTasks, setGroupedTasks] = useState({
    todo: [] as Task[],
    inProgress: [] as Task[],
    done: [] as Task[],
  });

  const [loading, setLoading] = useState(true);
  const [user , setUser] = useState<any>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [taskRes, userRes] = await Promise.all([
        task(),
        getProfile(),
      ]);

      const tasks: Task[] = taskRes.data?.data || taskRes;

      const grouped = {
        todo: tasks.filter((t) => t.status === "TODO"),
        inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
        done: tasks.filter((t) => t.status === "DONE"),
      };

      setGroupedTasks(grouped);
      setUser(userRes.data || userRes); // 👈 store user
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const handleDeleteTask = (uid: string) => {
    setGroupedTasks((prev) => ({
        todo: prev.todo.filter((t) => t.uid !== uid),
        inProgress: prev.inProgress.filter((t) => t.uid !== uid),
        done: prev.done.filter((t) => t.uid !== uid),
    }));
    };

  if (loading) {
    return <KanbanSkeleton />;
  }

  return (
    <div className="h-full overflow-x-auto bg-[#f9f9f9] flex justify-center">
      <div className="flex gap-8 h-full w-fit p-6">

        <Column title="To Do" tasks={groupedTasks.todo} onDelete={handleDeleteTask} user={user} />
        <Column title="In Progress" tasks={groupedTasks.inProgress} onDelete={handleDeleteTask} user={user} />
        <Column title="Done" tasks={groupedTasks.done} onDelete={handleDeleteTask} user={user} />

      </div>
    </div>
  );
}

function Column({ title, tasks, onDelete, user }: { title: string; tasks: Task[]; onDelete: (uid: string) => void; user: any; }) {
    return (
        <section className="flex flex-col w-[480px] h-full">
            <header className="flex justify-between items-center mb-6 px-2">
                <h2 className="font-bold text-xs uppercase tracking-widest text-black">
                    {title} ({tasks.length})
                </h2>
            </header>

            <div
                className="flex flex-col gap-6 bg-[#f3f3f3] p-4 rounded-xl flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
            >
                {tasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} onDelete={onDelete} user={user} />
                ))}
            </div>
        </section>
    );
}

function TaskCard({ task, onDelete, user }: { task: any; onDelete: (uid: string) => void; user: any; }) {
  const [showInput, setShowInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const canDelete = user?.role === "MANAGER" || task.user_id === user?.id;

  // fetch comments only when opened
  useEffect(() => {
  if (!showComments || commentsLoaded) return;

  const fetchComments = async () => {
    setLoadingComments(true);

    try {
      const res = await getComments(task.uid);
      setComments(res.data || res);
      setCommentsLoaded(true); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  fetchComments();
}, [showComments, commentsLoaded, task.uid]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const temp = {
      uid: Date.now(),
      message: comment,
      user: { first_name: "You", last_name: "" },
      replies: [],
    };

    // optimistic update
    setComments((prev) => [temp, ...prev]);
    setComment("");
    setShowInput(false);

    try {
      await addComment(task.uid, comment);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;

    try {
        await deleteTask(task.uid);
        onDelete(task.uid);
    } catch (err) {
        console.error(err);
    }
    };

  return (
    <div className="bg-white p-6 rounded-xl border hover:border-gray-300 transition relative">

    {canDelete && (
        <button
            onClick={handleDelete}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
            <Trash2 size={18} />
        </button>
        )}

      {/* Title */}
      <h3 className="font-semibold text-lg mb-1">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-2">
        {task.description}
      </p>

      {/* Assigned */}
      <p className="text-xs text-gray-400 mb-4">
        Assigned by:{" "}
        {task.assignment_type === "SELF"
          ? "Self"
          : `${task.assigned_by?.first_name || ""}`}
      </p>

      {/* Actions */}
      <div className="flex justify-between text-sm mb-3">
        <button
          onClick={() => setShowInput((prev) => !prev)}
          className="text-gray-500 hover:text-black"
        >
          + Comment
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="text-gray-500 hover:text-black"
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </button>
      </div>

      {/* Input */}
      {showInput && (
        <div className="flex items-center gap-2 mb-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 text-sm border-b outline-none py-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />

          <button onClick={handleAddComment}>
            <SendIcon />
          </button>
        </div>
      )}

      {/* Comments Thread */}
      {showComments && (
        <div className="mt-3">

            {loadingComments && !commentsLoaded ? (
            <CommentSkeleton />
            ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400">No comments</p>
            ) : (
            comments.map((c) => (
                <CommentItem key={c.uid} comment={c} taskUid={task.uid} />
            ))
            )}

        </div>
        )}
    </div>
  );
}


function CommentItem({ comment, taskUid, depth = 0 }: any) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReply = async () => {
    if (!reply.trim()) return;

    const temp = {
      uid: Date.now(),
      message: reply,
      user: { first_name: "You" },
      replies: [],
    };

    setReplies((prev: any) => [...prev, temp]);
    setReply("");
    setShowReply(false);

    try {
      await addComment(taskUid, reply, comment.uid);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="mt-2"
      style={{ marginLeft: depth * 12 }} // indentation
    >
      {/* Comment */}
      <div className="bg-gray-100 p-2 rounded">
        <p className="text-xs text-gray-500">
          {comment.user?.first_name}
        </p>
        <p className="text-sm">{comment.message}</p>
      </div>

      {/* Reply toggle */}
      <button
        onClick={() => setShowReply((prev) => !prev)}
        className="text-xs text-gray-400 mt-1"
      >
        Reply
      </button>

      {/* Reply input */}
      {showReply && (
        <div className="flex gap-2 mt-1">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="text-xs border-b flex-1 outline-none"
            placeholder="Reply..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleReply();
            }}
          />
          <button onClick={handleReply}>
            <SendIcon />
          </button>
        </div>
      )}

      {/* 🔥 Recursive rendering */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((r: any) => (
            <CommentItem
              key={r.uid}
              comment={r}
              taskUid={taskUid}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-600 hover:text-black"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-9.193-5.11a1 1 0 00-1.465 1.115l1.26 5.04a1 1 0 010 .49l-1.26 5.04a1 1 0 001.465 1.115l9.193-5.11a1 1 0 000-1.78z"
      />
    </svg>
  );
}