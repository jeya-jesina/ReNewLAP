// src/utils/toast.js

// Simple toast notification system
let toastContainer = null;

export const initToast = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

export const showToast = (message, type = 'success') => {
  const container = initToast();
  
  const toast = document.createElement('div');
  toast.className = `
    px-6 py-3 rounded-lg shadow-lg text-white font-medium
    transform transition-all duration-300 ease-in-out
    ${type === 'success' ? 'bg-green-600' : ''}
    ${type === 'error' ? 'bg-red-600' : ''}
    ${type === 'warning' ? 'bg-yellow-600' : ''}
    ${type === 'info' ? 'bg-blue-600' : ''}
  `;
  
  toast.textContent = message;
  
  // Add slide-in animation
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Alternative: Simple alert-based toast (if you prefer)
export const showToastSimple = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  alert(`${icons[type] || ''} ${message}`);
};