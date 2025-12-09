// src/components/driver/ScheduleAssign.jsx
import React, { useState } from 'react';

export default function ScheduleAssign({ schedules = [], onAssign }) {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  return (
    <div className="bg-white rounded-md shadow p-4 border">
      <h3 className="font-semibold mb-3">Phân công lịch trình</h3>

      <select
        value={selectedSchedule ?? ''}
        onChange={e => setSelectedSchedule(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="">Chọn lịch trình</option>
        {schedules.map(s => <option key={s.id} value={s.id}>{s.name} — {s.time}</option>)}
      </select>

      <button
        disabled={!selectedSchedule}
        onClick={() => onAssign?.(selectedSchedule)}
        className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
      >
        Gán lịch trình
      </button>
    </div>
  );
}
