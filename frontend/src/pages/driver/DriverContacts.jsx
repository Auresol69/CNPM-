import React from 'react';

const features = [
  {
    title: 'GPS Tracking',
    desc: 'Precise real-time location tracking with GPS technology and geofencing capabilities for enhanced safety.',
    icon: '📍'
  },
  {
    title: 'HD Camera System',
    desc: 'High-definition cameras with night vision, recording capabilities, and live streaming for complete visibility.',
    icon: '📷'
  },
  {
    title: 'Emergency Response',
    desc: 'Instant emergency alerts, panic buttons, and direct communication with emergency services.',
    icon: '🛡️'
  },
  {
    title: 'Smart Scheduling',
    desc: 'AI-powered route optimization, automatic schedule updates, and traffic-aware arrival predictions.',
    icon: '⏰'
  },
  {
    title: 'Student Check-in',
    desc: 'RFID-based student check-in system with automatic parent notifications and attendance tracking.',
    icon: '🧑‍🎓'
  },
  {
    title: 'Driver Monitoring',
    desc: 'Driver behavior monitoring, fatigue detection, and compliance tracking for maximum safety standards.',
    icon: '🚍'
  }
];

export default function DriverContacts() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-semibold">Advanced Safety Features</h2>
        <p className="text-sm text-gray-500 mt-2">State-of-the-art technology to ensure maximum safety and peace of mind</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center text-2xl">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-gray-500 mt-2">{f.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
