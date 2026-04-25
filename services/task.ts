import { api } from "@/lib/api";

export const task = async() => {
    const res = await api.get('/api/task');
    return res.data.data.data;
}

export const getComments = async(taskUid: string) => {
    const res = await api.get(`/api/task/${taskUid}/comments`);
    return res.data.data.data;
}

export const addComment = async (
  taskUid: string,
  message: string,
  parentUid?: string
) => {
  const res = await api.post(`/api/task/${taskUid}/add-comment`, {
    message,
    parent_uid: parentUid || null,
  });

  return res.data.data;
};

export const createTask = async (data: {
  user_uid: string;
  title: string;
  description: string;
  assignment_type: "SELF" | "MANAGER";
}) => {
  console.log("Creating task with data:", data);
  const res = await api.post("/api/task/create-task", data);
  return res.data;
};

export const getTaskLogs = async () =>{
    const res = await api.get('/api/task/get-logs');
    return res.data;
}

export const deleteTask = async (taskUid: string) => {
    const res = await api.patch(`/api/task/delete-task/${taskUid}`);
    return res.data;
}