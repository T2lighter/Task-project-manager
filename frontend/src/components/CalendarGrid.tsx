import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { Task } from '../types';
import CalendarDay from './CalendarDay';
import {
  getMonthDays,
  formatDateKey,
  getWeekDays,
  isMultiDayTask,
  compareTasksByPriority
} from '../utils/calendarUtils';
import { getPriorityConfig } from '../utils/taskUtils';


// 常量定义
const DAYS_PER_WEEK = 7;
const TASK_HEIGHT = 24;
const TASK_SPACING = 2;
const CELL_PADDING = 4;
const TASK_TOP_OFFSET = 38;

interface CalendarGridProps {
  year: number;
  month: number;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDayClick: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  tasks,
  onTaskClick,
  onDayClick
}) => {
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(), []);
  const gridRef = useRef<HTMLDivElement>(null);

  // 优化：使用 useMemo 缓存日期到索引的映射
  const dateToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    monthDays.forEach((date, index) => {
      map.set(formatDateKey(date), index);
    });
    return map;
  }, [monthDays]);

  // 优化：预处理任务范围信息
  const taskRanges = useMemo(() => {
    return tasks.map(task => {
      if (!task.createdAt) return null;

      const startDate = new Date(task.createdAt);
      const endDate = task.dueDate ? new Date(task.dueDate) : startDate;

      const startIndex = dateToIndexMap.get(formatDateKey(startDate));
      const endIndex = dateToIndexMap.get(formatDateKey(endDate));

      if (startIndex === undefined || endIndex === undefined) return null;

      return {
        task,
        startIndex,
        endIndex,
        startRow: Math.floor(startIndex / DAYS_PER_WEEK),
        endRow: Math.floor(endIndex / DAYS_PER_WEEK)
      };
    }).filter((range): range is NonNullable<typeof range> => range !== null);
  }, [tasks, dateToIndexMap]);

  // 计算每一行的最大任务层级数（优化版本）
  const maxLayersByRow = useMemo(() => {
    const rowTaskMaps: Record<number, any[]> = {};

    // 按行分组任务
    taskRanges.forEach(range => {
      for (let row = range.startRow; row <= range.endRow; row++) {
        if (!rowTaskMaps[row]) {
          rowTaskMaps[row] = [];
        }

        const rowStartIndex = row * DAYS_PER_WEEK;
        const rowEndIndex = row * DAYS_PER_WEEK + 6;
        const taskStartInRow = Math.max(range.startIndex, rowStartIndex);
        const taskEndInRow = Math.min(range.endIndex, rowEndIndex);

        rowTaskMaps[row].push({
          ...range,
          rowStartIndex: taskStartInRow,
          rowEndIndex: taskEndInRow,
          row: row
        });
      }
    });

    // 计算每行的最大层级数
    const rowMaxLayers: Record<number, number> = {};

    Object.entries(rowTaskMaps).forEach(([rowKey, rowTasks]) => {
      const row = parseInt(rowKey);

      // 使用统一的排序函数
      rowTasks.sort((a, b) => {
        const priorityResult = compareTasksByPriority(a.task, b.task);
        if (priorityResult !== 0) return priorityResult;

        // 如果优先级相同，按开始位置排序
        return a.rowStartIndex - b.rowStartIndex;
      });

      // 分配层级
      const layers: any[][] = [];

      rowTasks.forEach(range => {
        let assignedLayer = -1;

        // 寻找可用层级
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
          const layer = layers[layerIndex];
          const canPlace = layer.every(existingRange =>
            range.rowEndIndex < existingRange.rowStartIndex ||
            range.rowStartIndex > existingRange.rowEndIndex
          );

          if (canPlace) {
            assignedLayer = layerIndex;
            break;
          }
        }

        // 创建新层级（如果需要）
        if (assignedLayer === -1) {
          assignedLayer = layers.length;
          layers.push([]);
        }

        layers[assignedLayer].push(range);
      });

      rowMaxLayers[row] = layers.length;
    });

    return rowMaxLayers;
  }, [taskRanges]);

  // 将月份日期按行分组（优化版本）
  const daysByRow = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += DAYS_PER_WEEK) {
      rows.push(monthDays.slice(i, i + DAYS_PER_WEEK));
    }
    return rows;
  }, [monthDays]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格容器 */}
      <div className="relative" ref={gridRef}>
        {/* 日历网格 - 按行渲染，每行使用该行的最大高度 */}
        <div className="grid grid-cols-7">
          {daysByRow.map((weekDays, rowIndex) =>
            weekDays.map(date => {
              const dateKey = formatDateKey(date);
              const rowMaxLayers = maxLayersByRow[rowIndex] || 0;

              return (
                <CalendarDay
                  key={dateKey}
                  date={date}
                  tasks={[]} // 不传递任务，只显示日期信息
                  currentMonth={month}
                  maxTaskLayers={rowMaxLayers} // 使用该行的最大层级数
                  onTaskClick={onTaskClick}
                  onDayClick={onDayClick}
                />
              );
            })
          )}
        </div>

        {/* 统一任务覆盖层 - 所有任务都在这里显示 */}
        <UnifiedTaskOverlay
          tasks={tasks}
          monthDays={monthDays}
          gridRef={gridRef}
          onTaskClick={onTaskClick}
        />
      </div>

      {/* 图例 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="font-medium mr-2">状态:</div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>待办</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>处理中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>阻塞</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>已完成</span>
          </div>

          <div className="w-px h-4 bg-gray-300 mx-2"></div>

          <div className="font-medium mr-2">优先级:</div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-red-500 rounded box-border"></div>
            <span>紧急重要</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-yellow-400 rounded box-border"></div>
            <span>紧急</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-blue-600 rounded box-border"></div>
            <span>重要</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 统一任务覆盖层组件（优化版本）
interface UnifiedTaskOverlayProps {
  tasks: Task[];
  monthDays: Date[];
  gridRef: React.RefObject<HTMLDivElement>;
  onTaskClick: (task: Task) => void;
}

const UnifiedTaskOverlay: React.FC<UnifiedTaskOverlayProps> = React.memo(({
  tasks,
  monthDays,
  gridRef,
  onTaskClick
}) => {
  const [cellPositions, setCellPositions] = React.useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>>([]);

  // 优化：使用 useMemo 缓存日期映射
  const dateToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    monthDays.forEach((date, index) => {
      map.set(formatDateKey(date), index);
    });
    return map;
  }, [monthDays]);

  // 计算每个日历格的位置和大小（优化版本）
  const updatePositions = useCallback(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const cells = gridElement.querySelectorAll('.grid.grid-cols-7 > div');
    const positions = Array.from(cells).map(cell => {
      const rect = cell.getBoundingClientRect();
      const gridRect = gridElement.getBoundingClientRect();

      return {
        x: rect.left - gridRect.left,
        y: rect.top - gridRect.top,
        width: rect.width,
        height: rect.height
      };
    });

    setCellPositions(positions);
  }, [gridRef]);

  useEffect(() => {
    updatePositions();

    // 监听窗口大小变化
    window.addEventListener('resize', updatePositions);

    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(updatePositions);
    const gridElement = gridRef.current;
    if (gridElement) {
      observer.observe(gridElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return () => {
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
    };
  }, [updatePositions]);

  // 计算所有任务的布局（大幅优化版本）
  const taskLayouts = useMemo(() => {
    if (cellPositions.length === 0) return [];

    // 预处理任务范围
    const taskRanges = tasks.map(task => {
      if (!task.createdAt) return null;

      const startDate = new Date(task.createdAt);
      const endDate = task.dueDate ? new Date(task.dueDate) : startDate;

      const startIndex = dateToIndexMap.get(formatDateKey(startDate));
      const endIndex = dateToIndexMap.get(formatDateKey(endDate));

      if (startIndex === undefined || endIndex === undefined) return null;

      return {
        task,
        startDate,
        endDate,
        startIndex,
        endIndex,
        startRow: Math.floor(startIndex / DAYS_PER_WEEK),
        endRow: Math.floor(endIndex / DAYS_PER_WEEK),
        isMultiDay: isMultiDayTask(task)
      };
    }).filter((range): range is NonNullable<typeof range> => range !== null);

    // 计算行级任务层级
    const calculateRowLayers = () => {
      const rowTaskMaps: Record<number, any[]> = {};

      // 按行分组任务
      taskRanges.forEach(range => {
        for (let row = range.startRow; row <= range.endRow; row++) {
          if (!rowTaskMaps[row]) {
            rowTaskMaps[row] = [];
          }

          const rowStartIndex = row * DAYS_PER_WEEK;
          const rowEndIndex = row * DAYS_PER_WEEK + 6;
          const taskStartInRow = Math.max(range.startIndex, rowStartIndex);
          const taskEndInRow = Math.min(range.endIndex, rowEndIndex);

          rowTaskMaps[row].push({
            ...range,
            rowStartIndex: taskStartInRow,
            rowEndIndex: taskEndInRow,
            row: row
          });
        }
      });

      // 为每行的任务分配相对层级
      const taskRowLayers: Record<string, Record<number, number>> = {};

      Object.entries(rowTaskMaps).forEach(([rowKey, rowTasks]) => {
        const row = parseInt(rowKey);

        // 使用统一的排序函数
        rowTasks.sort((a, b) => {
          const priorityResult = compareTasksByPriority(a.task, b.task);
          if (priorityResult !== 0) return priorityResult;
          return a.rowStartIndex - b.rowStartIndex;
        });

        // 分配层级
        const layers: any[][] = [];

        rowTasks.forEach(range => {
          let assignedLayer = -1;

          // 寻找可用层级
          for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layer = layers[layerIndex];
            const canPlace = layer.every(existingRange =>
              range.rowEndIndex < existingRange.rowStartIndex ||
              range.rowStartIndex > existingRange.rowEndIndex
            );

            if (canPlace) {
              assignedLayer = layerIndex;
              break;
            }
          }

          // 创建新层级（如果需要）
          if (assignedLayer === -1) {
            assignedLayer = layers.length;
            layers.push([]);
          }

          layers[assignedLayer].push(range);

          // 记录任务在该行的层级
          const taskKey = `${range.task.id}`;
          if (!taskRowLayers[taskKey]) {
            taskRowLayers[taskKey] = {};
          }
          taskRowLayers[taskKey][row] = assignedLayer;
        });
      });

      return taskRowLayers;
    };

    const taskRowLayers = calculateRowLayers();

    // 生成布局
    const layouts: Array<{
      task: Task;
      isMultiDay: boolean;
      spans: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        isStart: boolean;
        isEnd: boolean;
        layer: number;
      }>;
    }> = [];

    taskRanges.forEach(range => {
      const { task, startIndex, endIndex, startRow, endRow, isMultiDay } = range;

      const spans: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        isStart: boolean;
        isEnd: boolean;
        layer: number;
      }> = [];

      const taskKey = `${task.id}`;

      if (startRow === endRow) {
        // 同一行任务
        const rowLayer = taskRowLayers[taskKey]?.[startRow] || 0;
        const layerOffset = rowLayer * (TASK_HEIGHT + TASK_SPACING);

        spans.push({
          x: cellPositions[startIndex].x + CELL_PADDING,
          y: cellPositions[startIndex].y + TASK_TOP_OFFSET + layerOffset,
          width: cellPositions[endIndex].x + cellPositions[endIndex].width - cellPositions[startIndex].x - (CELL_PADDING * 2),
          height: TASK_HEIGHT,
          isStart: true,
          isEnd: true,
          layer: rowLayer
        });
      } else {
        // 跨行任务
        for (let row = startRow; row <= endRow; row++) {
          const rowLayer = taskRowLayers[taskKey]?.[row] || 0;
          const layerOffset = rowLayer * (TASK_HEIGHT + TASK_SPACING);

          if (row === startRow) {
            // 第一行
            const firstRowEndIndex = row * DAYS_PER_WEEK + 6;

            spans.push({
              x: cellPositions[startIndex].x + CELL_PADDING,
              y: cellPositions[startIndex].y + TASK_TOP_OFFSET + layerOffset,
              width: cellPositions[firstRowEndIndex].x + cellPositions[firstRowEndIndex].width - cellPositions[startIndex].x - CELL_PADDING,
              height: TASK_HEIGHT,
              isStart: true,
              isEnd: false,
              layer: rowLayer
            });
          } else if (row === endRow) {
            // 最后一行
            const lastRowStartIndex = row * DAYS_PER_WEEK;

            spans.push({
              x: cellPositions[lastRowStartIndex].x + CELL_PADDING,
              y: cellPositions[lastRowStartIndex].y + TASK_TOP_OFFSET + layerOffset,
              width: cellPositions[endIndex].x + cellPositions[endIndex].width - cellPositions[lastRowStartIndex].x - CELL_PADDING,
              height: TASK_HEIGHT,
              isStart: false,
              isEnd: true,
              layer: rowLayer
            });
          } else {
            // 中间行
            const middleRowStartIndex = row * DAYS_PER_WEEK;
            const middleRowEndIndex = row * DAYS_PER_WEEK + 6;

            spans.push({
              x: cellPositions[middleRowStartIndex].x + CELL_PADDING,
              y: cellPositions[middleRowStartIndex].y + TASK_TOP_OFFSET + layerOffset,
              width: cellPositions[middleRowEndIndex].x + cellPositions[middleRowEndIndex].width - cellPositions[middleRowStartIndex].x,
              height: TASK_HEIGHT,
              isStart: false,
              isEnd: false,
              layer: rowLayer
            });
          }
        }
      }

      layouts.push({ task, isMultiDay, spans });
    });

    return layouts;
  }, [tasks, dateToIndexMap, cellPositions]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {taskLayouts.map((layout, layoutIndex) => (
        <div key={`${layout.task.id}-${layoutIndex}`}>
          {layout.spans.map((span, spanIndex) => (
            <TaskSpan
              key={`${layout.task.id}-${spanIndex}`}
              task={layout.task}
              span={span}
              layer={span.layer}
              isMultiDay={layout.isMultiDay}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

// 统一任务片段组件（优化版本）
interface TaskSpanProps {
  task: Task;
  span: {
    x: number;
    y: number;
    width: number;
    height: number;
    isStart: boolean;
    isEnd: boolean;
  };
  layer: number;
  isMultiDay: boolean;
  onTaskClick: (task: Task) => void;
}

const TaskSpan: React.FC<TaskSpanProps> = React.memo(({
  task,
  span,
  layer,
  onTaskClick
}) => {
  const priorityConfig = useMemo(() => getPriorityConfig(task), [task]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  }, [task, onTaskClick]);

  const style = useMemo(() => ({
    position: 'absolute' as const,
    left: `${span.x}px`,
    top: `${span.y}px`,
    width: `${span.width}px`,
    height: `${span.height}px`,
    zIndex: 10 + layer
  }), [span, layer]);

  const className = useMemo(() => {
    // 基础样式：白色文字，圆角，截断，鼠标指针，过渡效果
    let baseClass = 'h-full flex items-center px-2 text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto rounded truncate box-border ';

    // 1. 背景色表示状态 (参考甘特图样式)
    switch (task.status) {
      case 'completed':
        baseClass += 'bg-green-500 ';
        break;
      case 'in-progress':
        baseClass += 'bg-blue-400 ';
        break;
      case 'blocked':
        baseClass += 'bg-purple-400 ';
        break;
      case 'pending':
      default:
        baseClass += 'bg-gray-400 ';
        break;
    }

    // 2. 边框表示优先级 (参考甘特图样式)
    // 注意：使用 border-2 增加边框宽度以提高辨识度
    if (task.urgency && task.importance) {
      baseClass += 'border-2 border-red-500 ';
    } else if (task.urgency) {
      baseClass += 'border-2 border-yellow-400 ';
    } else if (task.importance) {
      baseClass += 'border-2 border-blue-600 '; // 使用稍微深一点的蓝色以区分背景
    } else {
      baseClass += 'border border-white/20 '; // 普通优先级使用微弱边框
    }

    // 3. 完成任务特殊样式
    if (task.status === 'completed') {
      baseClass += 'line-through opacity-80 ';
    }

    return baseClass;
  }, [task.status, task.urgency, task.importance]);

  const displayContent = useMemo(() => {
    return `${priorityConfig.icon} ${task.title}`;
  }, [task.title, priorityConfig.icon]);

  return (
    <div style={style}>
      <div className={className} onClick={handleClick} title={task.title}>
        <span className="truncate">{displayContent}</span>
      </div>
    </div>
  );
});

TaskSpan.displayName = 'TaskSpan';

export default CalendarGrid;