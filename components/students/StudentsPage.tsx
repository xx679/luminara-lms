import axios from "axios";
import React, { useEffect, useState, useMemo } from 'react';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { Student } from '../../types';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import Modal from '../shared/Modal'; // For potential "Add Student" or "View Details"
import { UsersIcon } from '../../constants';

const StudentCardDisplay: React.FC<{ student: Student, onViewDetails: (student: Student) => void }> = ({ student, onViewDetails }) => (
  <Card className="p-4 flex items-center space-x-4" hoverEffect onClick={() => onViewDetails(student)}>
    <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
    <div>
      <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400">{student.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Joined: {new Date(student.dateJoined).toLocaleDateString()}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">Courses Enrolled: {student.enrolledCourses.length}</p>
    </div>
  </Card>
);

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterByCourse, setFilterByCourse] = useState('All'); // Example filter

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/students");
        setStudents(res.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };
  const handleAddStudent = async () => {
    const newStudent = { name: "新學生", email: "newstudent@example.com" };

    try {
      const response = await axios.post("http://localhost:5000/students", newStudent);
      setStudents([...students, response.data.student]); 
      alert(response.data.message);
    } catch (error) {
      console.error("Failed to add student:", error);
      alert("新增學生失敗");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
      // Add course filter logic if implemented
    );
  }, [students, searchTerm]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner message="Loading students..." /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search students by name or email..."
            className="w-full md:w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={handleAddStudent}>
            Add New Student
          </Button>
        </div>
        {/* Add more filter controls here if needed */}
      </Card>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <StudentCardDisplay key={student.id} student={student} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <UsersIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Students Found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria or add new students.</p>
        </Card>
      )}

      {selectedStudent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Student Details: ${selectedStudent.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-24 h-24 rounded-full object-cover shadow-md" />
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedStudent.name}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{selectedStudent.email}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Role: {selectedStudent.role}</p>
                </div>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Date Joined:</h4>
              <p className="text-slate-600 dark:text-slate-300">{new Date(selectedStudent.dateJoined).toLocaleDateString()}</p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Enrolled Courses ({selectedStudent.enrolledCourses.length}):</h4>
              {selectedStudent.enrolledCourses.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  {selectedStudent.enrolledCourses.map(courseId => (
                    <li key={courseId}>
                      Course ID: {courseId} (Progress: {selectedStudent.progress[courseId] || 0}%)
                      {/* In a real app, you'd fetch course titles here */}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-500 dark:text-slate-400">Not enrolled in any courses.</p>}
            </div>
            {/* Add more details as needed, e.g., progress charts, activity log */}
          </div>
           <div className="mt-6 flex justify-end space-x-3">
             <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
             <Button variant="primary" onClick={() => alert(`Edit student ${selectedStudent.name}`)}>Edit Student</Button>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentsPage;
