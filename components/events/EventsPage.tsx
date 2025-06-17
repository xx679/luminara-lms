
import React, { useEffect, useState, useMemo } from 'react';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { Event } from '../../types';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { CalendarDaysIcon } from '../../constants';

// Mock current user ID for registration
const MOCK_USER_ID = 'user1'; 

const EventCardDisplay: React.FC<{ eventItem: Event; onRegister: (eventId: string) => void; onDetails: (eventItem: Event) => void; isRegistered: boolean; isFull: boolean }> = ({ eventItem, onRegister, onDetails, isRegistered, isFull }) => {
  const eventDate = new Date(eventItem.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const dayOfMonth = eventDate.getDate();
  const monthShort = eventDate.toLocaleDateString(undefined, { month: 'short' });

  return (
    <Card className="flex flex-col overflow-hidden" hoverEffect>
      <img src={eventItem.imageUrl} alt={eventItem.title} className="w-full h-48 object-cover" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start space-x-4 mb-3">
          <div className="flex-shrink-0 text-center w-16 p-2 rounded-lg bg-sky-50 dark:bg-sky-700/30 border border-sky-200 dark:border-sky-600">
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-300">{dayOfMonth}</p>
            <p className="text-xs uppercase text-sky-500 dark:text-sky-400">{monthShort}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-500 dark:text-sky-400">{eventItem.category}</span>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-1 cursor-pointer hover:underline" onClick={() => onDetails(eventItem)}>{eventItem.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{eventItem.time} - {eventItem.location}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 flex-grow">{eventItem.description}</p>
        <div className="mt-auto">
          <Button 
            variant={isRegistered ? "secondary" : (isFull ? "secondary" : "primary")} 
            className="w-full"
            onClick={() => !isRegistered && !isFull && onRegister(eventItem.id)}
            disabled={isRegistered || isFull}
          >
            {isRegistered ? 'Registered' : (isFull ? 'Event Full' : 'Register Now')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<{[eventId: string]: 'pending' | 'success' | 'failed' | 'already' | 'full'}>({});


  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await lmsApiService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = useMemo(() => ['All', ...new Set(events.map(e => e.category))], [events]);

  const handleRegister = async (eventId: string) => {
    setRegistrationStatus(prev => ({ ...prev, [eventId]: 'pending' }));
    try {
      const eventToRegister = events.find(e => e.id === eventId);
      if(eventToRegister && eventToRegister.maxAttendees && eventToRegister.registeredUsers.length >= eventToRegister.maxAttendees) {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: 'full' }));
        alert("Sorry, this event is full.");
        return;
      }

      const success = await lmsApiService.registerForEvent(eventId, MOCK_USER_ID);
      if (success) {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: 'success' }));
        // Refresh events or update local state
        const updatedEvents = events.map(e => 
          e.id === eventId ? { ...e, registeredUsers: [...e.registeredUsers, MOCK_USER_ID] } : e
        );
        setEvents(updatedEvents);
        alert("Successfully registered for the event!");
      } else {
         // Check if already registered or other failure
        const event = events.find(e => e.id === eventId);
        if (event?.registeredUsers.includes(MOCK_USER_ID)) {
            setRegistrationStatus(prev => ({ ...prev, [eventId]: 'already' }));
        } else {
            setRegistrationStatus(prev => ({ ...prev, [eventId]: 'failed' }));
            alert("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationStatus(prev => ({ ...prev, [eventId]: 'failed' }));
      alert("An error occurred during registration.");
    }
  };
  
  const handleViewDetails = (eventItem: Event) => {
    setSelectedEvent(eventItem);
    setIsDetailModalOpen(true);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(eventItem =>
      (eventItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       eventItem.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'All' || eventItem.category === selectedCategory)
    ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchTerm, selectedCategory]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner message="Loading events..." /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
           <div>
            <label htmlFor="search-events" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Events</label>
            <input
              type="text"
              id="search-events"
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category-filter-event" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter by Category</label>
            <select
              id="category-filter-event"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <Button variant="primary" onClick={() => alert('Add new event functionality to be implemented.')} className="md:self-end">
            Create New Event
          </Button>
        </div>
      </Card>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(eventItem => {
            const isRegistered = eventItem.registeredUsers.includes(MOCK_USER_ID) || registrationStatus[eventItem.id] === 'success' || registrationStatus[eventItem.id] === 'already';
            const isFull = eventItem.maxAttendees ? eventItem.registeredUsers.length >= eventItem.maxAttendees : false;
            return (
              <EventCardDisplay 
                key={eventItem.id} 
                eventItem={eventItem} 
                onRegister={handleRegister} 
                onDetails={handleViewDetails}
                isRegistered={isRegistered}
                isFull={isFull && !isRegistered} // Only show "Full" if not already registered
              />
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <CalendarDaysIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Events Found</h3>
          <p className="text-slate-500 dark:text-slate-400">There are no upcoming events matching your criteria. Check back soon!</p>
        </Card>
      )}

      {selectedEvent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedEvent.title}
          size="lg"
        >
          <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-64 object-cover rounded-t-lg mb-4" />
          <div className="space-y-3 px-2">
            <p><strong className="text-slate-700 dark:text-slate-200">Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</p>
            <p><strong className="text-slate-700 dark:text-slate-200">Location:</strong> {selectedEvent.location}</p>
            <p><strong className="text-slate-700 dark:text-slate-200">Category:</strong> {selectedEvent.category}</p>
            <p><strong className="text-slate-700 dark:text-slate-200">Organizer:</strong> {selectedEvent.organizer}</p>
            <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{selectedEvent.description}</p>
            <p><strong className="text-slate-700 dark:text-slate-200">Registered:</strong> {selectedEvent.registeredUsers.length}
               {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees}`}
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3 p-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            {!(selectedEvent.registeredUsers.includes(MOCK_USER_ID) || registrationStatus[selectedEvent.id] === 'success') && 
             !(selectedEvent.maxAttendees && selectedEvent.registeredUsers.length >= selectedEvent.maxAttendees) &&
             (
              <Button 
                variant="primary" 
                onClick={() => {
                  handleRegister(selectedEvent.id);
                  // Optionally close modal after attempting registration, or keep open to show status
                  // setIsDetailModalOpen(false); 
                }}
                isLoading={registrationStatus[selectedEvent.id] === 'pending'}
              >
                Register for this event
              </Button>
            )}
            {(selectedEvent.registeredUsers.includes(MOCK_USER_ID) || registrationStatus[selectedEvent.id] === 'success') && (
                <Button variant="secondary" disabled>Already Registered</Button>
            )}
             {(selectedEvent.maxAttendees && selectedEvent.registeredUsers.length >= selectedEvent.maxAttendees && !(selectedEvent.registeredUsers.includes(MOCK_USER_ID) || registrationStatus[selectedEvent.id] === 'success')) && (
                <Button variant="secondary" disabled>Event Full</Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsPage;
