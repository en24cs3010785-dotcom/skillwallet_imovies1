import React from 'react';
import { Film } from 'lucide-react';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading cinema records...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-12 h-12 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-600 animate-spin"></div>
        <Film className="w-5 h-5 text-red-500 animate-pulse" />
      </div>
      <p className="text-xs font-mono text-slate-400 tracking-wide">{message}</p>
    </div>
  );
}
