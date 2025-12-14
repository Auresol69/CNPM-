import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6">
      <div className="text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Smart School Bus. All rights reserved.</p>
      </div>
    </footer>
  );
}
