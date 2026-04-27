"use client";

import { useEffect, useState } from "react";
import {
  task,
  addComment,
  getComments,
  deleteTask,
  updateTask,
} from "@/services/task";
import KanbanSkeleton from "@/components/skeleton/kanbanboard";
import { CommentSkeleton } from "@/components/skeleton/comment";
import { Trash2 } from "lucide-react";
import { getProfile } from "@/services/user";
import {
  DndContext,
  closestCorners,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { socket } from "@/lib/socket";

type Task = {
  id: number;
  uid: string;
  title: string;
  description: string;
  user_id: number;
  assignment_type?: string;
  assigned_by?: { first_name: string };
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

type TaskGroups = {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
};

type TaskGroupKey = keyof TaskGroups; // "todo" | "inProgress" | "done"

export default function DashboardPage() {
  const [groupedTasks, setGroupedTasks] = useState({
    todo: [] as Task[],
    inProgress: [] as Task[],
    done: [] as Task[],
  });

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 🔹 Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, userRes] = await Promise.all([
          task(),
          getProfile(),
        ]);

        const tasks: Task[] = taskRes?.data?.data || taskRes;

        setGroupedTasks({
          todo: tasks.filter((t) => t.status === "TODO"),
          inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
          done: tasks.filter((t) => t.status === "DONE"),
        });

        setUser(userRes?.data || userRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 SOCKET CONNECTION
  useEffect(() => {
    if (!user) return;

    socket.emit("join_company", user.company_id);

    const handleTaskUpdate = ({ uid, status }: any) => {
      setGroupedTasks((prev) => {
        let movedTask: any;

        const newState = {
          todo: [...prev.todo],
          inProgress: [...prev.inProgress],
          done: [...prev.done],
        };

        (Object.keys(newState) as TaskGroupKey[]).forEach((key) => {
          newState[key] = newState[key].filter((t) => {
            if (t.uid === uid) {
              movedTask = t;
              return false;
            }
            return true;
          });
        });

        if (!movedTask) return prev;
        if (movedTask.status === status) return prev;

        const updatedTask = { ...movedTask, status };

        if (status === "TODO") newState.todo.push(updatedTask);
        if (status === "IN_PROGRESS") newState.inProgress.push(updatedTask);
        if (status === "DONE") newState.done.push(updatedTask);

        return newState;
      });
    };

    const handleTaskCreate = (task: Task) => {
      setGroupedTasks((prev) => ({
        ...prev,
        todo: [task, ...prev.todo],
      }));
    };

    const handleTaskDelete = ({ uid }: any) => {
      setGroupedTasks((prev) => ({
        todo: prev.todo.filter((t) => t.uid !== uid),
        inProgress: prev.inProgress.filter((t) => t.uid !== uid),
        done: prev.done.filter((t) => t.uid !== uid),
      }));
    };

    socket.on("task_updated", handleTaskUpdate);
    socket.on("task_created", handleTaskCreate);
    socket.on("task_deleted", handleTaskDelete);

    return () => {
      socket.off("task_updated", handleTaskUpdate);
      socket.off("task_created", handleTaskCreate);
      socket.off("task_deleted", handleTaskDelete);
    };
  }, [user]);

  const handleDeleteTask = (uid: string) => {
    setGroupedTasks((prev) => ({
      todo: prev.todo.filter((t) => t.uid !== uid),
      inProgress: prev.inProgress.filter((t) => t.uid !== uid),
      done: prev.done.filter((t) => t.uid !== uid),
    }));
  };

  if (loading) return <KanbanSkeleton />;

  // 🔹 Drag & Drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const movedTask = [
      ...groupedTasks.todo,
      ...groupedTasks.inProgress,
      ...groupedTasks.done,
    ].find((t) => t.uid === taskId);

    if (!movedTask || movedTask.status === newStatus) return;

    const canUpdate =
      user?.role === "MANAGER" || movedTask.user_id === user?.id;

    if (!canUpdate) {
      alert("Not allowed");
      return;
    }

    // optimistic update
    setGroupedTasks((prev) => {
      const newState = {
        todo: prev.todo.filter((t) => t.uid !== taskId),
        inProgress: prev.inProgress.filter((t) => t.uid !== taskId),
        done: prev.done.filter((t) => t.uid !== taskId),
      };

      const updatedTask = { ...movedTask, status: newStatus };

      if (newStatus === "TODO") newState.todo.push(updatedTask);
      if (newStatus === "IN_PROGRESS") newState.inProgress.push(updatedTask);
      if (newStatus === "DONE") newState.done.push(updatedTask);

      return newState;
    });

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-x-auto bg-[#f9f9f9] flex justify-center">
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-8 h-full w-fit p-6">
          <Column id="TODO" title="To Do" tasks={groupedTasks.todo} onDelete={handleDeleteTask} user={user} />
          <Column id="IN_PROGRESS" title="In Progress" tasks={groupedTasks.inProgress} onDelete={handleDeleteTask} user={user} />
          <Column id="DONE" title="Done" tasks={groupedTasks.done} onDelete={handleDeleteTask} user={user} />
        </div>
      </DndContext>
    </div>
  );
}

// ---------------- COLUMN ----------------
function Column({ id, title, tasks, onDelete, user }: any) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <section ref={setNodeRef} className="flex flex-col w-[480px] h-full">
      <h2 className="mb-6 text-xs font-bold uppercase px-2">
        {title} ({tasks.length})
      </h2>

      <div className="flex flex-col gap-6 bg-[#f3f3f3] p-4 rounded-xl flex-1 overflow-y-auto scrollbar-hide">
        {tasks.map((task: Task) => (
          <TaskCard key={task.uid} task={task} onDelete={onDelete} user={user} />
        ))}
      </div>
    </section>
  );
}

