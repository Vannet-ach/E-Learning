import axios from "axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Course,
  User,
  Enrollment,
  Progress,
  Lesson,
  Quiz,
  Answer,
} from "../types";

// ===================== AXIOS INSTANCE =====================
const api = axios.create({
  baseURL: "/api", // proxied to http://localhost:3000 via vite.config.ts
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — token expired → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ===================== AUTH =====================
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/users/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<User>("/users/register", { ...payload, role: payload.role ?? "USER" }),
};

// ===================== USERS =====================
export const usersApi = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete<User>(`/users/${id}`),
};

// ===================== COURSES =====================
export const coursesApi = {
  getAll: () => api.get<Course[]>("/courses"),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post<Course>("/courses", data),
  update: (id: number, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => api.delete<Course>(`/courses/${id}`),
  getLessons: (id: number) => api.get<Lesson[]>(`/courses/${id}/lessons`),
};

// ===================== LESSONS =====================
export const lessonsApi = {
  getAll: () => api.get<Lesson[]>("/lessons"),
  getById: (id: number) => api.get<Lesson>(`/lessons/${id}`),
  create: (data: Partial<Lesson>) => api.post<Lesson>("/lessons", data),
  update: (id: number, data: Partial<Lesson>) =>
    api.put<Lesson>(`/lessons/${id}`, data),
  delete: (id: number) => api.delete<Lesson>(`/lessons/${id}`),
  getQuizzes: (id: number) => api.get<Quiz[]>(`/lessons/${id}/quizzes`),
};

// ===================== ENROLLMENTS =====================
export const enrollmentsApi = {
  getAll: () => api.get<Enrollment[]>("/enrollments"),
  getById: (id: number) => api.get<Enrollment>(`/enrollments/${id}`),
  enroll: (user_id: number, course_id: number) =>
    api.post<Enrollment>("/enrollments", { user_id, course_id }),
  update: (id: number, data: Partial<Enrollment>) =>
    api.put<Enrollment>(`/enrollments/${id}`, data),
  delete: (id: number) => api.delete<Enrollment>(`/enrollments/${id}`),
  getByUser: (userId: number) =>
    api.get<Enrollment[]>(`/enrollments/user/${userId}`),
};

// ===================== PROGRESS =====================
export const progressApi = {
  getAll: () => api.get<Progress[]>("/progress"),
  getById: (id: number) => api.get<Progress>(`/progress/${id}`),
  create: (data: Partial<Progress>) => api.post<Progress>("/progress", data),
  update: (id: number, data: Partial<Progress>) =>
    api.put<Progress>(`/progress/${id}`, data),
  delete: (id: number) => api.delete<Progress>(`/progress/${id}`),
  getByUser: (userId: number) =>
    api.get<Progress[]>(`/progress/user/${userId}`),
};

// ===================== QUIZZES =====================
export const quizzesApi = {
  getAll: () => api.get<Quiz[]>("/quizzes"),
  getById: (id: number) => api.get<Quiz>(`/quizzes/${id}`),
  create: (data: Partial<Quiz>) => api.post<Quiz>("/quizzes", data),
  update: (id: number, data: Partial<Quiz>) =>
    api.put<Quiz>(`/quizzes/${id}`, data),
  delete: (id: number) => api.delete<Quiz>(`/quizzes/${id}`),
  getAnswers: (id: number) => api.get<Answer[]>(`/quizzes/${id}/answers`),
};

// ===================== ANSWERS =====================
export const answersApi = {
  getAll: () => api.get<Answer[]>("/answers"),
  getById: (id: number) => api.get<Answer>(`/answers/${id}`),
  create: (data: Partial<Answer>) => api.post<Answer>("/answers", data),
  update: (id: number, data: Partial<Answer>) =>
    api.put<Answer>(`/answers/${id}`, data),
  delete: (id: number) => api.delete<Answer>(`/answers/${id}`),
  getByQuiz: (quizId: number) =>
    api.get<Answer[]>(`/answers/quiz/${quizId}`),
};


// ===================== UPLOAD =====================
export const uploadApi = {
  image: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/upload/image", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error ?? "Image upload failed");
    }
    const data = await res.json();
    return data.url;
  },

  video: async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
    // Upload DIRECTLY to backend — bypass Vite proxy to avoid timeout on large files
    const BACKEND = "http://localhost:3000";
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("video", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BACKEND}/upload/video`);
      xhr.timeout = 30 * 60 * 1000; // 30 minutes for large videos

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try { resolve(JSON.parse(xhr.responseText).url); }
          catch { reject(new Error("Invalid server response")); }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error ?? `Server error ${xhr.status}`));
          } catch { reject(new Error(`Upload failed (${xhr.status})`)); }
        }
      };
      xhr.onerror   = () => reject(new Error("Cannot reach backend at localhost:3000"));
      xhr.ontimeout = () => reject(new Error("Upload timed out"));
      xhr.send(form);
    });
  },
};

export default api;