import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Plus, LogOut } from 'lucide-react';
import { authHelpers, contentAPI } from '@/lib/api';

interface Module {
  id: number;
  title: string;
  description?: string;
  iconPath?: string;
  steps: any[];
}

const AuthoringDashboard = () => {
  const navigate = useNavigate();
  const { user } = authHelpers.getAuthData();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authHelpers.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'AUTHOR') {
      navigate('/dashboard');
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        const modulesData = await contentAPI.getModules();
        setModules(modulesData);
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a user and they are an author
    if (user && user.role === 'AUTHOR') {
      fetchModules();
    }
  }, [navigate, user?.role]); // Only depend on role, not the entire user object

  const handleLogout = () => {
    authHelpers.clearAuthData();
    navigate('/login');
  };

  const handleEditModule = (moduleId: number) => {
    // Navigate to module editing view
    navigate(`/authoring/module/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען נתונים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-medium mb-2">שגיאה בטעינת הנתונים</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            נסה שוב
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-turquoise shadow-soft border-b-0 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">ממשק עריכת תוכן</h1>
            <p className="text-white/90">עריכה ויצירת תוכן לקורסי Copilot Inside</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-6 py-4 text-white flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm opacity-90">שלום,</div>
              <div className="font-semibold">{user?.name || 'עורך'}</div>
              <div className="text-sm opacity-90">עורך תוכן</div>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/30 transition-colors"
              title="התנתק"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Actions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-2">ניהול מודולים</h2>
              <p className="text-medium-gray">עריכה ויצירת תוכן למודולי הלמידה</p>
            </div>
            <Button className="bg-gradient-turquoise hover:opacity-90 text-white rounded-3xl px-6 py-3 font-semibold shadow-soft">
              <Plus className="ml-2 h-4 w-4" />
              מודול חדש
            </Button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.id} 
              className="bg-gradient-card shadow-card hover:shadow-xl transition-all duration-300 rounded-3xl border-0 overflow-hidden group"
            >
              <div className="h-32 bg-gradient-turquoise relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 p-6 pb-0">
                  <h3 className="text-xl font-bold text-white drop-shadow mb-2">{module.title}</h3>
                  {module.description && (
                    <p className="text-white/80 text-sm">{module.description}</p>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="bg-white/20 rounded-2xl px-4 py-2">
                    <span className="text-white font-semibold">{module.steps.length} שלבים</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleEditModule(module.id)}
                    className="flex-1 bg-gradient-turquoise hover:opacity-90 text-white rounded-3xl h-12 font-semibold shadow-soft transition-all duration-300"
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    עריכה
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 rounded-3xl h-12 font-semibold border-2 hover:bg-gray-50"
                  >
                    <BookOpen className="ml-2 h-4 w-4" />
                    תצוגה מקדימה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="bg-white rounded-3xl shadow-card border-0 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">אין מודולים זמינים</h3>
            <p className="text-gray-500 mb-6">התחילו ביצירת המודול הראשון שלכם</p>
            <Button className="bg-gradient-turquoise hover:opacity-90 text-white rounded-3xl px-8 py-3 font-semibold shadow-soft">
              <Plus className="ml-2 h-4 w-4" />
              צור מודול חדש
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthoringDashboard;
