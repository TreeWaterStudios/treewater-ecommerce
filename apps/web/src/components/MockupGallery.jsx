
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';
import { Image as ImageIcon } from 'lucide-react';

const MockupGallery = ({ mockups, isLoading, onMockupClick }) => {
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col gap-2 flex-shrink-0 w-32">
            <Skeleton className="w-32 h-32 rounded-xl" />
            <Skeleton className="w-20 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!mockups || mockups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card/30 rounded-xl border border-border/50">
        <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm font-medium">No mockups available</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
      {mockups.map((mockup, idx) => (
        <button
          key={mockup.id}
          onClick={() => onMockupClick(idx)}
          className="group relative flex-shrink-0 w-32 flex flex-col gap-2 snap-start text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          aria-label={`View ${mockup.label || `mockup ${idx + 1}`}`}
        >
          <div className="w-32 h-32 rounded-xl overflow-hidden border border-border/50 bg-card/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:border-primary/50">
            <img
              src={pb.files.getUrl(mockup, mockup.image, { thumb: '150x150' })}
              alt={mockup.label || `Mockup ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {mockup.label && (
            <span className="text-xs font-medium text-muted-foreground truncate w-full group-hover:text-foreground transition-colors px-1">
              {mockup.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MockupGallery;
