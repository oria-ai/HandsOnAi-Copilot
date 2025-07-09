import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { authHelpers, contentAPI } from '@/lib/api';

interface Module {
  id: number;
  title: string;
  description?: string;
  iconPath?: string;
  steps: Step[];
}

interface Step {
  id: number;
  moduleId: number;
  order: number;
  title: string;
  type: string;
  screens: Screen[];
}

interface Screen {
  screenId: number;
  order: number;
  components: Component[];
}

interface Component {
  componentId: number;
  type: string;
  slot: string;
  content: any;
}

interface VariantContext {
  targetRole?: string;
  targetAiKnowledgeLevel?: number;
  targetCopilotLanguage?: string;
}

const ModuleEditor = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = authHelpers.getAuthData();
  
  const [module, setModule] = useState<Module | null>(null);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [variantContext, setVariantContext] = useState<VariantContext>({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Component content state for editing
  const [componentContent, setComponentContent] = useState<any>({});

  useEffect(() => {
    if (!authHelpers.isAuthenticated() || user?.role !== 'AUTHOR') {
      navigate('/login');
      return;
    }

    const fetchModule = async () => {
      try {
        setLoading(true);
        const moduleData = await contentAPI.getModule(parseInt(moduleId!));
        setModule(moduleData);
        
        // Select first step by default
        if (moduleData.steps && moduleData.steps.length > 0) {
          const firstStep = moduleData.steps[0];
          await selectStep(firstStep.id);
        }
      } catch (err: any) {
        console.error('Error fetching module:', err);
        setError(err.response?.data?.message || 'שגיאה בטעינת המודול');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId, navigate, user]);

  const selectStep = async (stepId: number) => {
    try {
      const stepData = await contentAPI.getStep(stepId);
      setSelectedStep({
        id: stepData.stepId,
        moduleId: parseInt(moduleId!),
        order: 1, // This should come from the step data
        title: stepData.header,
        type: stepData.type,
        screens: stepData.screens
      });
      
      // Select first screen by default
      if (stepData.screens && stepData.screens.length > 0) {
        setSelectedScreen(stepData.screens[0]);
      }
    } catch (err: any) {
      console.error('Error fetching step:', err);
      setError('שגיאה בטעינת השלב');
    }
  };

  const handleComponentEdit = (component: Component) => {
    setSelectedComponent(component);
    setComponentContent(component.content);
    setEditMode(true);
  };

  const handleAddComponent = (slot: string) => {
    const newComponent: Component = {
      componentId: Date.now(), // Temporary ID
      type: 'INSTRUCTIONS',
      slot,
      content: { text: 'תוכן חדש' }
    };
    setSelectedComponent(newComponent);
    setComponentContent(newComponent.content);
    setEditMode(true);
  };

  const handleSaveComponent = async () => {
    if (!selectedComponent || !selectedScreen) return;
    
    try {
      setSaving(true);
      
      let savedComponent;
      
      // Check if this is a new component (temporary ID)
      const isNewComponent = selectedComponent.componentId > 1000000; // Temporary IDs are large numbers
      
      if (isNewComponent) {
        // Create new component
        savedComponent = await contentAPI.createComponent({
          screenId: selectedScreen.screenId,
          componentType: selectedComponent.type,
          slot: selectedComponent.slot,
          defaultContent: componentContent
        });
      } else {
        // Update existing component
        savedComponent = await contentAPI.updateComponent(selectedComponent.componentId, {
          componentType: selectedComponent.type,
          slot: selectedComponent.slot,
          defaultContent: componentContent
        });
      }
      
      // If we have variant context (not default), create/update variant
      const hasVariantContext = variantContext.targetRole || 
                               variantContext.targetAiKnowledgeLevel || 
                               variantContext.targetCopilotLanguage;
      
      if (hasVariantContext) {
        await contentAPI.createOrUpdateVariant({
          componentId: savedComponent.id,
          variantContent: componentContent,
          targetRole: variantContext.targetRole,
          targetAiKnowledgeLevel: variantContext.targetAiKnowledgeLevel,
          targetCopilotLanguage: variantContext.targetCopilotLanguage
        });
      }
      
      // Refresh the step data to get the updated content
      await selectStep(selectedStep!.id);
      
      setEditMode(false);
      setSelectedComponent(null);
      setVariantContext({});
    } catch (err: any) {
      console.error('Error saving component:', err);
      setError(err.response?.data?.error || 'שגיאה בשמירת הרכיב');
    } finally {
      setSaving(false);
    }
  };

  const renderComponentEditor = () => {
    if (!selectedComponent) return null;

    const componentType = selectedComponent.type;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>עריכת רכיב: {componentType}</span>
            <div className="flex gap-2">
              <Button onClick={handleSaveComponent} disabled={saving}>
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'שומר...' : 'שמור'}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                ביטול
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Variant Context Selector */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">הקשר וריאנט</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">תפקיד</label>
                <Select 
                  value={variantContext.targetRole || 'default'} 
                  onValueChange={(value) => setVariantContext(prev => ({ 
                    ...prev, 
                    targetRole: value === 'default' ? undefined : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">ברירת מחדל (כולם)</SelectItem>
                    <SelectItem value="LEARNER">לומד</SelectItem>
                    <SelectItem value="marketing">שיווק</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">רמת ידע AI</label>
                <Select 
                  value={variantContext.targetAiKnowledgeLevel?.toString() || 'default'} 
                  onValueChange={(value) => setVariantContext(prev => ({ 
                    ...prev, 
                    targetAiKnowledgeLevel: value === 'default' ? undefined : parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר רמה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">ברירת מחדל (כולם)</SelectItem>
                    <SelectItem value="1">בסיסי (1)</SelectItem>
                    <SelectItem value="2">בינוני (2)</SelectItem>
                    <SelectItem value="3">מתקדם (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">שפה</label>
                <Select 
                  value={variantContext.targetCopilotLanguage || 'default'} 
                  onValueChange={(value) => setVariantContext(prev => ({ 
                    ...prev, 
                    targetCopilotLanguage: value === 'default' ? undefined : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שפה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">ברירת מחדל (כולם)</SelectItem>
                    <SelectItem value="hebrew">עברית</SelectItem>
                    <SelectItem value="english">אנגלית</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Component Content Editor */}
          <div className="space-y-4">
            {componentType === 'INSTRUCTIONS' && (
              <div>
                <label className="block text-sm font-medium mb-1">טקסט הוראות</label>
                <Textarea
                  value={componentContent.text || ''}
                  onChange={(e) => setComponentContent(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="הכנס את טקסט ההוראות כאן..."
                  rows={4}
                />
              </div>
            )}

            {componentType === 'VIDEO_DISPLAY' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">URL וידאו</label>
                  <Input
                    value={componentContent.videoUrl || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://player.vimeo.com/video/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">כותרת</label>
                  <Input
                    value={componentContent.title || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="כותרת הוידאו"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תיאור</label>
                  <Textarea
                    value={componentContent.description || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור הוידאו"
                    rows={3}
                  />
                </div>
              </>
            )}

            {componentType === 'QUESTION_MULTICHOICE' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">שאלה</label>
                  <Textarea
                    value={componentContent.questionText || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="הכנס את השאלה כאן..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">אפשרויות (אחת בכל שורה)</label>
                  <Textarea
                    value={componentContent.options?.join('\n') || ''}
                    onChange={(e) => setComponentContent(prev => ({ 
                      ...prev, 
                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                    }))}
                    placeholder="אפשרות 1&#10;אפשרות 2&#10;אפשרות 3"
                    rows={4}
                  />
                </div>
              </>
            )}

            {componentType === 'QUESTION_OPEN' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">שאלה</label>
                  <Textarea
                    value={componentContent.questionText || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="הכנס את השאלה כאן..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">טקסט מציין מקום</label>
                  <Input
                    value={componentContent.placeholder || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="הכנס את התשובה כאן..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">פרומפט מערכת לבינה מלאכותית</label>
                  <Textarea
                    value={componentContent.systemPrompt || ''}
                    onChange={(e) => setComponentContent(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="הוראות למערכת הבינה המלאכותית לבדיקת התשובה..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען מודול...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-medium mb-2">שגיאה</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => navigate('/authoring')} className="mt-4">
            חזור לרשימת המודולים
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/authoring')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              חזור
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">עריכת מודול: {module?.title}</h1>
              <p className="text-white/90">עריכה ויצירת תוכן למודול</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? <EyeOff className="w-5 h-5 ml-2" /> : <Eye className="w-5 h-5 ml-2" />}
              {editMode ? 'מצב צפייה' : 'מצב עריכה'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>שלבי המודול</span>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module?.steps.map((step) => (
                    <Button
                      key={step.id}
                      variant={selectedStep?.id === step.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => selectStep(step.id)}
                    >
                      {step.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedStep && selectedScreen && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedStep.title}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף רכיב
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Screen Preview/Edit Area */}
                  <div className="space-y-4">
                    {selectedScreen.components.map((component) => (
                      <div 
                        key={component.componentId} 
                        className={`border rounded-lg p-4 ${editMode ? 'hover:border-blue-500 cursor-pointer' : ''}`}
                        onClick={() => editMode && handleComponentEdit(component)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {component.type} - {component.slot}
                          </span>
                          {editMode && (
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Component Preview */}
                        <div className="bg-gray-50 p-3 rounded">
                          {component.type === 'INSTRUCTIONS' && (
                            <p>{component.content.text}</p>
                          )}
                          {component.type === 'VIDEO_DISPLAY' && (
                            <div>
                              <h4 className="font-semibold">{component.content.title}</h4>
                              <p className="text-sm text-gray-600">{component.content.description}</p>
                              <p className="text-xs text-blue-600">{component.content.videoUrl}</p>
                            </div>
                          )}
                          {component.type === 'QUESTION_MULTICHOICE' && (
                            <div>
                              <p className="font-medium">{component.content.questionText}</p>
                              <ul className="mt-2 space-y-1">
                                {component.content.options?.map((option: string, idx: number) => (
                                  <li key={idx} className="text-sm">• {option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {component.type === 'QUESTION_OPEN' && (
                            <div>
                              <p className="font-medium">{component.content.questionText}</p>
                              <p className="text-sm text-gray-500 mt-1">{component.content.placeholder}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Component Buttons */}
                    {editMode && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-gray-500 mb-4">הוסף רכיב חדש</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddComponent('main_content')}
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            הוראות
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const newComponent: Component = {
                                componentId: Date.now(),
                                type: 'VIDEO_DISPLAY',
                                slot: 'main_content',
                                content: { videoUrl: '', title: '', description: '' }
                              };
                              setSelectedComponent(newComponent);
                              setComponentContent(newComponent.content);
                              setEditMode(true);
                            }}
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            וידאו
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const newComponent: Component = {
                                componentId: Date.now(),
                                type: 'QUESTION_MULTICHOICE',
                                slot: 'main_content',
                                content: { questionText: '', options: [] }
                              };
                              setSelectedComponent(newComponent);
                              setComponentContent(newComponent.content);
                              setEditMode(true);
                            }}
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            שאלה רב ברירה
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const newComponent: Component = {
                                componentId: Date.now(),
                                type: 'QUESTION_OPEN',
                                slot: 'main_content',
                                content: { questionText: '', placeholder: '', systemPrompt: '' }
                              };
                              setSelectedComponent(newComponent);
                              setComponentContent(newComponent.content);
                              setEditMode(true);
                            }}
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            שאלה פתוחה
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Component Editor */}
            {editMode && selectedComponent && renderComponentEditor()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleEditor;
