import React from 'react';
import { Home, Camera, Bell } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <button
          onClick={() => onChangeView(AppView.HOME)}
          className={`flex flex-col items-center gap-1 ${
            currentView === AppView.HOME ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => onChangeView(AppView.CAMERA)}
          className="flex flex-col items-center justify-center -mt-8 bg-primary text-white rounded-full w-14 h-14 shadow-lg border-4 border-gray-50 transform transition-transform active:scale-95"
        >
          <Camera size={28} />
        </button>

        <button
          onClick={() => onChangeView(AppView.NOTIFICATIONS)}
          className={`flex flex-col items-center gap-1 ${
            currentView === AppView.NOTIFICATIONS ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <Bell size={24} />
          <span className="text-xs font-medium">Notifications</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;