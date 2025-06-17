
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { lmsApiService } from '../../services/mockLmsApiService';
import type { ChartDataItem } from '../../types';
import { ChartType } from '../../types';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { BookOpenIcon, UsersIcon, AcademicCapIcon, CalendarDaysIcon } from '../../constants';

interface SummaryStats {
  activeCourses: number;
  totalStudents: number;
  totalTutors: number;
  upcomingEvents: number;
}

const ChartComponent: React.FC<{ title: string; data: ChartDataItem[]; type: ChartType; dataKey?: string }> = ({ title, data, type, dataKey = "value" }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

  return (
    <Card className="p-4 md:p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
      {data.length === 0 ? <div className="flex-grow flex items-center justify-center text-slate-500">No data available</div> :
      <ResponsiveContainer width="100%" height={300}>
        {type === ChartType.BAR && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="name" tick={{ fill: '#64748b' }} className="text-xs dark:fill-slate-400" />
            <YAxis tick={{ fill: '#64748b' }} className="text-xs dark:fill-slate-400" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '0.5rem', borderColor: '#cbd5e1' }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              itemStyle={{ color: '#334155' }}
            />
            <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
            <Bar dataKey={dataKey} fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
        {type === ChartType.LINE && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="name" tick={{ fill: '#64748b' }} className="text-xs dark:fill-slate-400" />
            <YAxis tick={{ fill: '#64748b' }} className="text-xs dark:fill-slate-400" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '0.5rem', borderColor: '#cbd5e1' }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              itemStyle={{ color: '#334155' }}
            />
            <Legend wrapperStyle={{fontSize: "0.8rem"}} />
            <Line type="monotone" dataKey={dataKey} stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        )}
        {type === ChartType.PIE && (
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '0.5rem', borderColor: '#cbd5e1' }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{fontSize: "0.8rem"}} />
          </PieChart>
        )}
      </ResponsiveContainer>
      }
    </Card>
  );
};

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode, bgColorClass: string }> = ({ title, value, icon, bgColorClass }) => (
  <Card className="p-5">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${bgColorClass} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [courseCompletionData, setCourseCompletionData] = useState<ChartDataItem[]>([]);
  const [studentEngagementData, setStudentEngagementData] = useState<ChartDataItem[]>([]);
  const [eventCategoryData, setEventCategoryData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, courseCompRes, studentEngRes, eventsRes] = await Promise.all([
          lmsApiService.getDashboardSummary(),
          lmsApiService.getCourseCompletionData(),
          lmsApiService.getStudentEngagementData(),
          lmsApiService.getEvents() // Using events to create category data
        ]);
        setSummary(summaryRes);
        setCourseCompletionData(courseCompRes);
        setStudentEngagementData(studentEngRes);

        // Process event data for pie chart
        const categoryCounts = eventsRes.reduce((acc, event) => {
          acc[event.category] = (acc[event.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setEventCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({ name, value })));

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner message="Loading dashboard..." /></div>;
  }

  if (!summary) {
    return <div className="text-center text-slate-500">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Active Courses" value={summary.activeCourses} icon={<BookOpenIcon className="w-6 h-6"/>} bgColorClass="bg-sky-500" />
        <SummaryCard title="Total Students" value={summary.totalStudents} icon={<UsersIcon className="w-6 h-6"/>} bgColorClass="bg-emerald-500" />
        <SummaryCard title="Total Tutors" value={summary.totalTutors} icon={<AcademicCapIcon className="w-6 h-6"/>} bgColorClass="bg-amber-500" />
        <SummaryCard title="Upcoming Events" value={summary.upcomingEvents} icon={<CalendarDaysIcon className="w-6 h-6"/>} bgColorClass="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent title="Course Completion Rate (%)" data={courseCompletionData} type={ChartType.BAR} />
        <ChartComponent title="Student Engagement (Weekly Active Users)" data={studentEngagementData} type={ChartType.LINE} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
         <ChartComponent title="Event Categories" data={eventCategoryData} type={ChartType.PIE} />
      </div>

      {/* Placeholder for more sections like Recent Activity, Notifications, etc. */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Recent Activity</h3>
        <ul className="space-y-3">
          <li className="text-sm text-slate-600 dark:text-slate-300">Alice Wonderland enrolled in 'Introduction to Web Development'.</li>
          <li className="text-sm text-slate-600 dark:text-slate-300">New quiz added to 'Advanced Data Science'.</li>
          <li className="text-sm text-slate-600 dark:text-slate-300">Bob The Builder completed 'Module 1: HTML & CSS Basics'.</li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;
