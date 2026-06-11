import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import EnhancedSidebar from './EnhancedSidebar';

const MobileSidebar = ({ isOpen, onClose }) => {
  const dragControls = useDragControls();
  const sidebarRef = useRef(null);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0 }
  };

  // Handle drag to close
  const handleDragEnd = (_, info) => {
    const shouldClose = info.offset.x < -100 || info.velocity.x < -500;
    if (shouldClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with improved touch handling */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
            onTouchStart={(e) => {
              // Prevent touch events from bubbling to sidebar
              e.stopPropagation();
            }}
          />
          
          {/* Mobile Sidebar with drag support */}
          <motion.div
            ref={sidebarRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1] // Custom easing for smoother animation
            }}
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: -256, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="fixed inset-y-0 left-0 z-50 w-64 md:hidden touch-pan-y"
            style={{
              // Improve touch performance
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="relative h-full">
              {/* Drag handle indicator */}
              <div className="absolute top-4 left-4 w-8 h-1 bg-muted-foreground/30 rounded-full z-10" />
              
              {/* Close button with improved touch target */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 z-10 rounded-2xl h-10 w-10 touch-manipulation"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Enhanced Sidebar */}
              <EnhancedSidebar
                isCollapsed={false}
                onToggle={() => {}} // No toggle in mobile mode
                isMobile={true}
                onMobileClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;