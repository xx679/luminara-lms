
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'student' | 'tutor' | 'admin';
  email: string;
}

export interface VideoResource {
  id: string;
  title: string;
  url: string; // e.g., YouTube embed URL
  duration: string; // e.g., "10:32"
}

export interface PodcastResource {
  id: string;
  title: string;
  audioUrl: string;
  duration: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  type: 'multiple-choice' | 'true-false';
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface DiscussionReply {
  id: string;
  userId: string; // links to User.id
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string; // ISO date string
}
export interface DiscussionThread {
  id: string;
  title: string;
  authorId: string; // links to User.id
  authorName: string;
  authorAvatar: string;
  initialPost: string;
  timestamp: string; // ISO date string
  replies: DiscussionReply[];
  tags: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  videos?: VideoResource[];
  podcasts?: PodcastResource[];
  quizzes?: Quiz[];
  readingMaterials?: { id: string; title: string; url: string; format: 'pdf' | 'text' }[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  instructorName: string;
  instructorId: string; // links to User.id (tutor)
  imageUrl: string;
  category: string;
  duration: string; // e.g., "10 total hours"
  modules: CourseModule[];
  studentsEnrolled: number;
  rating: number; // 1-5
  price?: number; // Optional, for paid courses
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastUpdated: string; // ISO date string
  discussions?: DiscussionThread[]; // Course-level discussions
}

export interface Student extends User {
  role: 'student';
  enrolledCourses: string[]; // Array of Course.id
  progress: { [courseId: string]: number }; // e.g., { "course123": 75 (percentage) }
  dateJoined: string; // ISO date string
}

export interface Tutor extends User {
  role: 'tutor';
  specialization: string[];
  bio: string;
  coursesTaught: string[]; // Array of Course.id
  avgRating: number; // Average rating from students
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM - 12:00 PM"
  location: string; // Or "Online"
  imageUrl: string;
  organizer: string; // Could be Tutor.name or Admin
  category: string; // e.g., "Workshop", "Webinar", "Networking"
  registeredUsers: string[]; // Array of User.id
  maxAttendees?: number;
}

// For charts
export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any; // For additional properties like fill color for pie charts
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
}

// For Gemini Interaction
export enum GeminiInteractionType {
  SUMMARIZE = 'summarize',
  EXPLAIN = 'explain',
  ASK_QUESTION = 'ask_question',
}
