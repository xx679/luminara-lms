
import type { Course, Student, Tutor, Event, User, QuizQuestion, DiscussionThread, DiscussionReply } from '../types';

// Helper to simulate API delay
const stall = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
let mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://picsum.photos/seed/user1/100/100', role: 'student', email: 'alice@example.com' },
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://picsum.photos/seed/user2/100/100', role: 'student', email: 'bob@example.com' },
  { id: 'user3', name: 'Charlie Chaplin', avatarUrl: 'https://picsum.photos/seed/user3/100/100', role: 'tutor', email: 'charlie@example.com' },
  { id: 'user4', name: 'Diana Prince', avatarUrl: 'https://picsum.photos/seed/user4/100/100', role: 'tutor', email: 'diana@example.com' },
  { id: 'user5', name: 'Admin User', avatarUrl: 'https://picsum.photos/seed/admin/100/100', role: 'admin', email: 'admin@example.com' },
];

let mockCourses: Course[] = [
  {
    id: 'course1', title: 'Introduction to Web Development', tagline: 'Master the MERN Stack',
    description: 'Learn to build modern web applications using MongoDB, Express, React, and Node.js. This course covers everything from basic HTML/CSS to advanced backend development.',
    instructorName: 'Charlie Chaplin', instructorId: 'user3', imageUrl: 'https://picsum.photos/seed/course1/600/400', category: 'Web Development',
    duration: '40 total hours', studentsEnrolled: 125, rating: 4.8, level: 'Beginner', lastUpdated: '2024-05-01T10:00:00Z', price: 99.99,
    modules: [
      { id: 'm1c1', title: 'Module 1: HTML & CSS Basics', description: 'Fundamentals of web structure and styling.', videos: [{id:'v1', title: 'HTML Intro', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '5:30'}] },
      { id: 'm2c1', title: 'Module 2: JavaScript Essentials', description: 'Core JavaScript concepts for dynamic web pages.', podcasts: [{id:'p1', title: 'JS Concepts', audioUrl: '#', duration: '15:00'}] },
      { id: 'm3c1', title: 'Module 3: React Deep Dive', description: 'Building interactive UIs with React.', quizzes: [{id:'q1', title:'React Basics Quiz', questions: [{id:'qq1', text:'What is JSX?', options:[{id:'o1',text:'JavaScript XML'},{id:'o2',text:'JavaScript Syntax Extension'}], correctOptionId:'o2', type: 'multiple-choice'}]}] },
    ],
    discussions: [
        { id: 'd1c1', title: 'Stuck on React Hooks', authorId: 'user1', authorName: 'Alice Wonderland', authorAvatar: 'https://picsum.photos/seed/user1/50/50', initialPost: "I'm having trouble understanding useEffect. Can anyone explain it simply?", timestamp: '2024-05-10T14:30:00Z', replies: [{id:'dr1', userId:'user3', userName:'Charlie Chaplin', userAvatar: 'https://picsum.photos/seed/user3/50/50', text: 'Sure, useEffect runs after every render by default...', timestamp: '2024-05-10T15:00:00Z'}], tags: ['react', 'hooks', 'help'] }
    ]
  },
  {
    id: 'course2', title: 'Advanced Data Science with Python', tagline: 'Unlock Insights from Data',
    description: 'Explore advanced data science techniques including machine learning, deep learning, and big data analytics using Python and its powerful libraries.',
    instructorName: 'Diana Prince', instructorId: 'user4', imageUrl: 'https://picsum.photos/seed/course2/600/400', category: 'Data Science',
    duration: '60 total hours', studentsEnrolled: 98, rating: 4.9, level: 'Advanced', lastUpdated: '2024-04-15T12:00:00Z', price: 149.99,
    modules: [
      { id: 'm1c2', title: 'Module 1: Machine Learning Fundamentals', description: 'Understanding core ML algorithms.' },
      { id: 'm2c2', title: 'Module 2: Deep Learning with TensorFlow', description: 'Building neural networks.' },
    ],
  },
   {
    id: 'course3', title: 'UI/UX Design Principles', tagline: 'Create User-Centric Designs',
    description: 'Learn the fundamentals of UI/UX design, from user research and wireframing to prototyping and usability testing. Develop an eye for aesthetics and a mind for user experience.',
    instructorName: 'Charlie Chaplin', instructorId: 'user3', imageUrl: 'https://picsum.photos/seed/course3/600/400', category: 'Design',
    duration: '30 total hours', studentsEnrolled: 150, rating: 4.7, level: 'Intermediate', lastUpdated: '2024-05-20T09:00:00Z',
    modules: [
      { id: 'm1c3', title: 'Module 1: Introduction to UX', description: 'User research and personas.', videos: [{id:'v1c3', title: 'What is UX?', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8:15'}] },
      { id: 'm2c3', title: 'Module 2: UI Design Fundamentals', description: 'Color theory, typography, layout.', podcasts: [{id:'p1c3', title: 'Design Systems', audioUrl: '#', duration: '22:40'}] },
    ],
  }
];

let mockStudents: Student[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://picsum.photos/seed/user1/100/100', role: 'student', email: 'alice@example.com', enrolledCourses: ['course1'], progress: { 'course1': 75 }, dateJoined: '2023-01-15T00:00:00Z' },
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://picsum.photos/seed/user2/100/100', role: 'student', email: 'bob@example.com', enrolledCourses: ['course1', 'course2'], progress: { 'course1': 50, 'course2': 20 }, dateJoined: '2023-02-20T00:00:00Z' },
];

let mockTutors: Tutor[] = [
  { id: 'user3', name: 'Charlie Chaplin', avatarUrl: 'https://picsum.photos/seed/user3/100/100', role: 'tutor', email: 'charlie@example.com', specialization: ['Web Development', 'UI/UX Design'], bio: 'Passionate about creating intuitive web experiences and teaching modern technologies.', coursesTaught: ['course1', 'course3'], avgRating: 4.8 },
  { id: 'user4', name: 'Diana Prince', avatarUrl: 'https://picsum.photos/seed/user4/100/100', role: 'tutor', email: 'diana@example.com', specialization: ['Data Science', 'Machine Learning'], bio: 'Expert in data analysis and AI, dedicated to helping students unlock the power of data.', coursesTaught: ['course2'], avgRating: 4.9 },
];

let mockEvents: Event[] = [
  { 
    id: 'event1', title: 'Web Dev Bootcamp Info Session', 
    description: 'Learn about our intensive web development bootcamp. Ask questions and meet the instructors.', 
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), time: '6:00 PM - 7:00 PM PST', 
    location: 'Online via Zoom', imageUrl: 'https://picsum.photos/seed/event1/600/400', 
    organizer: 'Charlie Chaplin', category: 'Webinar', registeredUsers: ['user1'], maxAttendees: 100 
  },
  { 
    id: 'event2', title: 'Data Science Workshop: Pandas & Numpy', 
    description: 'Hands-on workshop covering essential Python libraries for data manipulation and analysis.', 
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), time: '10:00 AM - 1:00 PM PST', 
    location: 'Room 301, Tech Hub Building', imageUrl: 'https://picsum.photos/seed/event2/600/400', 
    organizer: 'Diana Prince', category: 'Workshop', registeredUsers: [], maxAttendees: 30
  },
];


export const lmsApiService = {
  getCourses: async (): Promise<Course[]> => {
    await stall(500);
    return [...mockCourses];
  },
  getCourseById: async (id: string): Promise<Course | undefined> => {
    await stall(300);
    return mockCourses.find(course => course.id === id);
  },
  getStudents: async (): Promise<Student[]> => {
    await stall(400);
    return [...mockStudents];
  },
  getStudentById: async (id: string): Promise<Student | undefined> => {
    await stall(200);
    return mockStudents.find(student => student.id === id);
  },
  getTutors: async (): Promise<Tutor[]> => {
    await stall(400);
    return [...mockTutors];
  },
  getTutorById: async (id: string): Promise<Tutor | undefined> => {
    await stall(200);
    return mockTutors.find(tutor => tutor.id === id);
  },
  getEvents: async (): Promise<Event[]> => {
    await stall(600);
    return [...mockEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())];
  },
  getEventById: async (id: string): Promise<Event | undefined> => {
    await stall(300);
    return mockEvents.find(event => event.id === id);
  },
  registerForEvent: async (eventId: string, userId: string): Promise<boolean> => {
    await stall(700);
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      if (!event.registeredUsers.includes(userId)) {
        if (event.maxAttendees && event.registeredUsers.length >= event.maxAttendees) {
          console.warn(`Event ${eventId} is full.`);
          return false; // Event is full
        }
        event.registeredUsers.push(userId);
        console.log(`User ${userId} registered for event ${eventId}`);
        return true;
      }
      console.log(`User ${userId} already registered for event ${eventId}`);
      return true; // Already registered
    }
    return false; // Event not found
  },
  submitQuiz: async (courseId: string, moduleId: string, quizId: string, answers: { [questionId: string]: string }): Promise<{ score: number, totalQuestions: number }> => {
    await stall(1000);
    const course = mockCourses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    const quiz = module?.quizzes?.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        score++;
      }
    });
    console.log(`Quiz ${quizId} submitted. Score: ${score}/${quiz.questions.length}`);
    return { score, totalQuestions: quiz.questions.length };
  },
  addDiscussionReply: async (courseId: string, discussionId: string, reply: Omit<DiscussionReply, 'id' | 'timestamp'>): Promise<DiscussionReply | null> => {
    await stall(500);
    const course = mockCourses.find(c => c.id === courseId);
    const discussion = course?.discussions?.find(d => d.id === discussionId);
    if (discussion) {
      const newReply: DiscussionReply = {
        ...reply,
        id: `dr${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      discussion.replies.push(newReply);
      return newReply;
    }
    return null;
  },
  // Basic dashboard data
  getDashboardSummary: async () => {
    await stall(300);
    return {
      activeCourses: mockCourses.length,
      totalStudents: mockStudents.length,
      totalTutors: mockTutors.length,
      upcomingEvents: mockEvents.filter(e => new Date(e.date) > new Date()).length,
    };
  },
  getCourseCompletionData: async () => {
    await stall(500);
    return mockCourses.slice(0, 5).map(course => ({
      name: course.title.length > 20 ? course.title.substring(0,18) + '...' : course.title,
      value: Math.floor(Math.random() * 80) + 20, // Random completion %
    }));
  },
  getStudentEngagementData: async () => {
    await stall(500);
    // Simulate weekly engagement for the last 5 weeks
    return [
      { name: 'Week 1', value: Math.floor(Math.random() * 50) + 50 },
      { name: 'Week 2', value: Math.floor(Math.random() * 50) + 55 },
      { name: 'Week 3', value: Math.floor(Math.random() * 50) + 60 },
      { name: 'Week 4', value: Math.floor(Math.random() * 50) + 58 },
      { name: 'Week 5', value: Math.floor(Math.random() * 50) + 65 },
    ];
  },
};

