import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { authHelpers, authAPI } from '@/lib/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: '',
    copilotLanguage: '',
    aiKnowledgeLevel: 1,
    role: 'LEARNER',
    name: ''
  });
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authHelpers.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signup') {
        const { token, user } = await authAPI.register(formData);
        authHelpers.setAuthData(token, user);
        navigate('/dashboard');
      } else {
        const { token, user } = await authAPI.login(formData.email, formData.password);
        authHelpers.setAuthData(token, user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative" dir="rtl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: '0.8',
          filter: 'brightness(1.2)'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex w-full md:w-1/2 justify-center items-center min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#00A3D5] to-[#00C49A] bg-clip-text text-transparent">
                Copilot Inside
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={tab} onValueChange={v => setTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup">הרשמה</TabsTrigger>
                  <TabsTrigger value="signin">התחברות</TabsTrigger>
                </TabsList>
                
                {error && (
                  <div className="text-red-500 text-center mb-4 p-2 bg-red-50 rounded">
                    {error}
                  </div>
                )}
                
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-email">אימייל</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor="signup-password">סיסמה</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor="name">שם</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="text-right"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor="department">מחלקה</Label>
                      <Select onValueChange={(value) => handleInputChange('department', value)} disabled={loading}>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="בחר מחלקה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">פיתוח</SelectItem>
                          <SelectItem value="management">מנהלים</SelectItem>
                          <SelectItem value="digital">דיגיטל</SelectItem>
                          <SelectItem value="finance">כספים</SelectItem>
                          <SelectItem value="marketing">שיווק</SelectItem>
                          <SelectItem value="hr">משאבי אנוש</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2 text-right">
                        <Label htmlFor="copilot-language">שפת Copilot</Label>
                        <Select onValueChange={(value) => handleInputChange('copilotLanguage', value)} disabled={loading}>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר שפה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hebrew">עברית</SelectItem>
                            <SelectItem value="english">אנגלית</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1 space-y-2 text-right">
                        <Label htmlFor="ai-knowledge">רמת ידע ב-AI</Label>
                        <Select onValueChange={(value) => handleInputChange('aiKnowledgeLevel', parseInt(value))} disabled={loading}>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר רמה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">מתחיל</SelectItem>
                            <SelectItem value="2">בינוני</SelectItem>
                            <SelectItem value="3">מתקדם</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        className="w-[60%] bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'נרשם...' : 'הירשם'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-right"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor="password">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="text-right"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        className="w-[60%] bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'מתחבר...' : 'התחבר'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Right Side - Logo */}
      <div className="relative z-10 w-full md:w-1/2 h-[40vh] md:h-screen flex items-center justify-center">
        <img
          src="/squarelogo.png"
          alt="Copilot Inside Logo"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};

export default Login;