// ---------------- TASK CARD ----------------
function TaskCard({ task, onDelete, user }: any) {
  const [showInput, setShowInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const canDelete =
    user?.role === "MANAGER" || task.user_id === user?.id;

  // 🔹 Fetch comments
  useEffect(() => {
    if (!showComments || commentsLoaded) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await getComments(task.uid);
        setComments(res?.data?.data || []);
        setCommentsLoaded(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [showComments, commentsLoaded, task.uid]);

  // 🔹 Socket comment
  useEffect(() => {
  const handleCommentAdded = (c: any) => {
    if (c.task_uid !== task.uid) return;
    setComments((prev) => [c, ...prev]);
  };

  socket.on("comment_added", handleCommentAdded);

  return () => {
    socket.off("comment_added", handleCommentAdded);
  };
}, [task.uid]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const temp = {
      uid: Date.now(),
      message: comment,
      user: { first_name: "You" },
      replies: [],
    };

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

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.uid,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? "none" : "opacity 0.2s ease-in-out",
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white p-6 rounded-xl border hover:border-gray-300 relative cursor-grab active:cursor-grabbing transition ${
        isDragging ? "border-blue-400 bg-blue-50 shadow-2xl" : ""
      }`}
    >
      {canDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer pointer-events-auto"
        >
          <Trash2 size={18} />
        </button>
      )}

      <h3 className="font-semibold text-lg">{task.title}</h3>
      <p className="text-sm text-gray-500">{task.description}</p>

      <p className="text-xs text-gray-400 mt-2">
        Assigned by:{" "}
        {task.assignment_type === "SELF"
          ? "Self"
          : task.assigned_by?.first_name || "—"}
      </p>

      <div className="flex justify-between text-sm mt-3 pointer-events-auto">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowInput((p) => !p);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-500 hover:text-black cursor-pointer pointer-events-auto"
        >
          + Comment
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowComments((p) => !p);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-500 hover:text-black cursor-pointer pointer-events-auto"
        >
          {showComments ? "Hide" : "Show"} Comments
        </button>
      </div>

      {showInput && (
        <div className="flex gap-2 mt-2 pointer-events-auto">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleAddComment();
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 text-sm border-b outline-none pointer-events-auto"
            placeholder="Write comment..."
            autoFocus
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddComment();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer pointer-events-auto hover:text-black transition"
          >
            <SendIcon />
          </button>
        </div>
      )}

      {showComments && (
        <div className="mt-3">
          {loadingComments ? (
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

// ---------------- COMMENTS ----------------
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
    <div style={{ marginLeft: depth * 12 }} className="mt-2">
      <div className="bg-gray-100 p-2 rounded">
        <p className="text-xs font-semibold">{comment.user?.first_name}</p>
        <p className="text-sm">{comment.message}</p>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowReply((p) => !p);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-xs text-gray-500 hover:text-gray-700 mt-1 cursor-pointer pointer-events-auto"
      >
        {showReply ? "Cancel" : "Reply"}
      </button>

      {showReply && (
        <div className="flex gap-2 mt-2 pointer-events-auto">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleReply();
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs border-b flex-1 outline-none pointer-events-auto"
            placeholder="Write reply..."
            autoFocus
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleReply();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer pointer-events-auto hover:text-black transition"
          >
            <SendIcon />
          </button>
        </div>
      )}

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