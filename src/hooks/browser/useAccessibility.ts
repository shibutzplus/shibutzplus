import { useEffect, RefObject } from 'react';
import { useClickOutside } from '../useClickOutside';

interface UseAccessibilityProps {
  isOpen: boolean;
  navRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

/**
 * Hook to handle accessibility features for modal/overlay components
 * - Focus trap within the component
 * - Close on Escape key
 * - Close on outside click
 * - Prevent scrolling when open
 */
export const useAccessibility = ({ isOpen, navRef, onClose }: UseAccessibilityProps) => {
  // Handle click outside to close
  useClickOutside(navRef, onClose, isOpen);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const navElement = navRef.current;
    if (!navElement) return;

    const focusableElements = navElement.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element when opened
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, navRef]);
};
