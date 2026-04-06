
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const MockupModal = ({ mockup, isOpen, onClose, onNext, onPrev, hasMultiple }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasMultiple) onNext();
      if (e.key === 'ArrowLeft' && hasMultiple) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasMultiple]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && mockup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 modal-backdrop-blur bg-background/90"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Previous mockup"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Next mockup"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={pb.files.getUrl(mockup, mockup.image)}
              alt={mockup.label || 'Full size mockup'}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {mockup.label && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black/70 backdrop-blur-md text-white rounded-full text-sm font-medium shadow-lg border border-white/10">
                {mockup.label}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MockupModal;
