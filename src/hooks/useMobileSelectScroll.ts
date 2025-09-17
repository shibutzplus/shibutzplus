import { useCallback, useRef, useEffect } from "react";
import { useMobileSize } from "./useMobileSize";

/**
 * Custom hook for handling smooth scroll behavior on mobile select inputs
 * Scrolls the select element to the top of the screen when focused on mobile
 * to provide better UX with mobile keyboard and dropdown options
 */
export function useMobileSelectScroll() {
  const isMobile = useMobileSize();
  const selectRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToElement = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate target position - scroll element to top with small offset
    // This leaves room for the dropdown options below and mobile keyboard
    const targetPosition = rect.top + scrollTop - 20;
    
    // Smooth scroll to position
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
  }, []);

  const handleMenuOpen = useCallback(() => {
    if (!isMobile) return;

    // Small delay to ensure the menu is opening and keyboard might be appearing
    setTimeout(() => {
      // First try to use the container ref (most reliable)
      if (containerRef.current) {
        const controlElement = containerRef.current.querySelector('.react-select__control') as HTMLElement;
        if (controlElement) {
          scrollToElement(controlElement);
          return;
        }
      }

      // Fallback: try to find through select ref
      if (selectRef.current) {
        const selectElement = selectRef.current;
        
        // Try different ways to access the DOM element
        let controlElement: HTMLElement | null = null;
        
        // Method 1: Check if selectElement has a DOM node directly
        if (selectElement.select?.selectProps?.menuPortalTarget) {
          controlElement = selectElement.select.selectProps.menuPortalTarget.querySelector('.react-select__control');
        }
        
        // Method 2: Try to find in document
        if (!controlElement) {
          const allControls = document.querySelectorAll('.react-select__control');
          // Find the one that's currently focused or recently interacted with
          for (let i = 0; i < allControls.length; i++) {
            const control = allControls[i] as HTMLElement;
            const input = control.querySelector('input');
            if (input && (document.activeElement === input || control.matches(':focus-within'))) {
              controlElement = control;
              break;
            }
          }
        }

        if (controlElement) {
          scrollToElement(controlElement);
        }
      }
    }, 200); // Delay to account for keyboard animation and menu opening
  }, [isMobile, scrollToElement]);

  return { selectRef, containerRef, handleMenuOpen };
}
