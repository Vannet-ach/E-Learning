// ===================== AUTH =====================
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ===================== USER =====================
export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN" | "user" | "admin";
}

// ===================== COURSE =====================
export interface Course {
  course_id: number;
  title: string;
  description: string;
  user_id: number;
  user?: User;
  lessons?: Lesson[];
  enrollments?: Enrollment[];
}

// ===================== LESSON =====================
export interface Lesson {
  lesson_id: number;
  title: string;
  video_url: string;
  lesson_order: number;
  course_id: number;
  course?: Course;
  quizzes?: Quiz[];
  progress?: Progress[];
}

// ===================== ENROLLMENT =====================
export interface Enrollment {
  enrollment_id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  user?: User;
  course?: Course;
}

// ===================== PROGRESS =====================
export interface Progress {
  progress_id: number;
  user_id: number;
  lesson_id: number;
  status: string;
  user?: User;
  lesson?: Lesson;
}

// ===================== QUIZ =====================
export interface Quiz {
  quiz_id: number;
  lesson_id: number;
  question: string;
  lesson?: Lesson;
  answers?: Answer[];
}

// ===================== ANSWER =====================
export interface Answer {
  answer_id: number;
  quiz_id: number;
  answer: string;
  is_correct: boolean;
  quiz?: Quiz;
}
