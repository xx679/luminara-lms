import axios from "axios";
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { Course } from '../../types';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { StarIcon, UsersIcon, BookOpenIcon, PlayCircleIcon } from '../../constants';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <Card hoverEffect className="flex flex-col">
      <Link to={`/courses/${course.id}`} className="block">
        <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/courses/${course.id}`}>
          <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 hover:underline mb-1 truncate" title={course.title}>{course.title}</h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">By {course.instructorName}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2 flex-grow">{course.tagline}</p>
        
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center">
            <BookOpenIcon className="w-4 h-4 mr-1 text-sky-500" />
            <span>{course.modules.length} Modules</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-1 text-emerald-500" />
            <span>{course.studentsEnrolled} Students</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(course.rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
            <span className="ml-1 text-slate-600 dark:text-slate-300">({course.rating.toFixed(1)})</span>
          </div>
          {course.price ? (
            <span className="font-semibold text-sky-600 dark:text-sky-400">${course.price.toFixed(2)}</span>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
         <Link to={`/courses/${course.id}`} className="w-full">
            <Button variant="primary" size="md" className="w-full" leftIcon={<PlayCircleIcon className="w-5 h-5"/>}>
                View Course
            </Button>
         </Link>
      </div>
    </Card>
  );
};

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/courses");
        setCourses(res.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = useMemo(() => ['All', ...new Set(courses.map(c => c.category))], [courses]);
  const levels = useMemo(() => ['All', ...new Set(courses.map(c => c.level))], [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner message="Loading courses..." /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="search-courses" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Courses</label>
            <input
              type="text"
              id="search-courses"
              placeholder="Search by title, description, instructor..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              id="category-filter"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="level-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Level</label>
            <select
              id="level-filter"
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <BookOpenIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Courses Found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
