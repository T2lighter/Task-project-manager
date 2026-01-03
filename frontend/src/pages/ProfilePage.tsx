import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useStatsStore } from '../store/statsStore';
import StatsCard from '../components/StatsCard';
import TaskStatusPieChart from '../components/TaskStatusPieChart';
import QuadrantPieChart from '../components/QuadrantPieChart';
import CategoryStatsChart from '../components/CategoryStatsChart';
import TaskTrendOverview from '../components/TaskTrendOverview';
import ProjectStatsCard from '../components/ProjectStatsCard';
import ProjectTaskStatsChart from '../components/ProjectTaskStatsChart';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskDurationRanking from '../components/TaskDurationRanking';
import UserInfoCard from '../components/UserInfoCard';

// 名言接口类型定义
interface Quote {
  text: string;
  author: string;
  category?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const {
    taskStats,
    quadrantStats,
    categoryStats,
    yearTimeSeriesData,
    projectStats, // 新增：项目统计
    projectTaskStats, // 新增：项目任务统计
    taskDurationRanking, // 新增：任务耗时排行
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
    fetchProjectStats, // 新增：获取项目统计
    fetchProjectTaskStats, // 新增：获取项目任务统计
    fetchTaskDurationRanking, // 新增：获取任务耗时排行
    clearError
  } = useStatsStore();
  
  const navigate = useNavigate();

  // 退出登录确认对话框状态
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // 项目状态筛选状态
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>('active'); // 默认显示进行中的项目
  
