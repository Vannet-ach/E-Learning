// Shared style strings — import in any page
export const card   = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl";
export const inp    = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
export const lbl    = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
export const btnPrimary = "px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer";
export const btnDanger  = "px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg transition";
export const btnGhost   = "px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg transition";
export const tableHead  = "px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
export const tableCell  = "px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300";
export const badge = (color: "green"|"amber"|"red"|"blue") => {
  const map = {
    green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    red:   "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    blue:  "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
  };
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`;
};
