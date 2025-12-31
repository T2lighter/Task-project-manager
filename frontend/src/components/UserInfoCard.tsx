import React from 'react';

interface User {
  username: string;
  email: string;
}

interface UserInfoCardProps {
  user: User | null;
  onLogout: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 rounded-xl p-3 border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-200/30 to-blue-200/30 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-indigo-200/20 to-gray-200/20 rounded-full translate-y-6 -translate-x-6"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-gray-300/40 rounded-full"></div>
      <div className="absolute top-1/4 right-1/3 w-0.5 h-0.5 bg-blue-400/50 rounded-full"></div>
      
      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">👤</span>
          </div>
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-blue-600">
            个人信息
          </h3>
        </div>
        
        <div className="space-y-2 mb-3 flex-1">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">用户名</p>
            <p className="text-sm font-semibold text-gray-900 truncate" title={user?.username}>
              {user?.username || '未登录'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">邮箱</p>
            <p className="text-xs font-semibold text-gray-900 break-all" title={user?.email}>
              {user?.email || '未设置'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          退出登录
        </button>
        
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-medium">在线</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;