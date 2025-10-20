// Black & White Theme Utility Classes
export const theme = {
  // Backgrounds
  bg: {
    primary: 'bg-black',
    secondary: 'bg-zinc-900',
    tertiary: 'bg-zinc-800',
    hover: 'hover:bg-zinc-800',
  },
  
  // Text Colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-400',
    tertiary: 'text-gray-500',
    heading: 'text-white',
  },
  
  // Borders
  border: {
    default: 'border-zinc-800',
    light: 'border-zinc-700',
    hover: 'hover:border-zinc-600',
  },
  
  // Buttons
  button: {
    primary: 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium',
    secondary: 'bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium',
  },
  
  // Inputs
  input: {
    default: 'bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent',
    label: 'block text-sm font-medium text-gray-400 mb-2',
  },
  
  // Cards
  card: {
    default: 'bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl',
    hover: 'hover:bg-zinc-800/50 transition-colors',
  },
  
  // Tables
  table: {
    container: 'bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl',
    header: 'bg-zinc-950',
    headerCell: 'px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider',
    row: 'hover:bg-zinc-800/50 transition-colors',
    cell: 'px-6 py-4 text-sm',
    divider: 'divide-y divide-zinc-800',
  },
  
  // Alerts
  alert: {
    error: 'bg-red-900/20 border border-red-500 text-red-400 rounded-lg',
    success: 'bg-green-900/20 border border-green-500 text-green-400 rounded-lg',
    warning: 'bg-yellow-900/20 border border-yellow-500 text-yellow-400 rounded-lg',
  info: 'bg-gray-900/10 border border-gray-500 text-gray-300 rounded-lg',
  },
  
  // Status Badges
  badge: {
    active: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-400 border border-green-700',
    inactive: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400 border border-red-700',
    pending: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700',
  },
  
  // Headings
  heading: {
    h1: 'text-4xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent',
    h2: 'text-3xl font-bold text-white',
    h3: 'text-2xl font-bold text-white',
    h4: 'text-xl font-semibold text-white',
  },
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
