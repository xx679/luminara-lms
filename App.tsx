
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './components/dashboard/DashboardPage';
import CoursesPage from './components/courses/CoursesPage';
import CourseDetailView from './components/courses/CourseDetailView';
import StudentsPage from './components/students/StudentsPage';
import TutorsPage from './components/tutors/TutorsPage';
import EventsPage from './components/events/EventsPage';
import SettingsPage from './components/settings/SettingsPage'; // Added for completeness
import { MenuIcon, XIcon } from './constants'; // Assuming these are defined in constants.tsx

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailView />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
