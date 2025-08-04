// src/lib/utils.js
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
  }
  
  // Add any other utility functions you need
  export function formatDate(date) {
    return new Date(date).toLocaleDateString();
  }