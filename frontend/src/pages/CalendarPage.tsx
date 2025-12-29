import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import CalendarGrid from '../components/CalendarGrid';
import TaskForm from '../components/TaskForm';
import TodayInfo from '../components/TodayInfo';
import { preloadMonthData, clearCache } from '../utils/lunarUtils';

// 常量定义
const PRELOAD_ADJACENT_MONTHS = true;

const CalendarPage: React.FC = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 使用 useMemo 缓存计算结果
  const { currentYear, currentMonth } = useMemo(() => ({
    currentYear: currentDate.getFullYear(),
    currentMonth: currentDate.getMonth()
  }), [currentDate]);

  // 初始化任务数据
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 预加载月份数据的优化版本
  const loadMonthData = useCallback(async (year: number, month: number) => {
    try {
      setDataLoaded(false);
      clearCache(); // 清除缓存以确保显示最新数据
      
      const loadPromises = [preloadMonthData(year, month)];
      
      // 预加载相邻月份数据（可选优化）
      if (PRELOAD_ADJACENT_MONTHS) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        
        loadPromises.push(
          preloadMonthData(prevYear, prevMonth),
          preloadMonthData(nextYear, nextMonth)
        );
      }
      
      await Promise.all(loadPromises);
      setDataLoaded(true);
    } catch (error) {
      console.warn('预加载月份数据失败:', error);
      setDataLoaded(true); // 即使失败也设置为true，使用降级方案
    }
  }, []);

  // 监听月份变化，预加载数据
  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [currentYear, currentMonth, loadMonthData]);

  // 导航函数优化 - 使用 useCallback 避免重复渲染
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // 任务操作函数优化
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  }, []);

  const handleCreateTask = useCallback((taskData: Omit<Task, 'id' | 'userId'>) => {
    const newTaskData = {
      ...taskData,
      dueDate: taskData.dueDate || selectedDate,
      createdAt: selectedDate || taskData.createdAt || new Date()
    };
    createTask(newTaskData);
    setIsTaskFormOpen(false);
    setSelectedDate(null);
  }, [selectedDate, createTask]);

  const handleUpdateTask = useCallback((taskData: Omit<Task, 'id' | 'userId'>) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
      setIsTaskFormOpen(false);
      setSelectedTask(null);
    }
  }, [selectedTask, updateTask]);

  const handleDeleteTask = useCallback((taskId: number) => {
    deleteTask(taskId);
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  }, [deleteTask]);

  const handleCloseForm = useCallback(() => {
    setIsTaskFormOpen(false);
    setSelectedTask(null);
    setSelectedDate(null);
  }, []);

  return (
    <div className="space-y-3">
      {/* 今日信息和月份导航 */}
      <TodayInfo 
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      
      {/* 数据加载状态 */}
      {!dataLoaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 text-sm">正在加载农历和节假日信息...</span>
          </div>
        </div>
      )}
      
      <CalendarGrid
        year={currentYear}
        month={currentMonth}
        tasks={tasks.filter(task => !task.parentTaskId)} // 只传递主任务
        onTaskClick={handleTaskClick}
        onDayClick={handleDayClick}
      />

      {/* 任务表单弹窗 */}
      <TaskForm
        task={selectedTask}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        onClose={handleCloseForm}
        onDelete={selectedTask ? () => handleDeleteTask(selectedTask.id) : undefined}
        defaultDueDate={selectedDate}
        defaultCreatedAt={selectedDate}
        isOpen={isTaskFormOpen}
        asModal={true}
      />
    </div>
  );
};

export default CalendarPage;