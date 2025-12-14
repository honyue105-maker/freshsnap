import React, { useMemo } from 'react';
import { Item } from '../types';
import { formatDistanceToNow, isPast, isToday, addDays, isBefore } from 'date-fns';
import { AlertTriangle, Trash2, Package } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  onDelete: (id: string | number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onDelete }) => {
  
  const stats = useMemo(() => {
    const today = new Date();
    const soonThreshold = addDays(today, 3);
    
    let expired = 0;
    let soon = 0;
    let good = 0;

    items.forEach(item => {
      const date = new Date(item.expiryDate);
      if (isPast(date) && !isToday(date)) {
        expired++;
      } else if (isBefore(date, soonThreshold)) {
        soon++;
      } else {
        good++;
      }
    });

    return { expired, soon, good };
  }, [items]);

  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const getStatusColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const soonThreshold = addDays(today, 3);

    if (isPast(date) && !isToday(date)) return 'bg-red-50 border-red-200 text-red-700';
    if (isBefore(date, soonThreshold)) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  const getStatusLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date) && !isToday(date)) return 'Expired';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Header Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Pantry</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{stats.good}</span>
            <span className="text-xs text-gray-500">Fresh</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-warning">{stats.soon}</span>
            <span className="text-xs text-gray-500">Expiring</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-danger">{stats.expired}</span>
            <span className="text-xs text-gray-500">Expired</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>No items tracked yet.</p>
            <p className="text-sm">Tap the camera to add one.</p>
          </div>
        )}
        
        {sortedItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center group">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide border ${getStatusColor(item.expiryDate)}`}>
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${
                   isPast(new Date(item.expiryDate)) && !isToday(new Date(item.expiryDate)) ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {getStatusLabel(item.expiryDate)}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400 text-xs">{item.expiryDate}</span>
              </div>
            </div>
            
            <button 
              onClick={() => onDelete(item.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;