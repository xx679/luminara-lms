
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { Course, CourseModule, VideoResource, PodcastResource, Quiz, DiscussionThread, DiscussionReply, QuizQuestion } from '../../types';
import { GeminiInteractionType } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { getGeminiTextResponse } from '../../services/geminiService';
import { PlayCircleIcon, MicrophoneIcon, QuestionMarkCircleIcon, ChatBubbleLeftEllipsisIcon, SparklesIcon, ChevronDownIcon, ChevronRightIcon, StarIcon, UsersIcon, BookOpenIcon, AcademicCapIcon } from '../../constants';

// Individual content type components (simplified)
const VideoPlayer: React.FC<{ video: VideoResource }> = ({ video }) => (
  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg">
    <iframe
      width="100%"
      height="100%"
      src={video.url.includes("embed") ? video.url : `https://www.youtube.com/embed/${video.url.split('v=')[1]}`} // Basic embed logic
      title={video.title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
    <p className="p-2 text-sm text-center text-white bg-slate-800">{video.title} ({video.duration})</p>
  </div>
);

const PodcastPlayer: React.FC<{ podcast: PodcastResource }> = ({ podcast }) => (
  <Card className="p-4 bg-slate-700 text-white">
    <h4 className="text-lg font-semibold mb-2">{podcast.title} ({podcast.duration})</h4>
    <audio controls src={podcast.audioUrl} className="w-full">Your browser does not support the audio element.</audio>
  </Card>
);

const QuizView: React.FC<{ quiz: Quiz; courseId: string; moduleId: string; onSubmitSuccess: (score: number, total:number) => void }> = ({ quiz, courseId, moduleId, onSubmitSuccess }) => {
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await lmsApiService.submitQuiz(courseId, moduleId, quiz.id, answers);
      onSubmitSuccess(result.score, result.totalQuestions);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">{quiz.title}</h3>
      {quiz.questions.map((q, index) => (
        <div key={q.id} className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="font-medium mb-2 text-slate-700 dark:text-slate-200">{index + 1}. {q.text}</p>
          <div className="space-y-2">
            {q.options.map(opt => (
              <label key={opt.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleOptionChange(q.id, opt.id)}
                  className="form-radio h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                />
                <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} isLoading={submitting} disabled={Object.keys(answers).length !== quiz.questions.length}>
        Submit Quiz
      </Button>
    </Card>
  );
};

const DiscussionForum: React.FC<{ 
  threads: DiscussionThread[]; 
  courseId: string; 
  onAddReply: (discussionId: string, replyText: string) => Promise<boolean>;
  currentUser: {id: string, name: string, avatarUrl: string}; // Simplified current user
}> = ({ threads, courseId, onAddReply, currentUser }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handlePostReply = async (threadId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    const success = await onAddReply(threadId, replyText);
    if(success) {
      setReplyText("");
      setReplyingTo(null);
    }
    setIsSubmittingReply(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Discussions</h3>
      {threads.length === 0 && <p className="text-slate-500 dark:text-slate-400">No discussions yet for this course.</p>}
      {threads.map(thread => (
        <Card key={thread.id} className="p-4">
          <div className="flex items-start space-x-3">
            <img src={thread.authorAvatar || `https://picsum.photos/seed/${thread.authorId}/50/50`} alt={thread.authorName} className="w-10 h-10 rounded-full" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">{thread.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">By {thread.authorName} on {new Date(thread.timestamp).toLocaleDateString()}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{thread.initialPost}</p>
              {thread.tags && thread.tags.length > 0 && (
                <div className="mt-2 space-x-2">
                  {thread.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200 rounded-full">{tag}</span>)}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pl-10 space-y-3">
            {thread.replies.map(reply => (
              <div key={reply.id} className="flex items-start space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <img src={reply.userAvatar || `https://picsum.photos/seed/${reply.userId}/40/40`} alt={reply.userName} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{reply.userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(reply.timestamp).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{reply.text}</p>
                </div>
              </div>
            ))}
            {replyingTo === thread.id ? (
              <div className="mt-2">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 dark:text-slate-50"
                  rows={3}
                />
                <div className="mt-2 space-x-2">
                  <Button size="sm" onClick={() => handlePostReply(thread.id)} isLoading={isSubmittingReply}>Post Reply</Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { setReplyingTo(thread.id); setReplyText(''); }}>Reply to this thread</Button>
            )}
          </div>
        </Card>
      ))}
       {/* TODO: Add new thread form */}
    </div>
  );
};


const ModuleAccordion: React.FC<{ module: CourseModule; courseId: string; onQuizSubmitSuccess: (score: number, total:number) => void; onContentSelect: (type: 'video' | 'podcast' | 'quiz' | 'discussion', content: any) => void; expanded: boolean; onToggle: () => void }> = ({ module, courseId, onQuizSubmitSuccess, onContentSelect, expanded, onToggle }) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{module.title}</h3>
        {expanded ? <ChevronDownIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /> : <ChevronRightIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{module.description}</p>
          {module.videos?.map(v => <Button variant="ghost" className="w-full justify-start" key={v.id} onClick={() => onContentSelect('video', v)} leftIcon={<PlayCircleIcon className="w-5 h-5"/>}>{v.title}</Button>)}
          {module.podcasts?.map(p => <Button variant="ghost" className="w-full justify-start" key={p.id} onClick={() => onContentSelect('podcast', p)} leftIcon={<MicrophoneIcon className="w-5 h-5"/>}>{p.title}</Button>)}
          {module.quizzes?.map(q => <Button variant="ghost" className="w-full justify-start" key={q.id} onClick={() => onContentSelect('quiz', q)} leftIcon={<QuestionMarkCircleIcon className="w-5 h-5"/>}>{q.title}</Button>)}
          {module.readingMaterials?.map(r => <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 text-sky-600 dark:text-sky-400 hover:underline"><BookOpenIcon className="w-5 h-5 mr-2"/>{r.title} ({r.format})</a>)}
        </div>
      )}
    </Card>
  );
};

const CourseDetailView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'discussions' | 'instructor'>('overview');
  
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedContentType, setSelectedContentType] = useState<'video' | 'podcast' | 'quiz' | null>(null);

  const [quizResultModalOpen, setQuizResultModalOpen] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });

  const [aiHelperModalOpen, setAiHelperModalOpen] = useState(false);
  const [aiContextText, setAiContextText] = useState("");
  const [aiInteractionType, setAiInteractionType] = useState<GeminiInteractionType>(GeminiInteractionType.EXPLAIN);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  
  const MOCK_CURRENT_USER = { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://picsum.photos/seed/user1/50/50'};


  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lmsApiService.getCourseById(courseId);
      if (data) {
        setCourse(data);
        // Auto-expand first module if available
        if (data.modules && data.modules.length > 0) {
          setExpandedModule(data.modules[0].id);
        }
      } else {
        setError("Course not found.");
      }
    } catch (err) {
      console.error("Failed to fetch course details:", err);
      setError("Failed to load course details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleQuizSubmitSuccess = (score: number, total: number) => {
    setQuizScore({ score, total });
    setQuizResultModalOpen(true);
    setSelectedContent(null); // Clear quiz view
    setSelectedContentType(null);
  };

  const handleContentSelect = (type: 'video' | 'podcast' | 'quiz', content: any) => {
    setSelectedContentType(type);
    setSelectedContent(content);
    setActiveTab('content'); // Switch to content tab when content is selected
  };
  
  const handleToggleModule = (moduleId: string) => {
    setExpandedModule(prev => prev === moduleId ? null : moduleId);
  };

  const handleAddReply = async (discussionId: string, replyText: string): Promise<boolean> => {
      if (!course || !course.discussions) return false;
      const newReply = await lmsApiService.addDiscussionReply(course.id, discussionId, {
        userId: MOCK_CURRENT_USER.id,
        userName: MOCK_CURRENT_USER.name,
        userAvatar: MOCK_CURRENT_USER.avatarUrl,
        text: replyText,
      });
      if (newReply) {
        // Optimistically update UI or re-fetch for simplicity
        fetchCourseData(); // Re-fetch to update discussion
        return true;
      }
      return false;
  };

  const openAiHelper = (type: GeminiInteractionType, context: string) => {
    setAiInteractionType(type);
    setAiContextText(context);
    setAiResponse("");
    setAiHelperModalOpen(true);
  };

  const handleGetAiHelp = async () => {
    setAiLoading(true);
    setAiResponse("");
    const response = await getGeminiTextResponse(aiInteractionType, aiContextText, "You are a helpful learning assistant.");
    setAiResponse(response);
    setAiLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Loading course details..." /></div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!course) return <div className="text-center text-slate-500 p-8">Course data is unavailable.</div>;

  const tabs = [
    { name: 'Overview', id: 'overview' as const },
    { name: 'Course Content', id: 'content' as const },
    { name: 'Discussions', id: 'discussions' as const },
    { name: 'Instructor', id: 'instructor' as const },
  ];

  return (
    <div className="container mx-auto">
      {/* Course Header */}
      <Card className="mb-6 p-6 md:flex md:items-center md:space-x-6 bg-gradient-to-r from-sky-600 to-cyan-500 text-white dark:from-sky-700 dark:to-cyan-600">
        <img src={course.imageUrl} alt={course.title} className="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-lg mb-4 md:mb-0" />
        <div className="md:w-2/3">
          <p className="text-sm uppercase tracking-wider text-sky-200 dark:text-sky-300">{course.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold my-2">{course.title}</h1>
          <p className="text-lg text-sky-100 dark:text-sky-200 mb-3">{course.tagline}</p>
          <div className="flex items-center space-x-4 text-sm mb-3">
            <span className="flex items-center"><StarIcon className="w-5 h-5 mr-1 text-amber-300"/> {course.rating.toFixed(1)}/5.0</span>
            <span className="flex items-center"><UsersIcon className="w-5 h-5 mr-1"/> {course.studentsEnrolled} students</span>
            <span className="flex items-center"><BookOpenIcon className="w-5 h-5 mr-1"/> {course.modules.length} modules</span>
          </div>
          <p className="text-xs">Last updated: {new Date(course.lastUpdated).toLocaleDateString()}</p>
          <Button 
            variant="secondary" 
            className="mt-4 bg-white text-sky-600 hover:bg-sky-50 dark:bg-slate-100 dark:text-sky-700 dark:hover:bg-sky-200"
            onClick={() => openAiHelper(GeminiInteractionType.SUMMARIZE, `Course title: ${course.title}\nDescription: ${course.description}`)}
            leftIcon={<SparklesIcon className="w-5 h-5" />}
          >
            AI: Summarize Course
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-300'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2"> {/* Main content area */}
          {activeTab === 'overview' && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100">About this course</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{course.description}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4"
                onClick={() => openAiHelper(GeminiInteractionType.EXPLAIN, course.description)}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
              >
                AI: Explain Concepts
              </Button>
            </Card>
          )}

          {activeTab === 'content' && (
             <div className="space-y-6">
              {selectedContent && (
                <Card className="p-4 mb-6 sticky top-20 z-10"> {/* Sticky player/quiz */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {selectedContentType === 'video' && 'Now Playing:'}
                      {selectedContentType === 'podcast' && 'Now Listening:'}
                      {selectedContentType === 'quiz' && 'Current Quiz:'}
                      {' '}{selectedContent.title}
                    </h3>
                     <Button variant="ghost" size="sm" onClick={() => { setSelectedContent(null); setSelectedContentType(null); }}>
                        Close Viewer
                     </Button>
                  </div>
                  {selectedContentType === 'video' && <VideoPlayer video={selectedContent as VideoResource} />}
                  {selectedContentType === 'podcast' && <PodcastPlayer podcast={selectedContent as PodcastResource} />}
                  {selectedContentType === 'quiz' && <QuizView quiz={selectedContent as Quiz} courseId={course.id} moduleId={course.modules.find(m => m.quizzes?.some(q => q.id === (selectedContent as Quiz).id))?.id || ''} onSubmitSuccess={handleQuizSubmitSuccess} />}
                </Card>
              )}
               <h2 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Course Modules</h2>
               {course.modules.length === 0 && <p className="text-slate-500 dark:text-slate-400">No modules available for this course yet.</p>}
               {course.modules.map(module => (
                 <ModuleAccordion 
                   key={module.id} 
                   module={module} 
                   courseId={course.id} 
                   onQuizSubmitSuccess={handleQuizSubmitSuccess}
                   onContentSelect={handleContentSelect}
                   expanded={expandedModule === module.id}
                   onToggle={() => handleToggleModule(module.id)}
                 />
               ))}
             </div>
          )}

          {activeTab === 'discussions' && (
            <DiscussionForum 
              threads={course.discussions || []} 
              courseId={course.id}
              onAddReply={handleAddReply}
              currentUser={MOCK_CURRENT_USER}
            />
          )}
          
          {activeTab === 'instructor' && course.instructorId && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">About Your Instructor</h2>
              {/* This would typically fetch tutor details. For now, use course.instructorName */}
              <div className="flex items-center space-x-4">
                <img src={`https://picsum.photos/seed/${course.instructorId}/100/100`} alt={course.instructorName} className="w-20 h-20 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-sky-600 dark:text-sky-400">{course.instructorName}</h3>
                  {/* Placeholder for tutor bio */}
                  <p className="text-sm text-slate-500 dark:text-slate-400">Expert in {course.category}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                {/* Placeholder for actual tutor bio. For now, a generic message or find from mockTutors */}
                More information about {course.instructorName} will be available here. They are an experienced professional dedicated to helping you learn.
              </p>
               <Button 
                variant="outline" 
                size="sm"
                className="mt-4"
                // Example of using AI to ask a question related to the instructor or course.
                onClick={() => openAiHelper(GeminiInteractionType.ASK_QUESTION, `I am taking the course "${course.title}" by ${course.instructorName}. What is a good question to ask them about their expertise in ${course.category}?`)}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
              >
                AI: Suggest question for instructor
              </Button>
            </Card>
          )}
        </div>

        <aside className="md:col-span-1 space-y-6"> {/* Sidebar for course details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">Course Details</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Level:</strong> {course.level}</li>
              <li><strong>Duration:</strong> {course.duration}</li>
              <li><strong>Modules:</strong> {course.modules.length}</li>
              <li><strong>Category:</strong> {course.category}</li>
              {course.price && <li><strong>Price:</strong> ${course.price.toFixed(2)}</li>}
            </ul>
            <Button variant="primary" className="w-full mt-4">Enroll Now</Button>
          </Card>
          {/* You could add related courses or instructor's other courses here */}
        </aside>
      </div>


      {/* Quiz Result Modal */}
      <Modal isOpen={quizResultModalOpen} onClose={() => setQuizResultModalOpen(false)} title="Quiz Result">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Congratulations!</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">You scored <strong className="text-sky-600 dark:text-sky-400">{quizScore.score}</strong> out of <strong className="text-sky-600 dark:text-sky-400">{quizScore.total}</strong>.</p>
          {quizScore.score / quizScore.total >= 0.8 ? 
            <p className="mt-3 text-emerald-600 dark:text-emerald-400">Great job! You passed.</p> :
            <p className="mt-3 text-amber-600 dark:text-amber-400">Good effort! Review the material and try again.</p>
          }
        </div>
      </Modal>

      {/* AI Helper Modal */}
      <Modal isOpen={aiHelperModalOpen} onClose={() => setAiHelperModalOpen(false)} title="AI Learning Assistant" size="lg">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            <strong>Context:</strong> 
            <span className="ml-1 italic line-clamp-2" title={aiContextText}>{aiContextText}</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            <strong>Action:</strong> 
            <span className="ml-1 capitalize">{aiInteractionType.replace('_', ' ')}</span>
          </p>
          
          <Button onClick={handleGetAiHelp} isLoading={aiLoading} disabled={aiLoading} className="mb-4" leftIcon={<SparklesIcon className="w-5 h-5"/>}>
            {aiLoading ? "Thinking..." : "Get AI Insight"}
          </Button>

          {aiLoading && <LoadingSpinner message="AI is processing your request..." />}
          
          {aiResponse && (
            <Card className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 max-h-96 overflow-y-auto">
              <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">AI Response:</h4>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{aiResponse}</pre>
            </Card>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailView;
