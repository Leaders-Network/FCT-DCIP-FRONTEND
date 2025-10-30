import { useEffect } from 'react';

/**
 * Custom hook to handle click outside events for dropdowns and modals
 * @param isOpen - Whether the dropdown/modal is open
 * @param onClose - Function to call when clicking outside
 * @param containerClass - CSS class name of the container to exclude from outside clicks
 */
export const useClickOutside = (
  isOpen: boolean,
  onClose: () => void,
  containerClass: string = 'dropdown-container'
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest(`.${containerClass}`)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, containerClass]);
};