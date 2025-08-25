// Path handling and auto-import utilities for the project
export const resolveImportPath = (path: string) => {
  // Normalizes path to use our project's alias system
  return path.startsWith('@/') || path.startsWith('~/') 
    ? path 
    : `~/${path}`;
};

// Add more path-related utilities as needed
