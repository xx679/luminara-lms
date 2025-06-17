import axios from "axios";
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';

const SettingsPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
  avatarUrl: "/default-avatar.png",
  name: "",
  email: "",
  bio: "",
});

  const [notifications, setNotifications] = useState({
    emailNewCourses: true,
    emailEventUpdates: true,
    inAppAnnouncements: true,
  });
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/settings");
        setUserProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } 
    };
    fetchSettings();
  }, []);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Effect to apply theme on initial load
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);


  const handleProfileSave = async () => {
    try {
      const response = await axios.put("http://localhost:5000/settings", userProfile);
      alert(response.data.message);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("更新設定失敗");
    }
  };

  const handleNotificationSave = () => {
    // API call to save notification preferences
    console.log("Saving notifications:", notifications);
    alert("Notification preferences saved (mock)!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Profile Information</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img src={userProfile.avatarUrl} alt="User Avatar" className="w-20 h-20 rounded-full object-cover" />
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
            <input type="text" name="name" id="name" value={userProfile.name} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email Address</label>
            <input type="email" name="email" id="email" value={userProfile.email} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Bio</label>
            <textarea name="bio" id="bio" rows={3} value={userProfile.bio} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"></textarea>
          </div>
          <div className="text-right">
            <Button onClick={handleProfileSave}>Save Profile</Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Notification Preferences</h2>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <label htmlFor={key} className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id={key} name={key} checked={value} onChange={handleNotificationChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
              </label>
            </div>
          ))}
          <div className="text-right pt-2">
            <Button onClick={handleNotificationSave}>Save Notifications</Button>
          </div>
        </div>
      </Card>
      
      {/* Appearance Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Appearance</h2>
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Dark Mode</span>
            <label htmlFor="darkModeToggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="darkModeToggle" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
            </label>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Account</h2>
        <div className="space-y-3">
            <Button variant="outline">Change Password</Button>
            <Button variant="danger">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
