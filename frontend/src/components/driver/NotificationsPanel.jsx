// src/components/driver/NotificationsPanel.jsx
import React from 'react';

export default function NotificationsPanel({ notifications = [] }) {
  return (
    <div className="bg-white rounded-md shadow p-4 border">
      <h3 className="font-semibold mb-3">Thông báo</h3>
      <div className="space-y-3 max-h-64 overflow-auto">
        {notifications.map(n => (
          <div key={n.id} className="p-2 border rounded">
            <div className="text-sm font-medium">{n.title}</div>
            <div className="text-xs text-gray-500">{n.time}</div>
            <div className="text-xs mt-1">{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
