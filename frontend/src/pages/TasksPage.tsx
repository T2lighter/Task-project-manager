import React, { useState } from 'react';
import Quadrant from '../components/Quadrant';
import TaskForm from '../components/TaskForm';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = (task: Omit<Task, 'id' | 'userId'>) => {
    createTask(task);
    setIsFormOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = (task: Task) => {
    if (editingTask) {
      updateTask(editingTask.id, task);
      setEditingTask(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // 按象限过滤任务
  const quadrant1Tasks = tasks.filter(task => task.urgency && task.importance);
  const quadrant2Tasks = tasks.filter(task => !task.urgency && task.importance);
  const quadrant3Tasks = tasks.filter(task => task.urgency && !task.importance);
  const quadrant4Tasks = tasks.filter(task => !task.urgency && !task.importance);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">任务管理</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          添加任务
        </button>
      </div>

      {/* 任务表单 */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={handleCloseForm}
        />
      )}

      {/* 艾森豪威尔矩阵 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant
          title="紧急且重要"
          urgency={true}
          importance={true}
          tasks={quadrant1Tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
        <Quadrant
          title="重要但不紧急"
          urgency={false}
          importance={true}
          tasks={quadrant2Tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
        <Quadrant
          title="紧急但不重要"
          urgency={true}
          importance={false}
          tasks={quadrant3Tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
        <Quadrant
          title="既不紧急也不重要"
          urgency={false}
          importance={false}
          tasks={quadrant4Tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default TasksPage;