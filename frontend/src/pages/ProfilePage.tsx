import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useStatsStore } from '../store/statsStore';
import StatsCard from '../components/StatsCard';
import TaskStatusPieChart from '../components/TaskStatusPieChart';
import QuadrantPieChart from '../components/QuadrantPieChart';
import CategoryStatsChart from '../components/CategoryStatsChart';
import TaskTrendOverview from '../components/TaskTrendOverview';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const {
    taskStats,
    quadrantStats,
    categoryStats,
    yearTimeSeriesData,
    selectedPeriod,
    selectedDate,
    loading,
    heatmapLoading, // 新增：热力图专用加载状态
    error,
    setSelectedPeriod,
    setSelectedDate,
    fetchAllStats,
    fetchTimeSeriesData,
    fetchYearHeatmapData,
    clearError
  } = useStatsStore();
  
  const navigate = useNavigate();

  // 页面加载时获取数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchTasks();
        await fetchAllStats();
      } catch (error) {
        console.error('ProfilePage: 初始化数据失败', error);
      }
    };
    
    initializeData();
  }, [fetchTasks, fetchAllStats]);

  // 当统计数据改变时重新获取数据
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  // 当时间周期或日期改变时重新获取时间序列数据
  useEffect(() => {
    // 只获取时间序列数据，不触发全量统计数据获取
    fetchTimeSeriesData(selectedPeriod, selectedDate);
  }, [selectedPeriod, selectedDate, fetchTimeSeriesData]);

  // 获取年度热力图数据（只在页面加载时获取一次）
  useEffect(() => {
    console.log('ProfilePage: 获取年度热力图数据');
    fetchYearHeatmapData();
  }, [fetchYearHeatmapData]);

  // 处理时间周期变化
  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    // 使用专用的热力图加载状态
    setSelectedPeriod(period);
  };

  // 处理日期变化
  const handleDateChange = (date: Date) => {
    // 使用专用的热力图加载状态，逻辑已在setSelectedDate中处理
    setSelectedDate(date);
  };

  // 计算基础统计数据（用于卡片显示）
  const allTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  // 计算逾期任务
  const now = new Date();
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    task.dueDate && 
    new Date(task.dueDate) < now
  ).length;

  // 计算今日到期任务
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const dueTodayTasks = tasks.filter(task => 
    task.status !== 'completed' &&
    task.dueDate && 
    new Date(task.dueDate) >= todayStart && 
    new Date(task.dueDate) <= todayEnd
  ).length;

  const completionRate = allTasks > 0 ? ((completedTasks / allTasks) * 100).toFixed(1) : '0';

  // 计算四象限数据（使用quadrantStats后端数据）
  const quadrantDisplay = quadrantStats ? 
    `${quadrantStats.urgentImportant}/${quadrantStats.importantNotUrgent}/${quadrantStats.urgentNotImportant}/${quadrantStats.neitherUrgentNorImportant}` :
    '0/0/0/0';

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">加载统计数据时出错</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">查看详细信息</summary>
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify({
                      error,
                      user: user?.username,
                      token: localStorage.getItem('token') ? '已设置' : '未设置'
                    }, null, 2)}
                  </pre>
                </details>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    clearError();
                    fetchAllStats();
                  }}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 mr-2"
                >
                  重试
                </button>
                <button
                  onClick={() => {
                    clearError();
                    // 只获取基础任务数据，不获取统计
                    fetchTasks();
                  }}
                  className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  仅加载任务
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 即使出错也显示基础信息 */}
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 个人信息 */}
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

      {/* 所有统计卡片 - 一行显示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatsCard
          title="总任务数"
          value={allTasks}
          color="indigo"
          onClick={() => navigate('/tasks', { state: { filter: 'all' } })}
        />
        <StatsCard
          title="完成率"
          value={completionRate}
          suffix="%"
          color="green"
        />
        <StatsCard
          title="逾期任务"
          value={overdueTasks}
          color="red"
          onClick={() => navigate('/tasks', { state: { filter: 'overdue' } })}
        />
        <StatsCard
          title="今日到期"
          value={dueTodayTasks}
          color="yellow"
          onClick={() => navigate('/tasks', { state: { filter: 'due-today' } })}
        />
        <StatsCard
          title="已完成"
          value={completedTasks}
          color="green"
          onClick={() => navigate('/tasks', { state: { filter: 'completed' } })}
        />
        <StatsCard
          title="进行中"
          value={inProgressTasks}
          color="blue"
          onClick={() => navigate('/tasks', { state: { filter: 'in-progress' } })}
        />
        <StatsCard
          title="待办"
          value={pendingTasks}
          color="yellow"
          onClick={() => navigate('/tasks', { state: { filter: 'pending' } })}
        />
        <StatsCard
          title="四象限总览"
          value={quadrantDisplay}
          color="purple"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* 任务创建与完成统计 */}
      <TaskTrendOverview 
        data={yearTimeSeriesData}
        period={selectedPeriod}
        selectedDate={selectedDate}
        loading={heatmapLoading} // 使用专用的热力图加载状态
        onPeriodChange={handlePeriodChange}
        onDateChange={handleDateChange}
      />

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 任务状态分布饼图 */}
        {taskStats && (
          <TaskStatusPieChart stats={taskStats} />
        )}
        
        {/* 四象限分布饼图 */}
        {quadrantStats && (
          <QuadrantPieChart stats={quadrantStats} />
        )}
      </div>

      {/* 分类统计图 */}
      {categoryStats.length > 0 && (
        <CategoryStatsChart data={categoryStats} />
      )}


    </div>
  );
};

export default ProfilePage;