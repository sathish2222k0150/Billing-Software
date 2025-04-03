import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { tabs, defaultSettings } from './Sidebar';
import Sidebar from '../Sidebar'; // Make sure to import the Sidebar component
import {
  BusinessProfileTab,
  BillingTab,
  ShippingTab,
  LegalTab,
  AppearanceTab,
  HelpTab,
  TeamTab,
  SecurityTab
} from './SettingsTab';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState(defaultSettings);
  const [currentPage] = useState("Settings"); // Changed to "Settings" since this is the settings page

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' : 
      settings.fontSize === 'large' ? '18px' : '16px';
  }, [settings.fontSize]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'business':
        return <BusinessProfileTab settings={settings} handleChange={handleChange} />;
      case 'billing':
        return <BillingTab settings={settings} handleChange={handleChange} />;
      case 'shipping':
        return <ShippingTab settings={settings} handleChange={handleChange} />;
      case 'legal':
        return <LegalTab settings={settings} handleChange={handleChange} />;
      case 'appearance':
        return <AppearanceTab settings={settings} handleChange={handleChange} setSettings={setSettings} />;
      case 'help':
        return <HelpTab />;
      case 'team':
        return <TeamTab />;
      case 'security':
        return <SecurityTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar Navigation */}
              <div className="md:w-64 bg-gray-50 dark:bg-gray-900 p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderTabContent(activeTab)}
                  
                  {/* Save Button - Fixed at the bottom */}
                  <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 md:p-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">All changes are saved automatically</span>
                      </div>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="h-5 w-5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;