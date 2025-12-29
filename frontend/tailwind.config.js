/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quadrant-1': '#ef4444', // 紧急重要 - 红色
        'quadrant-2': '#3b82f6', // 重要不紧急 - 蓝色
        'quadrant-3': '#f59e0b', // 紧急不重要 - 黄色
        'quadrant-4': '#10b981', // 不紧急不重要 - 绿色
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}