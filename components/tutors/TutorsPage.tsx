
import React, { useEffect, useState, useMemo } from 'react';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { Tutor } from '../../types';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { AcademicCapIcon, StarIcon } from '../../constants';

const TutorCardDisplay: React.FC<{ tutor: Tutor, onViewDetails: (tutor: Tutor) => void }> = ({ tutor, onViewDetails }) => (
  <Card className="p-4" hoverEffect onClick={() => onViewDetails(tutor)}>
    <div className="flex flex-col items-center text-center">
      <img src={tutor.avatarUrl} alt={tutor.name} className="w-24 h-24 rounded-full object-cover mb-3 shadow-lg" />
      <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400">{tutor.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{tutor.specialization.join(', ')}</p>
      <div className="flex items-center mt-2 text-amber-500">
        <StarIcon className="w-5 h-5 mr-1"/>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{tutor.avgRating.toFixed(1)} Avg. Rating</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Courses Taught: {tutor.coursesTaught.length}</p>
    </div>
  </Card>
);

const TutorsPage: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const data = await lmsApiService.getTutors();
        setTutors(data);
      } catch (error) {
        console.error("Failed to fetch tutors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  const specializations = useMemo(() => {
    const allSpecs = tutors.reduce((acc, tutor) => {
      tutor.specialization.forEach(spec => acc.add(spec));
      return acc;
    }, new Set<string>());
    return ['All', ...Array.from(allSpecs)];
  }, [tutors]);

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsDetailModalOpen(true);
  };

  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor =>
      (tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tutor.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedSpecialization === 'All' || tutor.specialization.includes(selectedSpecialization))
    );
  }, [tutors, searchTerm, selectedSpecialization]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner message="Loading tutors..." /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
           <div>
            <label htmlFor="search-tutors" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Tutors</label>
            <input
              type="text"
              id="search-tutors"
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="specialization-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter by Specialization</label>
            <select
              id="specialization-filter"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
          </div>
          <Button variant="primary" onClick={() => alert('Add new tutor functionality to be implemented.')} className="md:self-end">
            Add New Tutor
          </Button>
        </div>
      </Card>

      {filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTutors.map(tutor => (
            <TutorCardDisplay key={tutor.id} tutor={tutor} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <AcademicCapIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Tutors Found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
        </Card>
      )}

      {selectedTutor && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Tutor Profile: ${selectedTutor.name}`}
          size="lg"
        >
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-2">
                <img src={selectedTutor.avatarUrl} alt={selectedTutor.name} className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-sky-200 dark:border-sky-700" />
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedTutor.name}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{selectedTutor.email}</p>
                    <div className="mt-1 flex items-center justify-center sm:justify-start text-amber-500">
                        <StarIcon className="w-5 h-5 mr-1"/>
                        <span className="text-md font-semibold text-slate-700 dark:text-slate-200">{selectedTutor.avgRating.toFixed(1)} Average Rating</span>
                    </div>
                </div>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Bio:</h4>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{selectedTutor.bio}</p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Specializations:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTutor.specialization.map(spec => (
                  <span key={spec} className="px-3 py-1 text-xs bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200 rounded-full font-medium">{spec}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Courses Taught ({selectedTutor.coursesTaught.length}):</h4>
               {selectedTutor.coursesTaught.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  {selectedTutor.coursesTaught.map(courseId => (
                    <li key={courseId}>
                      Course ID: {courseId} {/* In a real app, fetch course titles */}
                    </li>
                  ))}
                </ul>
               ) : <p className="text-slate-500 dark:text-slate-400">Not currently teaching any courses.</p>}
            </div>
          </div>
           <div className="mt-6 flex justify-end space-x-3">
             <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
             <Button variant="primary" onClick={() => alert(`Edit tutor ${selectedTutor.name}`)}>Edit Tutor</Button>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default TutorsPage;
