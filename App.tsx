import React, { useState, useEffect, useRef } from 'react';
import { Camera, Bell, Home, Plus, Search, Trash2, Edit3, ChevronRight, Package, Apple, AlertCircle, X, CheckCircle, ArrowLeft, Image as ImageIcon, Aperture } from 'lucide-react';
import { Item, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisView from './components/AnalysisView';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Core state for items
  const [items, setItems] = useState<Item[]>([]);
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // New Item State
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    category: 'food',
    expiryDate: '',
    notifyDays: 1,
    description: '',
    image: '📦',
    coverImage: null
  });

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success'>('idle');

  const emojiList = ['📦', '🍎', '🥛', '🍞', '🥤', '💊', '🧴', '🧼', '🧽', '🧹', 
                     '🥩', '🥓', '🍗', '🍖', '🧀', '🥚', '🍅', '🥒', '🥕', '🌽',
                     '🍊', '🍋', '🍌', '🍇', '🍓', '🫐', '🥝', '🍑', '🥥', '🥑'];

  // Load items from local storage
  useEffect(() => {
    const saved = localStorage.getItem('freshsnap_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load items", e);
      }
    }
  }, []);

  // Save items to local storage
  useEffect(() => {
    localStorage.setItem('freshsnap_items', JSON.stringify(items));
  }, [items]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const translations = {
    zh: {
      appName: 'FreshSnap',
      subtitle: '智能管理，不再浪费',
      home: '首页',
      camera: '拍照',
      notifications: '提醒',
      expiring: '即将过期',
      total: '总物品数',
      urgentAlert: '紧急提醒',
      urgentMessage: '件物品即将过期，请及时处理！',
      myItems: '我的物品',
      viewAll: '查看全部',
      food: '食品',
      daily: '日用品',
      all: '全部',
      days: '天',
      expiryDate: '到期',
      scanToAdd: '拍照识别',
      scanDescription: '对准物品包装上的日期信息拍照\nAI将自动识别并录入系统',
      openCamera: '打开相机',
      uploadGallery: '从相册上传',
      manualAdd: '手动添加',
      notificationSettings: '提醒设置',
      enableNotification: '启用通知',
      receiveReminders: '接收过期提醒',
      defaultTime: '默认提醒时间',
      advanceNotice: '提前提醒天数',
      recentNotifications: '最近提醒',
      expiringIn: '还剩',
      today: '今天',
      addNewItem: '添加新物品',
      itemName: '物品名称',
      enterName: '请输入物品名称',
      category: '分类',
      description: '描述',
      enterDescription: '请输入物品描述（可选）',
      notifyDaysBefore: '提前提醒（天）',
      cancel: '取消',
      save: '保存',
      search: '搜索',
      searchPlaceholder: '搜索物品名称...',
      language: '语言',
      editItem: '编辑物品',
      feedback: '反馈建议',
      privacyPolicy: '隐私政策',
      version: '版本',
      sendFeedback: '发送反馈',
      feedbackPlaceholder: '请告诉我们您的建议或遇到的问题...',
      feedbackSuccess: '感谢您的反馈！',
      feedbackThanks: '我们会认真阅读您的每一条建议。',
      privacyTitle: '隐私政策',
      privacyContent: '我们重视您的隐私。所有数据仅存储在您的设备本地，不会上传到任何服务器。',
      otherSettings: '其他设置',
      clear: '清除',
      takePhoto: '拍照'
    },
    en: {
      appName: 'FreshSnap',
      subtitle: 'Smart Management, No Waste',
      home: 'Home',
      camera: 'Camera',
      notifications: 'Alerts',
      expiring: 'Expiring Soon',
      total: 'Total Items',
      urgentAlert: 'Urgent Alert',
      urgentMessage: 'items expiring soon. Please handle them!',
      myItems: 'My Items',
      viewAll: 'View All',
      food: 'Food',
      daily: 'Daily',
      all: 'All',
      days: 'Days',
      expiryDate: 'Expires',
      scanToAdd: 'Scan to Add',
      scanDescription: 'Point camera at expiry date on packaging\nAI will automatically recognize and record',
      openCamera: 'Open Camera',
      uploadGallery: 'Upload from Gallery',
      manualAdd: 'Add Manually',
      notificationSettings: 'Notification Settings',
      enableNotification: 'Enable Notifications',
      receiveReminders: 'Receive expiry reminders',
      defaultTime: 'Default Reminder Time',
      advanceNotice: 'Advance Notice Days',
      recentNotifications: 'Recent Notifications',
      expiringIn: 'Days left',
      today: 'Today',
      addNewItem: 'Add New Item',
      itemName: 'Item Name',
      enterName: 'Enter item name',
      category: 'Category',
      description: 'Description',
      enterDescription: 'Enter description (optional)',
      notifyDaysBefore: 'Notify Days Before',
      cancel: 'Cancel',
      save: 'Save',
      search: 'Search',
      searchPlaceholder: 'Search items...',
      language: 'Language',
      editItem: 'Edit Item',
      feedback: 'Feedback',
      privacyPolicy: 'Privacy Policy',
      version: 'Version',
      sendFeedback: 'Send Feedback',
      feedbackPlaceholder: 'Please tell us your suggestions or issues...',
      feedbackSuccess: 'Thank you for your feedback!',
      feedbackThanks: 'We will carefully read every suggestion.',
      privacyTitle: 'Privacy Policy',
      privacyContent: 'We value your privacy. All data is stored locally on your device and never uploaded to any server.',
      otherSettings: 'Other Settings',
      clear: 'Clear',
      takePhoto: 'Take Photo'
    }
  };

  const t = translations[language];

  // Helper to calculate days left
  const getDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0,0,0,0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCategoryColor = (category: string) => {
    return category === 'food' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600';
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-gray-100 border-gray-300 opacity-70'; // Expired
    if (daysLeft <= 1) return 'bg-red-50 border-red-200';
    if (daysLeft <= 3) return 'bg-orange-50 border-orange-200';
    return 'bg-green-50 border-green-200';
  };

  const getUrgencyBadge = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-gray-500 text-white';
    if (daysLeft <= 1) return 'bg-red-500 text-white';
    if (daysLeft <= 3) return 'bg-orange-500 text-white';
    return 'bg-green-500 text-white';
  };

  const deleteItem = (id: string | number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItem.name || !newItem.expiryDate) return;
    
    // Generate simple ID if not present
    const newId = editingItem ? editingItem.id : Date.now().toString();
    
    const itemToSave: Item = {
      id: newId,
      name: newItem.name,
      expiryDate: newItem.expiryDate,
      category: newItem.category as any,
      description: newItem.description,
      image: newItem.image || '📦',
      coverImage: newItem.coverImage,
      notifyDays: newItem.notifyDays || 1,
      addedDate: editingItem ? editingItem.addedDate : new Date().toISOString()
    };
    
    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? itemToSave : item));
    } else {
      setItems([...items, itemToSave]);
    }
    
    setShowAddForm(false);
    setEditingItem(null);
    setNewItem({
      name: '',
      category: 'food',
      expiryDate: '',
      notifyDays: 1,
      description: '',
      image: '📦',
      coverImage: null
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewItem({...newItem, coverImage: event.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CAMERA LOGIC ---

  const startCamera = async () => {
    try {
      // Use environment facing camera (rear)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setIsCameraOpen(true);
      // Wait a tick for the video element to be mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera Error:", err);
      // Fallback to file input if camera fails
      document.getElementById('hidden-file-input')?.click();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        processImageAnalysis(base64);
      }
    }
  };

  // --- AI ANALYSIS LOGIC ---

  const processImageAnalysis = async (base64String: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeImage(base64String);
      setAnalysisResult(result);
    } catch (error) {
      alert("Could not analyze image. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      processImageAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  const confirmAnalysisItems = (aiItems: any[]) => {
    const newItems: Item[] = aiItems.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      expiryDate: item.expiryDate || new Date().toISOString().split('T')[0],
      category: item.category === 'food' ? 'food' : 'daily', // map generic types to basic categories
      description: item.reasoning,
      image: item.category === 'food' ? '🍎' : '📦',
      addedDate: new Date().toISOString(),
      notifyDays: 1
    }));

    setItems(prev => [...prev, ...newItems]);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setCurrentView('home');
  };

  // Filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate items expiring soon (<= 3 days)
  const expiringSoonCount = items.filter(i => {
    const days = getDaysLeft(i.expiryDate);
    return days >= 0 && days <= 3;
  }).length;

  const HomeView = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            categoryFilter === 'all' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          {t.all}
        </button>
        <button 
          onClick={() => setCategoryFilter('food')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            categoryFilter === 'food' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          <Apple className="w-4 h-4 inline mr-1" />
          {t.food}
        </button>
        <button 
          onClick={() => setCategoryFilter('daily')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            categoryFilter === 'daily' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1" />
          {t.daily}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">{t.expiring}</div>
          <div className="text-3xl font-bold">
            {expiringSoonCount}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">{t.total}</div>
          <div className="text-3xl font-bold">{items.length}</div>
        </div>
      </div>

      {/* Urgent Alert */}
      {expiringSoonCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-900">{t.urgentAlert}</span>
          </div>
          <p className="text-sm text-red-700">
            {language === 'zh' ? '有 ' : ''}{expiringSoonCount} {t.urgentMessage}
          </p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3 pb-20">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{t.myItems}</h3>
          <button className="text-blue-600 text-sm font-medium">{t.viewAll}</button>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>{language === 'zh' ? '暂无物品' : 'No items found'}</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const daysLeft = getDaysLeft(item.expiryDate);
            return (
              <div 
                key={item.id}
                className={`${getUrgencyColor(daysLeft)} border-2 rounded-2xl p-4 transition-all hover:shadow-md bg-white`}
              >
                <div className="flex items-start gap-3">
                  {item.coverImage ? (
                    <img 
                      src={item.coverImage} 
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="text-4xl flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl">{item.image}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                        )}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${getCategoryColor(item.category)}`}>
                          {item.category === 'food' ? t.food : t.daily}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getUrgencyBadge(daysLeft)}`}>
                        {daysLeft < 0 ? 'Expired' : `${daysLeft} ${t.days}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {t.expiryDate}: {item.expiryDate}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setNewItem(item);
                            setShowAddForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const CameraView = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
        <Camera className="w-16 h-16 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.scanToAdd}</h3>
      <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
        {t.scanDescription}
      </p>
      
      {/* Primary Action: Open Native Camera UI */}
      <button 
        onClick={startCamera}
        className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-3"
      >
        <Aperture size={20} />
        {t.openCamera}
      </button>

      {/* Secondary Action: Upload from Gallery (Hidden input trigger) */}
      <label className="w-full max-w-xs cursor-pointer mb-3">
        <input 
          id="hidden-file-input"
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />
        <div className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
          <ImageIcon size={20} />
          {t.uploadGallery}
        </div>
      </label>

      {/* Tertiary Action: Manual Add */}
      <button 
        onClick={() => {
          setShowAddForm(true);
          setEditingItem(null);
          setNewItem({
            name: '',
            category: 'food',
            expiryDate: '',
            notifyDays: 1,
            description: '',
            image: '📦',
            coverImage: null
          });
        }}
        className="w-full max-w-xs bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        <Edit3 size={20} />
        {t.manualAdd}
      </button>
    </div>
  );

  // Render Live Camera Overlay
  const renderCameraOverlay = () => {
    if (!isCameraOpen) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Camera Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={stopCamera} className="text-white p-2">
            <X size={28} />
          </button>
        </div>
        
        {/* Video Feed */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Guide Box */}
          <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative z-10">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg"></div>
          </div>
        </div>
        
        {/* Camera Controls */}
        <div className="h-32 bg-black flex items-center justify-center gap-8 pb-8">
          <button 
             onClick={stopCamera} 
             className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700"
          >
             <X size={20} />
          </button>
          
          <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
          
          <button 
             onClick={() => document.getElementById('hidden-file-input')?.click()} 
             className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700"
          >
             <ImageIcon size={20} />
          </button>
        </div>
      </div>
    );
  };

  const NotificationsView = () => (
    <div className="space-y-4 pb-20">
      <h3 className="font-semibold text-gray-900 mb-4">{t.notificationSettings}</h3>
      
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setNotificationEnabled(!notificationEnabled)}
        >
          <div>
            <p className="font-medium text-gray-900">{t.enableNotification}</p>
            <p className="text-sm text-gray-500">{t.receiveReminders}</p>
          </div>
          <div className={`w-14 h-8 rounded-full relative transition-all ${
            notificationEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
              notificationEnabled ? 'right-1' : 'left-1'
            }`}></div>
          </div>
        </div>
        
        <div 
          className="border-t border-gray-100 pt-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-3 rounded-xl transition-all"
          onClick={() => setShowTimeSettings(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-gray-900">{t.defaultTime}</p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{language === 'zh' ? '每天' : 'Daily'} {notificationTime}</p>
        </div>
        
        <div 
          className="border-t border-gray-100 pt-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-3 rounded-xl transition-all"
          onClick={() => setShowAdvancedSettings(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-gray-900">{t.advanceNotice}</p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {language === 'zh' 
              ? `食品: 1天 / 日用品: 7天` 
              : `Food: 1 day / Daily: 7 days`}
          </p>
        </div>
      </div>

      {/* Other Settings */}
      <h3 className="font-semibold text-gray-900 mt-6 mb-4">{t.otherSettings}</h3>
      
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all border-b border-gray-100"
          onClick={() => setShowFeedback(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900">{t.feedback}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all border-b border-gray-100"
          onClick={() => setShowPrivacy(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-medium text-gray-900">{t.privacyPolicy}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">{t.version}</p>
          </div>
          <span className="text-sm text-gray-500 font-mono">v1.0.0</span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mt-6 mb-4">{t.recentNotifications}</h3>
      
      {expiringSoonCount === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p>{language === 'zh' ? '暂无提醒' : 'No notifications'}</p>
        </div>
      ) : (
        items.filter(item => getDaysLeft(item.expiryDate) <= 3).map(item => (
          <div key={item.id} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {item.name} {language === 'zh' ? '即将过期' : 'expiring soon'}
                </p>
                <p className="text-sm text-gray-600">
                  {t.expiringIn} {getDaysLeft(item.expiryDate)} {t.days}
                </p>
              </div>
              <span className="text-xs text-gray-500">{t.today}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAddItemForm = () => {
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewItem({...newItem, name: e.target.value});
    };
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewItem({...newItem, description: e.target.value});
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" onClick={() => setShowAddForm(false)}>
        <div className="bg-white rounded-t-3xl p-6 w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingItem ? t.editItem : t.addNewItem}
          </h3>
          
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'zh' ? '封面图片' : 'Cover Image'}
              </label>
              <div className="flex items-center gap-4">
                {newItem.coverImage ? (
                  <div className="relative">
                    <img 
                      src={newItem.coverImage} 
                      alt="Cover" 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                    />
                    <button
                      onClick={() => setNewItem({...newItem, coverImage: null})}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">
                      {language === 'zh' ? '上传' : 'Upload'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                
                {/* Emoji Picker */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-700">
                      {language === 'zh' ? '或选择图标：' : 'Or choose icon:'}
                    </span>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {newItem.image}
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="grid grid-cols-6 gap-2 p-3 border-2 border-gray-200 rounded-xl bg-gray-50 max-h-32 overflow-y-auto">
                      {emojiList.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setNewItem({...newItem, image: emoji});
                            setShowEmojiPicker(false);
                          }}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.itemName}</label>
              <input 
                type="text" 
                value={newItem.name}
                onChange={handleNameChange}
                placeholder={t.enterName}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setNewItem({...newItem, category: 'food', image: newItem.image === '📦' ? '🍎' : newItem.image})}
                  className={`py-3 px-4 border-2 rounded-xl font-medium transition-all ${
                    newItem.category === 'food'
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <Apple className="w-5 h-5 inline mr-2" />
                  {t.food}
                </button>
                <button 
                  type="button"
                  onClick={() => setNewItem({...newItem, category: 'daily', image: newItem.image === '🍎' ? '📦' : newItem.image})}
                  className={`py-3 px-4 border-2 rounded-xl font-medium transition-all ${
                    newItem.category === 'daily'
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <Package className="w-5 h-5 inline mr-2" />
                  {t.daily}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
              <textarea 
                value={newItem.description}
                onChange={handleDescriptionChange}
                placeholder={t.enterDescription}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.expiryDate}</label>
              <input 
                type="date" 
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.notifyDaysBefore}</label>
              <input 
                type="number" 
                value={newItem.notifyDays}
                onChange={(e) => setNewItem({...newItem, notifyDays: parseInt(e.target.value) || 1})}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-3 pt-4 pb-4">
              <button 
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setShowEmojiPicker(false);
                  setNewItem({
                    name: '',
                    category: 'food',
                    expiryDate: '',
                    notifyDays: 1,
                    description: '',
                    image: '📦',
                    coverImage: null
                  });
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                {t.cancel}
              </button>
              <button 
                type="button"
                onClick={addItem}
                disabled={!newItem.name || !newItem.expiryDate}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" onClick={() => setShowTimeSettings(false)}>
      <div className="bg-white rounded-t-3xl p-6 w-full" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t.defaultTime}</h3>
        
        <input 
          type="time" 
          value={notificationTime}
          onChange={(e) => setNotificationTime(e.target.value)}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg mb-6"
        />
        
        <button 
          onClick={() => setShowTimeSettings(false)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
        >
          {t.save}
        </button>
      </div>
    </div>
  );

  const renderAdvancedSettingsModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" onClick={() => setShowAdvancedSettings(false)}>
        <div className="bg-white rounded-t-3xl p-6 w-full" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t.advanceNotice}</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.food} ({language === 'zh' ? '天' : 'days'})
              </label>
              <input 
                type="number" 
                defaultValue={1}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.daily} ({language === 'zh' ? '天' : 'days'})
              </label>
              <input 
                type="number" 
                defaultValue={7}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setShowAdvancedSettings(false)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
          >
            {t.save}
          </button>
        </div>
      </div>
    );
  };

  const renderFeedbackModal = () => {
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedbackText(e.target.value);
    };
    
    const submitFeedback = () => {
      if (feedbackText.trim()) {
        setFeedbackStatus('success');
        setTimeout(() => {
            setFeedbackStatus('idle');
            setFeedbackText('');
            setShowFeedback(false);
        }, 2500);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowFeedback(false)}>
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
          
          {feedbackStatus === 'success' ? (
             <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.feedbackSuccess}</h3>
                <p className="text-gray-500 text-sm px-4">{t.feedbackThanks}</p>
             </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t.feedback}</h3>
              <div className="space-y-4">
                <textarea 
                  value={feedbackText}
                  onChange={handleFeedbackChange}
                  placeholder={t.feedbackPlaceholder}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none resize-none transition-colors"
                />
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackText('');
                    }}
                    className="flex-1 py-3 border-2 border-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="button"
                    onClick={submitFeedback}
                    disabled={!feedbackText.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                  >
                    {t.sendFeedback}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPrivacyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" onClick={() => setShowPrivacy(false)}>
      <div className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t.privacyTitle}</h3>
        
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-green-900 mb-2">
                  {language === 'zh' ? '数据安全保证' : 'Data Security Guarantee'}
                </p>
                <p className="text-sm text-green-700">{t.privacyContent}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">
              {language === 'zh' ? '我们收集的信息' : 'Information We Collect'}
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                {language === 'zh' 
                  ? '物品名称、分类、过期日期等您主动输入的信息' 
                  : 'Item names, categories, expiry dates and other information you provide'}
              </li>
              <li>
                {language === 'zh' 
                  ? '您上传的物品图片（仅存储在本地）' 
                  : 'Images you upload (stored locally only)'}
              </li>
              <li>
                {language === 'zh' 
                  ? '提醒设置和应用偏好' 
                  : 'Notification settings and app preferences'}
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">
              {language === 'zh' ? '数据存储' : 'Data Storage'}
            </h4>
            <p className="text-sm">
              {language === 'zh' 
                ? '所有数据都存储在您的设备本地存储中。我们不会将您的任何个人信息上传到云端或与第三方共享。' 
                : 'All data is stored in your device\'s local storage. We do not upload any of your personal information to the cloud or share it with third parties.'}
            </p>
          </div>
          
          <button 
            type="button"
            onClick={() => setShowPrivacy(false)}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {language === 'zh' ? '我知道了' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSearchModal = () => (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-white rounded-b-3xl shadow-lg overflow-hidden">
        <div className="p-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 text-gray-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all placeholder-gray-400 text-gray-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-0.5 text-gray-500 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4" onClick={() => setShowSearch(false)}>
        <div onClick={(e) => e.stopPropagation()}>
        {searchQuery ? (
          filteredItems.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center mt-4 mx-2 shadow-lg">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">{language === 'zh' ? '未找到相关物品' : 'No items found'}</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {filteredItems.map(item => {
                const daysLeft = getDaysLeft(item.expiryDate);
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      // You might want to scroll to item or open detail here
                    }}
                    className={`${getUrgencyColor(daysLeft)} bg-white border-2 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {item.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getUrgencyBadge(daysLeft)}`}>
                            {daysLeft} {t.days}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {t.expiryDate}: {item.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-20 text-white/80">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium text-lg drop-shadow-sm">{language === 'zh' ? '输入关键词搜索' : 'Enter keywords to search'}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen relative">
      {/* Analysis Overlay */}
      {(isAnalyzing || analysisResult) && (
        <AnalysisView 
          isAnalyzing={isAnalyzing} 
          result={analysisResult} 
          onConfirm={confirmAnalysisItems}
          onCancel={() => {
            setIsAnalyzing(false);
            setAnalysisResult(null);
          }}
        />
      )}
      
      {/* Live Camera Overlay */}
      {renderCameraOverlay()}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t.appName}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearch(true)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all backdrop-blur-sm"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="text-sm font-bold px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
        <p className="text-blue-100 text-sm font-medium tracking-wide opacity-90">{t.subtitle}</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {currentView === 'home' && <HomeView />}
        {currentView === 'camera' && <CameraView />}
        {currentView === 'notifications' && <NotificationsView />}
      </div>

      {/* Add Button - Floating Action */}
      <button 
        onClick={() => setCurrentView('camera')}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
              currentView === 'home' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">{t.home}</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('camera')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
              currentView === 'camera' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">{t.camera}</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('notifications')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
              currentView === 'notifications' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">{t.notifications}</span>
          </button>
        </div>
      </div>

      {/* Modals rendered as functions to maintain focus/state stability */}
      {showAddForm && renderAddItemForm()}
      {showTimeSettings && renderTimeSettingsModal()}
      {showAdvancedSettings && renderAdvancedSettingsModal()}
      {showSearch && renderSearchModal()}
      {showFeedback && renderFeedbackModal()}
      {showPrivacy && renderPrivacyModal()}
    </div>
  );
}