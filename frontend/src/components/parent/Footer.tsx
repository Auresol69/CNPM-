import React from 'react';
import { PhoneIcon, HelpIcon } from './Icons';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 px-4 md:px-8 border-t border-slate-200 bg-white text-slate-500 text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Copyright */}
        <div className="text-center md:text-left">
          <p>&copy; {year} Smart School Bus. All rights reserved.</p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <button className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
            <HelpIcon className="w-4 h-4" />
            <span>Support</span>
          </button>
          <button className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
            <PhoneIcon className="w-4 h-4" />
            <span>Contact</span>
          </button>
          <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}