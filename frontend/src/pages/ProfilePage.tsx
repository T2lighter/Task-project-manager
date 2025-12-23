import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();

  // 计算任务统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">个人主页</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">个人信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">用户名</p>
            <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">邮箱</p>
            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">任务统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">总任务数</p>
            <p className="text-3xl font-bold text-blue-900">{totalTasks}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">已完成任务</p>
            <p className="text-3xl font-bold text-green-900">{completedTasks}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-600">待完成任务</p>
            <p className="text-3xl font-bold text-yellow-900">{pendingTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;