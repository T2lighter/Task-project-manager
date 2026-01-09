import { useState, useCallback, DragEvent } from 'react';

interface DragHandlers {
  isDragOver: boolean;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent, onDropCallback: (data: any) => void) => void;
  resetDragState: () => void;
}

/**
 * 通用拖拽处理钩子
 * 封装了拖拽过程中的通用逻辑，包括拖拽悬停状态管理和边界检测
 * 
 * @returns {DragHandlers} 拖拽处理函数和状态
 * 
 * @example
 * const { isDragOver, handleDragOver, handleDragLeave, handleDrop, resetDragState } = useDragHandlers();
 * 
 * // 在组件中使用
 * <div
 *   className={`drop-zone ${isDragOver ? 'active' : ''}`}
 *   onDragOver={handleDragOver}
 *   onDragLeave={handleDragLeave}
 *   onDrop={(e) => handleDrop(e, handleDropTask)}
 * >
 *   拖拽内容区域
 * </div>
 */
export const useDragHandlers = (): DragHandlers => {
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * 处理拖拽悬停
   * 设置拖拽效果并更新悬停状态
   */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  /**
   * 处理拖拽离开
   * 进行边界检测，只有真正离开元素区域时才重置状态
   */
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    
    // 只有真正离开列区域时才重置状态
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  /**
   * 处理拖拽放下
   * 解析拖拽数据并执行回调函数
   */
  const handleDrop = useCallback((e: DragEvent, onDropCallback: (data: any) => void) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!e.dataTransfer) {
      return;
    }
    
    const transferData = e.dataTransfer.getData('text/plain');
    if (transferData) {
      try {
        const parsedData = JSON.parse(transferData);
        onDropCallback(parsedData);
      } catch (error) {
        console.error('解析拖拽数据失败:', error);
      }
    }
  }, []);

  /**
   * 重置拖拽状态
   * 用于手动重置拖拽悬停状态
   */
  const resetDragState = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState
  };
};

/**
 * 带数据验证的拖拽处理钩子
 * 在通用钩子的基础上增加了数据类型验证
 * 
 * @template T 期望的拖拽数据类型
 * @param {function} validator 数据验证函数
 * @returns {DragHandlers} 增强版的拖拽处理函数
 * 
 * @example
 * const taskDragHandlers = useDragHandlersWithValidation<Task>(
 *   (data) => data && typeof data.id === 'number' && data.title
 * );
 */
export const useDragHandlersWithValidation = <T extends any>(
  validator: (data: any) => data is T
): DragHandlers & { lastValidData: T | null } => {
  const [lastValidData, setLastValidData] = useState<T | null>(null);
  const baseHandlers = useDragHandlers();

  const handleDropWithValidation = useCallback((
    e: DragEvent, 
    onDropCallback: (data: T) => void
  ) => {
    baseHandlers.handleDrop(e, (data) => {
      if (validator(data)) {
        setLastValidData(data);
        onDropCallback(data);
      } else {
        console.warn('拖拽数据验证失败:', data);
      }
    });
  }, [baseHandlers, validator]);

  return {
    ...baseHandlers,
    handleDrop: handleDropWithValidation,
    lastValidData
  };
};

/**
 * 任务拖拽专用钩子
 * 专门用于处理任务对象的拖拽，内置任务数据验证
 * 
 * @returns {DragHandlers & { lastTask: Task | null }} 任务拖拽处理函数
 * 
 * @example
 * const { isDragOver, handleDrop, lastTask } = useTaskDragHandlers();
 * 
 * // 处理任务拖拽
 * const handleTaskDrop = (task: Task) => {
 *   console.log('收到任务:', task.title);
 *   // 处理任务逻辑...
 * };
 */
export interface Task {
  id: number;
  title: string;
  status?: string;
  // 其他任务属性...
}

export const useTaskDragHandlers = () => {
  return useDragHandlersWithValidation<Task>(
    (data): data is Task => {
      return data && 
             typeof data === 'object' && 
             typeof data.id === 'number' && 
             typeof data.title === 'string';
    }
  );
};

export default useDragHandlers;