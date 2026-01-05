import React, { useState, useEffect } from 'react';
import { Project, Objective, KeyResult, ResourceRequirement, ExecutionPlan, ActionCheck } from '../types';
import { useOKRStore } from '../store/okrStore';
import ObjectiveForm from './ObjectiveForm';
import KeyResultForm from './KeyResultForm';
import KeyResultUpdateForm from './KeyResultUpdateForm';
import ResourceRequirementForm from './ResourceRequirementForm';
import ExecutionPlanForm from './ExecutionPlanForm';
import ActionCheckForm from './ActionCheckForm';
import ConfirmDialog from './ConfirmDialog';
import { format } from 'date-fns';

interface ProjectOKRProps {
  project: Project;
}

const ProjectOKR: React.FC<ProjectOKRProps> = ({ project }) => {
  const {
    objectives,
    loading,
    error,
    fetchObjectives,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    createKeyResultUpdate,
    createResourceRequirement,
    updateResourceRequirement,
    deleteResourceRequirement,
    createExecutionPlan,
    updateExecutionPlan,
    deleteExecutionPlan,
    createActionCheck,
    updateActionCheck,
    deleteActionCheck,
    clearError
  } = useOKRStore();

  // 调试：检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('ProjectOKR: Auth token exists:', !!token);
    console.log('ProjectOKR: Project ID:', project.id);
    console.log('ProjectOKR: API Base URL:', 'http://localhost:5000/api');
  }, [project.id]);

  // 表单状态
  const [isObjectiveFormOpen, setIsObjectiveFormOpen] = useState(false);
  const [isKeyResultFormOpen, setIsKeyResultFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [isExecutionFormOpen, setIsExecutionFormOpen] = useState(false);
  const [isActionFormOpen, setIsActionFormOpen] = useState(false);
  
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
  const [editingResource, setEditingResource] = useState<ResourceRequirement | null>(null);
  const [editingExecution, setEditingExecution] = useState<ExecutionPlan | null>(null);
  const [editingAction, setEditingAction] = useState<ActionCheck | null>(null);
  
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<number | null>(null);
  const [updatingKeyResult, setUpdatingKeyResult] = useState<KeyResult | null>(null);
  // 为每个目标维护独立的标签页状态
  const [objectiveActiveTabs, setObjectiveActiveTabs] = useState<Record<number, 'keyResults' | 'resources' | 'execution' | 'actions'>>({});

  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'objective' | 'keyResult';
    id: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchObjectives(project.id);
  }, [project.id, fetchObjectives]);

  // 获取指定目标的活动标签页
  const getActiveTab = (objectiveId: number): 'keyResults' | 'resources' | 'execution' | 'actions' => {
    return objectiveActiveTabs[objectiveId] || 'keyResults';
  };

  // 设置指定目标的活动标签页
  const setActiveTab = (objectiveId: number, tab: 'keyResults' | 'resources' | 'execution' | 'actions') => {
    setObjectiveActiveTabs(prev => ({
      ...prev,
      [objectiveId]: tab
    }));
  };

  // 目标操作
  const handleCreateObjective = async (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'keyResults'>) => {
    try {
      await createObjective(objectiveData);
      setIsObjectiveFormOpen(false);
    } catch (error) {
      console.error('创建目标失败:', error);
    }
  };

  const handleEditObjective = (objective: Objective) => {
    setEditingObjective(objective);
    setIsObjectiveFormOpen(true);
  };

  const handleUpdateObjective = async (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'keyResults'>) => {
    if (editingObjective) {
      try {
        await updateObjective(editingObjective.id, objectiveData);
        setEditingObjective(null);
        setIsObjectiveFormOpen(false);
      } catch (error) {
        console.error('更新目标失败:', error);
      }
    }
  };

  const handleDeleteObjectiveWithConfirm = (objective: Objective) => {
    setDeleteTarget({
      type: 'objective',
      id: objective.id,
      title: objective.title
    });
    setShowDeleteConfirm(true);
  };

  // 关键结果操作
  const handleCreateKeyResult = (objectiveId: number) => {
    setSelectedObjectiveId(objectiveId);
    setIsKeyResultFormOpen(true);
  };

  // 资源需求操作
  const handleCreateResource = (objectiveId: number) => {
    setSelectedObjectiveId(objectiveId);
    setIsResourceFormOpen(true);
  };

  // 执行计划操作
  const handleCreateExecution = (objectiveId: number) => {
    setSelectedObjectiveId(objectiveId);
    setIsExecutionFormOpen(true);
  };

  // 行动检查操作
  const handleCreateAction = (objectiveId: number) => {
    setSelectedObjectiveId(objectiveId);
    setIsActionFormOpen(true);
  };

  const handleCreateKeyResultSubmit = async (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    try {
      await createKeyResult(keyResultData);
      setSelectedObjectiveId(null);
      setIsKeyResultFormOpen(false);
    } catch (error) {
      console.error('创建关键结果失败:', error);
    }
  };

  const handleEditKeyResult = (keyResult: KeyResult) => {
    setEditingKeyResult(keyResult);
    setSelectedObjectiveId(keyResult.objectiveId);
    setIsKeyResultFormOpen(true);
  };

  const handleUpdateKeyResult = async (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    if (editingKeyResult) {
      try {
        await updateKeyResult(editingKeyResult.id, keyResultData);
        setEditingKeyResult(null);
        setSelectedObjectiveId(null);
        setIsKeyResultFormOpen(false);
      } catch (error) {
        console.error('更新关键结果失败:', error);
      }
    }
  };

  const handleDeleteKeyResultWithConfirm = (keyResult: KeyResult) => {
    setDeleteTarget({
      type: 'keyResult',
      id: keyResult.id,
      title: keyResult.description || '关键结果'
    });
    setShowDeleteConfirm(true);
  };

  // 关键结果更新操作
  const handleUpdateKeyResultProgress = (keyResult: KeyResult) => {
    setUpdatingKeyResult(keyResult);
    setIsUpdateFormOpen(true);
  };

  const handleCreateUpdate = async (updateData: any) => {
    try {
      await createKeyResultUpdate(updateData);
      setUpdatingKeyResult(null);
      setIsUpdateFormOpen(false);
    } catch (error) {
      console.error('创建更新记录失败:', error);
    }
  };

  // 资源需求处理函数
  const handleCreateResourceRequirement = async (resourceData: Omit<ResourceRequirement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createResourceRequirement(resourceData);
      setSelectedObjectiveId(null);
      setIsResourceFormOpen(false);
    } catch (error) {
      console.error('创建资源需求失败:', error);
    }
  };

  const handleUpdateResourceRequirement = async (resourceId: number, resourceData: Partial<ResourceRequirement>) => {
    try {
      await updateResourceRequirement(resourceId, resourceData);
      setEditingResource(null);
      setSelectedObjectiveId(null);
      setIsResourceFormOpen(false);
    } catch (error) {
      console.error('更新资源需求失败:', error);
    }
  };

  const handleDeleteResourceRequirement = async (resourceId: number) => {
    try {
      await deleteResourceRequirement(resourceId);
      setEditingResource(null);
      setSelectedObjectiveId(null);
      setIsResourceFormOpen(false);
    } catch (error) {
      console.error('删除资源需求失败:', error);
    }
  };

  // 执行计划处理函数
  const handleCreateExecutionPlan = async (planData: Omit<ExecutionPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createExecutionPlan(planData);
      setSelectedObjectiveId(null);
      setIsExecutionFormOpen(false);
    } catch (error) {
      console.error('创建执行计划失败:', error);
    }
  };

  const handleUpdateExecutionPlan = async (planId: number, planData: Partial<ExecutionPlan>) => {
    try {
      await updateExecutionPlan(planId, planData);
      setEditingExecution(null);
      setSelectedObjectiveId(null);
      setIsExecutionFormOpen(false);
    } catch (error) {
      console.error('更新执行计划失败:', error);
    }
  };

  const handleDeleteExecutionPlan = async (planId: number) => {
    try {
      await deleteExecutionPlan(planId);
      setEditingExecution(null);
      setSelectedObjectiveId(null);
      setIsExecutionFormOpen(false);
    } catch (error) {
      console.error('删除执行计划失败:', error);
    }
  };

  // 行动检查处理函数
  const handleCreateActionCheck = async (checkData: Omit<ActionCheck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createActionCheck(checkData);
      setSelectedObjectiveId(null);
      setIsActionFormOpen(false);
    } catch (error) {
      console.error('创建行动检查失败:', error);
    }
  };

  const handleUpdateActionCheck = async (checkId: number, checkData: Partial<ActionCheck>) => {
    try {
      await updateActionCheck(checkId, checkData);
      setEditingAction(null);
      setSelectedObjectiveId(null);
      setIsActionFormOpen(false);
    } catch (error) {
      console.error('更新行动检查失败:', error);
    }
  };

  const handleDeleteActionCheck = async (checkId: number) => {
    try {
      await deleteActionCheck(checkId);
      setEditingAction(null);
      setSelectedObjectiveId(null);
      setIsActionFormOpen(false);
    } catch (error) {
      console.error('删除行动检查失败:', error);
    }
  };

  // 删除确认
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'objective') {
        await deleteObjective(deleteTarget.id);
      } else {
        await deleteKeyResult(deleteTarget.id);
      }
      setDeleteTarget(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  // 表单关闭处理
  const handleCloseObjectiveForm = () => {
    setIsObjectiveFormOpen(false);
    setEditingObjective(null);
  };

  const handleCloseKeyResultForm = () => {
    setIsKeyResultFormOpen(false);
    setEditingKeyResult(null);
    setSelectedObjectiveId(null);
  };

  const handleCloseUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setUpdatingKeyResult(null);
  };

  const handleCloseResourceForm = () => {
    setIsResourceFormOpen(false);
    setEditingResource(null);
    setSelectedObjectiveId(null);
  };

  const handleCloseExecutionForm = () => {
    setIsExecutionFormOpen(false);
    setEditingExecution(null);
    setSelectedObjectiveId(null);
  };

  const handleCloseActionForm = () => {
    setIsActionFormOpen(false);
    setEditingAction(null);
    setSelectedObjectiveId(null);
  };

  // 获取状态样式
  const getObjectiveStatusConfig = (status: Objective['status']) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: '📝', text: '草稿' };
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: '🚀', text: '进行中' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: '已完成' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: '❌', text: '已取消' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📝', text: '未知' };
    }
  };

  const getKeyResultStatusConfig = (status: KeyResult['status']) => {
    switch (status) {
      case 'not-started':
        return { color: 'bg-gray-100 text-gray-800', icon: '⏸️', text: '未开始' };
      case 'in-progress':
        return { color: 'bg-blue-100 text-blue-800', icon: '🔄', text: '进行中' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: '已完成' };
      case 'at-risk':
        return { color: 'bg-red-100 text-red-800', icon: '⚠️', text: '有风险' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '⏸️', text: '未知' };
    }
  };

  if (loading && objectives.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载OKR中...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            🎯 项目OKR
          </h2>
          <p className="text-xs text-gray-600">目标与关键结果管理</p>
        </div>
        <button
          onClick={() => setIsObjectiveFormOpen(true)}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          创建目标
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="text-red-400 mr-2 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-medium text-red-800 mb-1">
                  加载OKR数据时出错
                </h3>
                <p className="text-xs text-red-700">{error}</p>
                <div className="mt-1">
                  <button
                    onClick={() => {
                      clearError();
                      fetchObjectives(project.id);
                    }}
                    className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded hover:bg-red-200 transition-colors"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* OKR列表 */}
      {objectives.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 text-3xl mb-3">🎯</div>
          <h3 className="text-base font-medium text-gray-900 mb-2">还没有设置OKR</h3>
          <p className="text-sm text-gray-600 mb-3">
            为项目设置目标与关键结果，让团队目标更加清晰
          </p>
          <button
            onClick={() => setIsObjectiveFormOpen(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            创建第一个目标
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => {
            const statusConfig = getObjectiveStatusConfig(objective.status);
            
            return (
              <div key={objective.id} className="border border-gray-200 rounded-lg p-3">
                {/* 目标头部 */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{objective.title}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusConfig.color} flex items-center gap-1`}>
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.text}</span>
                      </span>
                    </div>
                    {objective.description && (
                      <div 
                        className="text-gray-600 text-xs mb-1 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                        dangerouslySetInnerHTML={{ __html: objective.description }}
                      />
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {objective.startDate && (
                        <span>开始: {format(new Date(objective.startDate), 'MM-dd')}</span>
                      )}
                      {objective.endDate && (
                        <span>结束: {format(new Date(objective.endDate), 'MM-dd')}</span>
                      )}
                      <span>进度: {objective.progress}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleEditObjective(objective)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-1.5 py-0.5"
                      title="编辑目标"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteObjectiveWithConfirm(objective)}
                      className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5"
                      title="删除目标"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 目标进度条 */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        objective.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${objective.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 目标的四个平级组件 */}
                <div>
                  {/* 标签页导航 */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex bg-gray-50 rounded p-0.5">
                      <button
                        onClick={() => setActiveTab(objective.id, 'keyResults')}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          getActiveTab(objective.id) === 'keyResults'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🎯 关键结果 ({objective.keyResults?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab(objective.id, 'resources')}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          getActiveTab(objective.id) === 'resources'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📦 资源需求 ({objective.resourceRequirements?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab(objective.id, 'execution')}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          getActiveTab(objective.id) === 'execution'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📋 执行计划 ({objective.executionPlans?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab(objective.id, 'actions')}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          getActiveTab(objective.id) === 'actions'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        ✅ 行动检查 ({objective.actionChecks?.length || 0})
                      </button>
                    </div>

                    {/* 添加按钮 */}
                    <div className="flex gap-1">
                      {getActiveTab(objective.id) === 'keyResults' && (
                        <button
                          onClick={() => handleCreateKeyResult(objective.id)}
                          className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          添加关键结果
                        </button>
                      )}
                      {getActiveTab(objective.id) === 'resources' && (
                        <button
                          onClick={() => handleCreateResource(objective.id)}
                          className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          添加资源需求
                        </button>
                      )}
                      {getActiveTab(objective.id) === 'execution' && (
                        <button
                          onClick={() => handleCreateExecution(objective.id)}
                          className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          添加执行计划
                        </button>
                      )}
                      {getActiveTab(objective.id) === 'actions' && (
                        <button
                          onClick={() => handleCreateAction(objective.id)}
                          className="bg-orange-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-orange-700 transition-colors"
                        >
                          添加行动检查
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 标签页内容 */}
                  <div className="min-h-24">
                    {getActiveTab(objective.id) === 'keyResults' && (
                      <div>
                        {objective.keyResults && objective.keyResults.length > 0 ? (
                          <div className="space-y-2">
                            {objective.keyResults.map((keyResult) => {
                              const krStatusConfig = getKeyResultStatusConfig(keyResult.status);
                              
                              return (
                                <div key={keyResult.id} className="bg-gray-50 rounded p-2">
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${krStatusConfig.color} flex items-center gap-1`}>
                                          <span>{krStatusConfig.icon}</span>
                                          <span>{krStatusConfig.text}</span>
                                        </span>
                                      </div>
                                      {keyResult.description && (
                                        <div 
                                          className="text-gray-700 text-xs mb-1 font-medium prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                                          dangerouslySetInnerHTML={{ __html: keyResult.description }}
                                        />
                                      )}
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>进度: {keyResult.progress}%</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <button
                                        onClick={() => handleUpdateKeyResultProgress(keyResult)}
                                        className="text-green-600 hover:text-green-800 text-xs px-1 py-0.5"
                                        title="更新进度"
                                      >
                                        更新
                                      </button>
                                      <button
                                        onClick={() => handleEditKeyResult(keyResult)}
                                        className="text-blue-600 hover:text-blue-800 text-xs px-1 py-0.5"
                                        title="编辑关键结果"
                                      >
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => handleDeleteKeyResultWithConfirm(keyResult)}
                                        className="text-red-600 hover:text-red-800 text-xs px-1 py-0.5"
                                        title="删除关键结果"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>

                                  {/* 关键结果进度条 */}
                                  <div className="mb-1">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                          keyResult.progress === 100 ? 'bg-green-500' : 
                                          keyResult.status === 'at-risk' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${keyResult.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* 最近更新 */}
                                  {keyResult.updates && keyResult.updates.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      最近更新: {format(new Date(keyResult.updates[0].createdAt), 'MM-dd HH:mm')}
                                      {keyResult.updates[0].note && (
                                        <span className="ml-1">- {keyResult.updates[0].note}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <div className="text-xl mb-2">🎯</div>
                            <p>还没有关键结果</p>
                            <p className="text-xs mt-1">点击"添加关键结果"开始设置</p>
                          </div>
                        )}
                      </div>
                    )}

                    {getActiveTab(objective.id) === 'resources' && (
                      <div>
                        {objective.resourceRequirements && objective.resourceRequirements.length > 0 ? (
                          <div className="space-y-2">
                            {objective.resourceRequirements.map((resource) => (
                              <div key={resource.id} className="bg-gray-50 rounded p-2">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 mb-1">
                                      <h5 className="font-medium text-gray-900 text-xs">{resource.title}</h5>
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        resource.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        resource.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                                        resource.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {resource.status === 'completed' ? '已完成' :
                                         resource.status === 'allocated' ? '已分配' :
                                         resource.status === 'approved' ? '已批准' : '已申请'}
                                      </span>
                                    </div>
                                    {resource.description && (
                                      <div 
                                        className="text-gray-600 text-xs mb-1 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                                        dangerouslySetInnerHTML={{ __html: resource.description }}
                                      />
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span>类型: {
                                        resource.type === 'human' ? '👥 人力资源' :
                                        resource.type === 'financial' ? '💰 资金' :
                                        resource.type === 'material' ? '📦 物料' :
                                        resource.type === 'technical' ? '🔧 技术' : '📋 其他'
                                      }</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => {
                                        setEditingResource(resource);
                                        setSelectedObjectiveId(resource.objectiveId);
                                        setIsResourceFormOpen(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-xs px-1 py-0.5"
                                      title="编辑资源需求"
                                    >
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => handleDeleteResourceRequirement(resource.id)}
                                      className="text-red-600 hover:text-red-800 text-xs px-1 py-0.5"
                                      title="删除资源需求"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <div className="text-xl mb-2">📦</div>
                            <p>还没有资源需求</p>
                            <p className="text-xs mt-1">点击"添加资源需求"开始设置</p>
                          </div>
                        )}
                      </div>
                    )}

                    {getActiveTab(objective.id) === 'execution' && (
                      <div>
                        {objective.executionPlans && objective.executionPlans.length > 0 ? (
                          <div className="space-y-2">
                            {objective.executionPlans.map((plan) => (
                              <div key={plan.id} className="bg-gray-50 rounded p-2">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 mb-1">
                                      <h5 className="font-medium text-gray-900 text-xs">{plan.title}</h5>
                                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                        {plan.phase}
                                      </span>
                                    </div>
                                    {plan.description && (
                                      <div 
                                        className="text-gray-600 text-xs mb-1 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                                        dangerouslySetInnerHTML={{ __html: plan.description }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => {
                                        setEditingExecution(plan);
                                        setSelectedObjectiveId(plan.objectiveId);
                                        setIsExecutionFormOpen(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-xs px-1 py-0.5"
                                      title="编辑执行计划"
                                    >
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExecutionPlan(plan.id)}
                                      className="text-red-600 hover:text-red-800 text-xs px-1 py-0.5"
                                      title="删除执行计划"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <div className="text-xl mb-2">📋</div>
                            <p>还没有执行计划</p>
                            <p className="text-xs mt-1">点击"添加执行计划"开始设置</p>
                          </div>
                        )}
                      </div>
                    )}

                    {getActiveTab(objective.id) === 'actions' && (
                      <div>
                        {objective.actionChecks && objective.actionChecks.length > 0 ? (
                          <div className="space-y-2">
                            {objective.actionChecks.map((check) => {
                              let checklist = [];
                              try {
                                checklist = check.criteria ? JSON.parse(check.criteria) : [];
                              } catch (e) {
                                checklist = check.criteria ? [{ id: '1', text: check.criteria, completed: false }] : [];
                              }
                              
                              const completedCount = checklist.filter((item: any) => item.completed).length;
                              const totalCount = checklist.length;
                              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                              
                              return (
                                <div key={check.id} className="bg-gray-50 rounded p-2">
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-1">
                                        <h5 className="font-medium text-gray-900 text-xs">{check.title}</h5>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                          check.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          check.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                          check.status === 'failed' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {check.status === 'completed' ? '已完成' :
                                           check.status === 'in-progress' ? '进行中' :
                                           check.status === 'failed' ? '失败' : '待处理'}
                                        </span>
                                      </div>
                                      {check.description && (
                                        <div 
                                          className="text-gray-600 text-xs mb-1 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                                          dangerouslySetInnerHTML={{ __html: check.description }}
                                        />
                                      )}
                                      <div className="text-xs text-gray-500 mb-1">
                                        完成进度: {completedCount} / {totalCount} ({progress}%)
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                        <div 
                                          className={`h-1.5 rounded-full transition-all duration-300 ${
                                            progress === 100 ? 'bg-green-500' : 
                                            check.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                                          }`}
                                          style={{ width: `${progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <button
                                        onClick={() => {
                                          setEditingAction(check);
                                          setSelectedObjectiveId(check.objectiveId);
                                          setIsActionFormOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-xs px-1 py-0.5"
                                        title="编辑行动检查"
                                      >
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => handleDeleteActionCheck(check.id)}
                                        className="text-red-600 hover:text-red-800 text-xs px-1 py-0.5"
                                        title="删除行动检查"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <div className="text-xl mb-2">✅</div>
                            <p>还没有行动检查</p>
                            <p className="text-xs mt-1">点击"添加行动检查"开始设置</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 目标表单 */}
      <ObjectiveForm
        objective={editingObjective}
        projectId={project.id}
        onSubmit={editingObjective ? handleUpdateObjective : handleCreateObjective}
        onClose={handleCloseObjectiveForm}
        onDelete={editingObjective ? () => handleDeleteObjectiveWithConfirm(editingObjective) : undefined}
        isOpen={isObjectiveFormOpen}
        asModal={true}
      />

      {/* 关键结果表单 */}
      <KeyResultForm
        keyResult={editingKeyResult}
        objectiveId={selectedObjectiveId || 0}
        onSubmit={editingKeyResult ? handleUpdateKeyResult : handleCreateKeyResultSubmit}
        onClose={handleCloseKeyResultForm}
        onDelete={editingKeyResult ? () => handleDeleteKeyResultWithConfirm(editingKeyResult) : undefined}
        isOpen={isKeyResultFormOpen}
        asModal={true}
      />

      {/* 关键结果更新表单 */}
      {updatingKeyResult && (
        <KeyResultUpdateForm
          keyResult={updatingKeyResult}
          onSubmit={handleCreateUpdate}
          onClose={handleCloseUpdateForm}
          isOpen={isUpdateFormOpen}
        />
      )}

      {/* 资源需求表单 */}
      <ResourceRequirementForm
        resourceRequirement={editingResource}
        objectiveId={selectedObjectiveId || 0}
        onSubmit={editingResource ? 
          (data) => handleUpdateResourceRequirement(editingResource.id, data) : 
          handleCreateResourceRequirement
        }
        onClose={handleCloseResourceForm}
        onDelete={editingResource ? () => handleDeleteResourceRequirement(editingResource.id) : undefined}
        isOpen={isResourceFormOpen}
        asModal={true}
      />

      {/* 执行计划表单 */}
      <ExecutionPlanForm
        executionPlan={editingExecution}
        objectiveId={selectedObjectiveId || 0}
        onSubmit={editingExecution ? 
          (data) => handleUpdateExecutionPlan(editingExecution.id, data) : 
          handleCreateExecutionPlan
        }
        onClose={handleCloseExecutionForm}
        onDelete={editingExecution ? () => handleDeleteExecutionPlan(editingExecution.id) : undefined}
        isOpen={isExecutionFormOpen}
        asModal={true}
      />

      {/* 行动检查表单 */}
      <ActionCheckForm
        actionCheck={editingAction}
        objectiveId={selectedObjectiveId || 0}
        onSubmit={editingAction ? 
          (data) => handleUpdateActionCheck(editingAction.id, data) : 
          handleCreateActionCheck
        }
        onClose={handleCloseActionForm}
        onDelete={editingAction ? () => handleDeleteActionCheck(editingAction.id) : undefined}
        isOpen={isActionFormOpen}
        asModal={true}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`删除${deleteTarget?.type === 'objective' ? '目标' : '关键结果'}`}
        message={deleteTarget ? `确定要删除"${deleteTarget.title}"吗？此操作无法撤销。` : ''}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ProjectOKR;