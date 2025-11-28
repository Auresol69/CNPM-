import React from 'react';
import { BellIcon } from '../../components/parent/Icons';

const NOTIFICATIONS = [
  { id: 1, title: 'Bus Arriving', message: 'The bus is 5 minutes away from your pickup point.', time: '2 mins ago', type: 'info' },
  { id: 2, title: 'Student On Board', message: 'Nguyen Van A has successfully boarded the bus.', time: '15 mins ago', type: 'success' },
  { id: 3, title: 'Trip Started', message: 'Morning Route #12 has started.', time: '30 mins ago', type: 'neutral' },
  { id: 4, title: 'Payment Due', message: 'Monthly bus fee is due next Monday.', time: '1 day ago', type: 'warning' },
];

export default function Notifications() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">Mark all as read</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {NOTIFICATIONS.map((notif, index) => (
          <div 
            key={notif.id} 
            className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors ${index !== NOTIFICATIONS.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 
              ${notif.type === 'info' ? 'bg-blue-100 text-blue-600' : 
                notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                notif.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}
            >
              <BellIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
            </div>
            {index === 0 && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}