  // 名言状态
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // 获取今日日期字符串（用于缓存key）
  const getTodayKey = () => {
    const today = new Date();
    return `daily-quote-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  // 从缓存中获取今日名言
  const getCachedQuote = (): Quote | null => {
    try {
      const todayKey = getTodayKey();
      const cached = localStorage.getItem(todayKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('读取缓存名言失败:', error);
    }
    return null;
  };

  // 保存名言到缓存
  const saveCachedQuote = (quote: Quote) => {
    try {
      const todayKey = getTodayKey();
      localStorage.setItem(todayKey, JSON.stringify(quote));
      
      // 清理旧的缓存（保留最近7天）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('daily-quote-')) {
          const dateMatch = key.match(/daily-quote-(\d+)-(\d+)-(\d+)/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            const cacheDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (cacheDate < sevenDaysAgo) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('保存缓存名言失败:', error);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // 获取每日名言
  const fetchDailyQuote = async (forceRefresh = false) => {
    // 如果不是强制刷新，先检查今日缓存
    if (!forceRefresh) {
      const cachedQuote = getCachedQuote();
      if (cachedQuote) {
        setQuote(cachedQuote);
        return;
      }
    }
    
    setQuoteLoading(true);
    setQuoteError(null);
    
    try {
      // 本地备用名言库
      const fallbackQuotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "wisdom" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "action" },
        { text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "motivation" },
        { text: "You learn more from failure than from success.", author: "Unknown", category: "learning" },
        { text: "If you are working on something exciting that you really care about, you don't have to be pushed.", author: "Steve Jobs", category: "passion" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "innovation" },
        { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "life" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "action" },
        { text: "It is never too late to be what you might have been.", author: "George Eliot", category: "potential" },
        { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "authenticity" },
        { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein", category: "wisdom" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "opportunity" }
      ];
      
      // 先尝试获取在线名言
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        const response = await fetch('https://api.quotable.io/random?tags=motivational,inspirational,success,wisdom', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const onlineQuote = {
            text: data.content,
            author: data.author,
            category: data.tags?.[0] || 'inspirational'
          };
          
          // 保存到缓存并显示
          setQuote(onlineQuote);
          saveCachedQuote(onlineQuote);
          setQuoteLoading(false);
          return;
        }
      } catch (error) {
        console.debug('在线名言获取失败，使用本地名言:', error);
      }
      
      // 如果在线获取失败，使用本地名言
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const randomQuote = fallbackQuotes[dayOfYear % fallbackQuotes.length]; // 基于日期选择，确保每天相同
      
      setQuote(randomQuote);
      saveCachedQuote(randomQuote);
      
    } catch (error) {
      console.error('获取名言失败:', error);
      setQuoteError('获取名言失败，请稍后重试');
    } finally {
      setQuoteLoading(false);
    }
  };

  // 初始化名言（检查缓存）
  useEffect(() => {
    const cachedQuote = getCachedQuote();
    if (cachedQuote) {
      setQuote(cachedQuote);
    } else {
      // 如果没有缓存，异步获取新名言
      fetchDailyQuote();
    }
  }, []); // 只在组件挂载时执行一次

  // 页面加载时获取数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('ProfilePage: 开始初始化数据');
        // 优先加载核心数据
        await Promise.all([
          fetchTasks(),
          fetchProjects()
        ]);
        
        // 然后加载统计数据
        await fetchAllStats();
        console.log('ProfilePage: 数据初始化完成');
      } catch (error) {
        console.error('ProfilePage: 初始化数据失败', error);
      }
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 当统计数据改变时重新获取数据 - 移除这个useEffect，避免重复调用
  // useEffect(() => {
  //   fetchAllStats();
  // }, [fetchAllStats]);

  // 当时间周期或日期改变时重新获取时间序列数据
  useEffect(() => {
    // 只获取时间序列数据，不触发全量统计数据获取
    fetchTimeSeriesData(selectedPeriod, selectedDate);
  }, [selectedPeriod, selectedDate, fetchTimeSeriesData]);

  // 获取年度热力图数据（只在页面加载时获取一次）
  useEffect(() => {
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

  // 生成今日信息 - 返回结构化数据
  const generateDailyMessage = () => {
    if (!tasks || tasks.length === 0) {
      const welcomeMessages = [
        { text: "新的一天开始了！准备好迎接挑战，创造属于你的精彩时刻 🌟", tasks: [], projects: [] },
        { text: "今天是全新的开始，让我们一起规划美好的任务吧 📝", tasks: [], projects: [] },
        { text: "空白的画布等待你来描绘，开始添加第一个任务吧 🎨", tasks: [], projects: [] },
        { text: "每个伟大的成就都始于第一步，今天就开始行动吧 🚀", tasks: [], projects: [] }
      ];
      return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }

    // 统计任务数据
    const mainTasks = tasks.filter(task => !task.parentTaskId);
    const inProgressTasks = mainTasks.filter(task => task.status === 'in-progress');
    const pendingTasks = mainTasks.filter(task => task.status === 'pending');
    const completedTasks = mainTasks.filter(task => task.status === 'completed');
    
    // 获取今日到期的任务
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const dueTodayTasks = mainTasks.filter(task => 
      task.dueDate && 
      task.status !== 'completed' &&
      new Date(task.dueDate) >= todayStart && 
      new Date(task.dueDate) <= todayEnd
    );

    // 获取逾期任务
    const overdueTasks = mainTasks.filter(task => 
      task.dueDate && 
      task.status !== 'completed' &&
      new Date(task.dueDate) < todayStart
    );

    // 获取紧急重要任务
    const urgentImportantTasks = mainTasks.filter(task => 
      task.urgency && task.importance && task.status !== 'completed'
    );

    let messageData = { text: "", tasks: [] as any[], projects: [] as any[] };

    // 优先处理紧急情况
    if (overdueTasks.length > 0) {
      const primaryTask = overdueTasks[0];
      messageData.tasks = [primaryTask];
      if (primaryTask.project) {
        messageData.projects = [primaryTask.project];
      }
      
      if (overdueTasks.length === 1) {
        messageData.text = `任务已逾期，建议优先处理`;
      } else {
        messageData.text = `有${overdueTasks.length}项任务已逾期，包括等，需要尽快处理`;
      }
      
    } else if (dueTodayTasks.length > 0) {
      const primaryTask = dueTodayTasks[0];
      messageData.tasks = [primaryTask];
      if (primaryTask.project) {
        messageData.projects = [primaryTask.project];
      }
      
      if (dueTodayTasks.length === 1) {
        messageData.text = `任务今天截止，记得及时完成`;
      } else {
        messageData.text = `今天有${dueTodayTasks.length}项任务截止，包括等`;
      }
      
    } else if (urgentImportantTasks.length > 0) {
      const primaryTask = urgentImportantTasks[0];
      messageData.tasks = [primaryTask];
      if (primaryTask.project) {
        messageData.projects = [primaryTask.project];
      }
      
      messageData.text = `等${urgentImportantTasks.length}项紧急重要任务等待处理`;
      
    } else if (inProgressTasks.length > 0) {
      if (inProgressTasks.length === 1) {
        const primaryTask = inProgressTasks[0];
        messageData.tasks = [primaryTask];
        if (primaryTask.project) {
          messageData.projects = [primaryTask.project];
        }
        messageData.text = `正在进行中，继续保持专注`;
      } else {
        messageData.text = `今天有${inProgressTasks.length}项任务正在进行中，稳步推进`;
        messageData.tasks = [];
        messageData.projects = [];
      }
      
    } else if (pendingTasks.length > 0) {
      const primaryTask = pendingTasks[0];
      messageData.tasks = [primaryTask];
      if (primaryTask.project) {
        messageData.projects = [primaryTask.project];
      }
      
      if (pendingTasks.length === 1) {
        messageData.text = `可以开始处理任务了`;
      } else {
        messageData.text = `有${pendingTasks.length}项任务等待开始，建议从开始`;
      }
      
    } else if (completedTasks.length > 0) {
      const completionMessages = [
        "所有任务都已完成，今天的你真棒",
        "任务清单已清空，享受这份成就感吧",
        "完美的一天，所有计划都已实现",
        "效率满分！今天的目标全部达成"
      ];
      messageData.text = completionMessages[Math.floor(Math.random() * completionMessages.length)];
      messageData.tasks = [];
      messageData.projects = [];
    }

    // 添加时间相关的鼓励语句
    const hour = new Date().getHours();
    let timeBasedEncouragement = "";
    
    if (hour < 9) {
      timeBasedEncouragement = "早晨的阳光为你加油 ☀️";
    } else if (hour < 12) {
      timeBasedEncouragement = "上午时光，效率最佳 🌅";
    } else if (hour < 14) {
      timeBasedEncouragement = "午后继续，保持节奏 🌤️";
    } else if (hour < 18) {
      timeBasedEncouragement = "下午加油，胜利在望 🌆";
    } else {
      timeBasedEncouragement = "夜晚时分，为明天做准备 🌙";
    }

    messageData.text += "。" + timeBasedEncouragement;
    return messageData;
  };

  // 渲染今日信息内容
  const renderDailyMessage = (overdueTaskList: any[], inProgressTaskList: any[], pendingTaskList: any[], overdueProjectList: any[], inProgressProjectList: any[], pendingProjectList: any[]) => {
    const messageData = generateDailyMessage();
    const { text, tasks, projects } = messageData;
    
    // 处理任务跳转
    const handleTaskClick = (task: any) => {
      // 跳转到任务管理页面并高亮该任务
      navigate('/tasks', { state: { highlightTaskId: task.id } });
    };

    // 处理项目跳转
    const handleProjectClick = (project: any) => {
      navigate(`/projects/${project.id}`);
    };

    // 处理统计数据跳转
    const handleStatsClick = (filter: string) => {
      navigate('/tasks', { state: { filter } });
    };

    // 处理项目统计数据跳转
    const handleProjectStatsClick = (filter: string) => {
      navigate('/projects', { state: { filter } });
    };

    // 创建任务统计标签组件 - 只显示数字
    const TaskStatsTag = ({ count, taskList, color, filter, label }: { 
      count: number, 
      taskList: any[],
      color: string, 
      filter: string,
      label: string
    }) => {
      // 生成任务列表的tooltip
      const generateTooltip = () => {
        if (taskList.length === 0) return `暂无${label}`;
        
        const taskNames = taskList.slice(0, 5).map(task => {
          const name = task.title.length > 15 ? task.title.substring(0, 15) + "..." : task.title;
          return `• ${name}`;
        }).join('\n');
        
        const moreText = taskList.length > 5 ? `\n... 还有${taskList.length - 5}个任务` : '';
        return `${label}列表：\n${taskNames}${moreText}\n\n点击查看详情`;
      };

      return (
        <span
          onClick={() => handleStatsClick(filter)}
          className={`inline-block mx-0.5 px-2 py-0.5 ${color} rounded-md cursor-pointer hover:opacity-80 transition-all duration-200 font-semibold text-sm border hover:shadow-sm transform hover:scale-105 active:scale-95`}
          title={generateTooltip()}
        >
          {count}
        </span>
      );
    };

    // 创建项目统计标签组件 - 只显示数字
    const ProjectStatsTag = ({ count, projectList, color, filter, label }: { 
      count: number, 
      projectList: any[],
      color: string, 
      filter: string,
      label: string
    }) => {
      // 生成项目列表的tooltip
      const generateTooltip = () => {
        if (projectList.length === 0) return `暂无${label}`;
        
        const projectNames = projectList.slice(0, 5).map(project => {
          const name = project.name.length > 15 ? project.name.substring(0, 15) + "..." : project.name;
          return `• ${name}`;
        }).join('\n');
        
        const moreText = projectList.length > 5 ? `\n... 还有${projectList.length - 5}个项目` : '';
        return `${label}列表：\n${projectNames}${moreText}\n\n点击查看详情`;
      };

      return (
        <span
          onClick={() => handleProjectStatsClick(filter)}
          className={`inline-block mx-0.5 px-2 py-0.5 ${color} rounded-md cursor-pointer hover:opacity-80 transition-all duration-200 font-semibold text-sm border hover:shadow-sm transform hover:scale-105 active:scale-95`}
          title={generateTooltip()}
        >
          {count}
        </span>
      );
    };

    // 生成任务概览
    const renderTaskOverview = () => {
      if (!tasks || tasks.length === 0) {
        return (
          <div className="text-base leading-relaxed mb-3 pb-3 border-b border-blue-200/50">
            <span className="text-gray-600">今天还没有任务安排，</span>
            <span 
              onClick={() => navigate('/tasks')}
              className="inline-block mx-0.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md cursor-pointer hover:bg-blue-200 transition-all duration-200 font-semibold text-sm border border-blue-200 hover:border-blue-300 hover:shadow-sm transform hover:scale-105 active:scale-95"
              title="点击前往任务管理页面添加新任务"
            >
              开始添加任务
            </span>
            <span className="text-gray-600">吧！</span>
          </div>
        );
      }

      const hasOverdue = overdueTaskList.length > 0 || overdueProjectList.length > 0;
      const hasInProgress = inProgressTaskList.length > 0 || inProgressProjectList.length > 0;
      const hasPending = pendingTaskList.length > 0 || pendingProjectList.length > 0;

      if (!hasOverdue && !hasInProgress && !hasPending) {
        return (
          <div className="text-base leading-relaxed mb-3 pb-3 border-b border-blue-200/50">
            <span className="text-gray-600">所有任务和项目都已完成，今天表现很棒！🎉</span>
          </div>
        );
      }

      return (
        <div className="text-base leading-relaxed mb-3 pb-3 border-b border-blue-200/50">
          <span className="text-gray-600">今日有</span>
          {(overdueTaskList.length > 0 || overdueProjectList.length > 0) && (
            <>
              {overdueTaskList.length > 0 && (
                <TaskStatsTag 
                  count={overdueTaskList.length} 
                  taskList={overdueTaskList}
                  color="bg-red-100 text-red-800 border-red-200 hover:border-red-300" 
                  filter="overdue"
                  label="逾期任务"
                />
              )}
              <span className="text-gray-600">个任务</span>
              {overdueTaskList.length > 0 && overdueProjectList.length > 0 && <span className="text-gray-600">和</span>}
              {overdueProjectList.length > 0 && (
                <>
                  <ProjectStatsTag 
                    count={overdueProjectList.length} 
                    projectList={overdueProjectList}
                    color="bg-red-100 text-red-800 border-red-200 hover:border-red-300" 
                    filter="overdue"
                    label="逾期项目"
                  />
                  <span className="text-gray-600">个项目</span>
                </>
              )}
              <span className="text-gray-600">已经逾期</span>
              {(hasInProgress || hasPending) && <span className="text-gray-600">，</span>}
            </>
          )}
          {(inProgressTaskList.length > 0 || inProgressProjectList.length > 0) && (
            <>
              {inProgressTaskList.length > 0 && (
                <TaskStatsTag 
                  count={inProgressTaskList.length} 
                  taskList={inProgressTaskList}
                  color="bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-300" 
                  filter="in-progress"
                  label="进行中任务"
                />
              )}
              <span className="text-gray-600">个任务</span>
              {inProgressTaskList.length > 0 && inProgressProjectList.length > 0 && <span className="text-gray-600">和</span>}
              {inProgressProjectList.length > 0 && (
                <>
                  <ProjectStatsTag 
                    count={inProgressProjectList.length} 
                    projectList={inProgressProjectList}
                    color="bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-300" 
                    filter="in-progress"
                    label="进行中项目"
                  />
                  <span className="text-gray-600">个项目</span>
                </>
              )}
              <span className="text-gray-600">在进行中</span>
              {hasPending && <span className="text-gray-600">，</span>}
            </>
          )}
          {(pendingTaskList.length > 0 || pendingProjectList.length > 0) && (
            <>
              {pendingTaskList.length > 0 && (
                <TaskStatsTag 
                  count={pendingTaskList.length} 
                  taskList={pendingTaskList}
                  color="bg-green-100 text-green-800 border-green-200 hover:border-green-300" 
                  filter="pending"
                  label="待办任务"
                />
              )}
              <span className="text-gray-600">个任务</span>
              {pendingTaskList.length > 0 && pendingProjectList.length > 0 && <span className="text-gray-600">和</span>}
              {pendingProjectList.length > 0 && (
                <>
                  <ProjectStatsTag 
                    count={pendingProjectList.length} 
                    projectList={pendingProjectList}
                    color="bg-green-100 text-green-800 border-green-200 hover:border-green-300" 
                    filter="pending"
                    label="待办项目"
                  />
                  <span className="text-gray-600">个项目</span>
                </>
              )}
              <span className="text-gray-600">马上就要开始了</span>
            </>
          )}
          <span className="text-gray-600">。加油，祝你有美好的一天！</span>
        </div>
      );
    };

    // 如果有任务，创建可点击的任务链接
    if (tasks.length > 0) {
      const task = tasks[0];
      const taskName = task.title.length > 12 ? task.title.substring(0, 12) + "..." : task.title;
      
      // 创建任务链接组件
      const TaskLink = () => (
        <span
          onClick={() => handleTaskClick(task)}
          className="inline-block mx-0.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md cursor-pointer hover:bg-blue-200 transition-all duration-200 font-semibold text-sm border border-blue-200 hover:border-blue-300 hover:shadow-sm transform hover:scale-105 active:scale-95"
          title={`任务: ${task.title}${task.description ? '\n描述: ' + task.description : ''}${task.dueDate ? '\n截止: ' + new Date(task.dueDate).toLocaleDateString('zh-CN') : ''}${task.project ? '\n项目: ' + task.project.name : ''}`}
        >
          {taskName}
        </span>
      );

      // 创建项目链接组件
      const ProjectLink = ({ project }: { project: any }) => (
        <span
          onClick={() => handleProjectClick(project)}
          className="inline-block mx-0.5 px-2 py-0.5 bg-green-100 text-green-800 rounded-md cursor-pointer hover:bg-green-200 transition-all duration-200 font-semibold text-sm border border-green-200 hover:border-green-300 hover:shadow-sm transform hover:scale-105 active:scale-95"
          title={`项目: ${project.name}${project.description ? '\n描述: ' + project.description : ''}`}
        >
          {project.name}
        </span>
      );
      
      // 根据不同的消息模式插入任务名称
      if (text.includes('任务已逾期')) {
        return (
          <div>
            {renderTaskOverview()}
            <div className="text-base leading-relaxed">
              <TaskLink />
              任务已逾期，建议优先处理
              {projects.length > 0 && (
                <>
                  {' '}(项目: <ProjectLink project={projects[0]} />)
                </>
              )}
              。{text.split('。')[1]}
            </div>
          </div>
        );
      } else if (text.includes('任务今天截止')) {
        return (
          <div>
            {renderTaskOverview()}
            <div className="text-base leading-relaxed">
              <TaskLink />
              任务今天截止，记得及时完成
              {projects.length > 0 && (
                <>
                  {' '}(项目: <ProjectLink project={projects[0]} />)
                </>
              )}
              。{text.split('。')[1]}
            </div>
          </div>
        );
      } else if (text.includes('紧急重要任务等待处理')) {
        return (
          <div>
            {renderTaskOverview()}
            <div className="text-base leading-relaxed">
              <TaskLink />
              等{text.match(/\d+/)?.[0] || ''}项紧急重要任务等待处理
              {projects.length > 0 && (
                <>
                  {' '}(项目: <ProjectLink project={projects[0]} />)
                </>
              )}
              。{text.split('。')[1]}
            </div>
          </div>
        );
      } else if (text.includes('正在进行中')) {
        return (
          <div>
            {renderTaskOverview()}
            <div className="text-base leading-relaxed">
              <TaskLink />
              正在进行中，继续保持专注
              {projects.length > 0 && (
                <>
                  {' '}(项目: <ProjectLink project={projects[0]} />)
                </>
              )}
              。{text.split('。')[1]}
            </div>
          </div>
        );
      } else if (text.includes('可以开始处理') || text.includes('建议从')) {
        return (
          <div>
            {renderTaskOverview()}
            <div className="text-base leading-relaxed">
              {text.includes('可以开始处理') ? '可以开始处理' : `有${text.match(/\d+/)?.[0] || ''}项任务等待开始，建议从`}
              <TaskLink />
              {text.includes('可以开始处理') ? '任务了' : '开始'}
              {projects.length > 0 && (
                <>
                  {' '}(项目: <ProjectLink project={projects[0]} />)
                </>
              )}
              。{text.split('。')[1]}
            </div>
          </div>
        );
      }
    }

    // 组合任务概览和今日信息
    return (
      <div>
        {renderTaskOverview()}
        <div className="text-base leading-relaxed">{text}</div>
      </div>
    );
  };

  // 渲染每日名言组件
  const renderDailyQuote = () => {
    if (quoteLoading) {
      return (
        <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-3 border border-purple-200 shadow-lg overflow-hidden h-full">
          <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mb-2"></div>
            <span className="text-xs text-purple-600 text-center">获取名言中...</span>
          </div>
        </div>
      );
    }

    if (quoteError) {
      return (
        <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-xl p-3 border border-gray-200 shadow-lg overflow-hidden h-full">
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] gap-2">
            <span className="text-gray-500 text-xs text-center">暂时无法获取名言</span>
            <button
              onClick={() => fetchDailyQuote(true)}
              className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors text-xs"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    if (!quote) {
      return null;
    }

    return (
      <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-3 border border-purple-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-200/20 to-purple-200/20 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300/40 rounded-full"></div>
        <div className="absolute top-1/4 right-1/3 w-0.5 h-0.5 bg-pink-400/50 rounded-full"></div>
        
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">✨</span>
            </div>
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              每日名言
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center mb-3">
            <blockquote className="text-xs leading-relaxed text-gray-700 font-medium italic mb-2">
              "{quote.text}"
            </blockquote>
            <div className="flex flex-col gap-1">
              <cite className="text-xs text-purple-600 font-semibold not-italic">
                — {quote.author}
              </cite>
              {quote.category && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full self-start">
                  {quote.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                <span className="font-medium">今日 {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <button
              onClick={() => fetchDailyQuote(true)}
              className="text-xs text-purple-500 hover:text-purple-700 transition-colors flex items-center justify-center gap-1 py-1"
              title="获取新的名言"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              换一句
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 计算基础统计数据（用于卡片显示，只统计主任务）
  const mainTasks = tasks.filter(task => !task.parentTaskId);
  const allTasks = mainTasks.length;
  const completedTasks = mainTasks.filter(task => task.status === 'completed').length;
  
  // 计算任务列表和数量
  const inProgressTaskList = mainTasks.filter(task => task.status === 'in-progress');
  const inProgressTasks = inProgressTaskList.length;
  
  const pendingTaskList = mainTasks.filter(task => task.status === 'pending');
  const pendingTasks = pendingTaskList.length;

  // 计算逾期任务列表和数量
  const now = new Date();
  const overdueTaskList = mainTasks.filter(task => 
    task.status !== 'completed' && 
    task.dueDate && 
    new Date(task.dueDate) < now
  );
  const overdueTasks = overdueTaskList.length;

  // 计算项目统计数据
  const allProjects = projects || [];
  
  // 计算逾期项目列表和数量
  const overdueProjectList = allProjects.filter(project => 
    project.status !== 'completed' && 
    project.endDate && 
    new Date(project.endDate) < now
  );
  
  // 计算进行中项目列表和数量（active状态对应进行中）
  const inProgressProjectList = allProjects.filter(project => project.status === 'active');
  
  // 计算待办项目列表和数量（planning状态对应待办）
  const pendingProjectList = allProjects.filter(project => project.status === 'planning');

  // 计算今日到期任务
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const dueTodayTasks = mainTasks.filter(task => 
    task.status !== 'completed' &&
    task.dueDate && 
    new Date(task.dueDate) >= todayStart && 
    new Date(task.dueDate) <= todayEnd
  ).length;

  // 计算本周任务
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 调整为周一开始
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const thisWeekTasks = mainTasks.filter(task => 
    task.status !== 'completed' &&
    task.dueDate && 
    new Date(task.dueDate) >= startOfWeek && 
    new Date(task.dueDate) <= endOfWeek
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
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* 左侧：个人信息 - 占1列 */}
          <div className="lg:col-span-1">
            <UserInfoCard user={user} onLogout={handleLogout} />
          </div>
          
          {/* 中间：今日信息 - 占3列 */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
              {/* 装饰性背景元素 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full translate-y-10 -translate-x-10"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-300/40 rounded-full"></div>
              <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-indigo-400/50 rounded-full"></div>
              
              <div className="relative flex items-start gap-3 h-full">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">💡</span>
                </div>
                <div className="flex-1 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      今日信息
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-indigo-300 to-transparent"></div>
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                  </div>
                  <div className="text-gray-700 leading-relaxed font-medium flex-1 flex items-start text-sm">
                    {renderDailyMessage(overdueTaskList, inProgressTaskList, pendingTaskList, overdueProjectList, inProgressProjectList, pendingProjectList)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-blue-600">
                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
                      <span className="font-medium">今日 {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="text-xs text-gray-500 opacity-70">
                      点击任务或项目可快速跳转
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：每日名言 - 占1列 */}
          <div className="lg:col-span-1">
            {renderDailyQuote()}
          </div>
        </div>
      </div>

      {/* 所有统计卡片 - 一行显示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
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
          title="本周任务"
          value={thisWeekTasks}
          color="blue"
          onClick={() => navigate('/tasks', { state: { filter: 'this-week' } })}
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

      {/* 图表区域 - 三个组件并排显示 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务状态分布饼图 */}
        {taskStats && (
          <TaskStatusPieChart stats={taskStats} />
        )}
        
        {/* 四象限分布饼图 */}
        {quadrantStats && (
          <QuadrantPieChart stats={quadrantStats} />
        )}

        {/* 任务耗时排行 */}
        <TaskDurationRanking 
          data={taskDurationRanking} 
          year={selectedDate.getFullYear()}
          onTaskClick={(taskId) => navigate('/tasks', { state: { highlightTaskId: taskId } })}
        />
      </div>

      {/* 分类统计图 */}
      {categoryStats.length > 0 && (
        <CategoryStatsChart data={categoryStats} />
      )}

      {/* 项目统计区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 项目统计卡片 */}
        {projectStats ? (
          <ProjectStatsCard 
            stats={projectStats} 
            onProjectsClick={() => navigate('/projects')}
            onStatusFilter={setSelectedProjectStatus}
            selectedStatus={selectedProjectStatus}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">项目概览</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                正在加载项目统计数据...
              </h4>
              <button
                onClick={() => {
                  console.log('手动刷新项目统计数据');
                  fetchProjectStats();
                  fetchProjectTaskStats();
                  fetchTaskDurationRanking();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                刷新数据
              </button>
            </div>
          </div>
        )}
        
        {/* 项目任务统计图表 */}
        {projectTaskStats.length > 0 ? (
          <ProjectTaskStatsChart 
            data={projectTaskStats} 
            onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
            selectedStatus={selectedProjectStatus}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">项目任务分布</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                暂无项目数据
              </h4>
              <p className="text-gray-600 mb-4">
                正在加载项目数据，请稍候...
              </p>
              <div className="text-xs text-gray-500">
                数据长度: {projectTaskStats.length} | 加载状态: {loading ? '加载中' : '已完成'} | 错误: {error || '无'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 退出登录确认对话框 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="退出登录"
        message={`确定要退出登录吗？\n\n当前用户：${user?.username}\n\n退出后需要重新登录才能访问系统。`}
        confirmText="退出登录"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />

    </div>
  );
};

export default ProfilePage;