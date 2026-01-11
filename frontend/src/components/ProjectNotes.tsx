import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Project, ProjectNote } from '../types';
import { 
  createProjectNote, 
  getProjectNotes, 
  updateProjectNote, 
  deleteProjectNote 
} from '../services/projectNoteService';
import { uploadImage, compressImage } from '../services/uploadService';
import { format } from 'date-fns';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';

interface ProjectNotesProps {
  project: Project;
  onNotesChange?: () => void;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ project, onNotesChange }) => {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [changingTypeNoteId, setChangingTypeNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'note' as ProjectNote['type']
  });
  
  // 上传状态
  const [isUploading, setIsUploading] = useState(false);
  
  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<ProjectNote | null>(null);
  
  // 错误提示对话框状态
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success'
  });

  // 加载项目记录
  useEffect(() => {
    loadNotes();
  }, [project.id]);

  // 点击外部关闭类型选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (changingTypeNoteId !== null) {
        const target = event.target as Element;
        if (!target.closest('.type-selector')) {
          setChangingTypeNoteId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [changingTypeNoteId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const projectNotes = await getProjectNotes(project.id);
      setNotes(projectNotes);
    } catch (error) {
      console.error('加载项目记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 显示提示信息
  const showAlertMessage = useCallback((title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  }, []);

  // 处理图片粘贴上传
  const handleImagePaste = useCallback(async (
    event: React.ClipboardEvent,
    setContent: (content: string) => void,
    currentContent: string
  ) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        try {
          setIsUploading(true);
          
          const processedFile = await compressImage(file, 500);
          const result = await uploadImage(processedFile);
          const imageMarkdown = `\n![image](${result.url})\n`;
          setContent(currentContent + imageMarkdown);
        } catch (error) {
          console.error('图片上传失败:', error);
          showAlertMessage('上传失败', '图片上传失败，请重试', 'error');
        } finally {
          setIsUploading(false);
        }
        
        break;
      }
    }
  }, [showAlertMessage]);

  // 处理新建记录的粘贴事件
  const handleNewNotePaste = useCallback((event: React.ClipboardEvent) => {
    handleImagePaste(event, (content) => {
      setNewNote(prev => ({ ...prev, content }));
    }, newNote.content);
  }, [handleImagePaste, newNote.content]);

  // 处理编辑记录的粘贴事件
  const handleEditNotePaste = useCallback((event: React.ClipboardEvent) => {
    if (!editingNote) return;
    handleImagePaste(event, (content) => {
      setEditingNote(prev => prev ? { ...prev, content } : null);
    }, editingNote.content);
  }, [handleImagePaste, editingNote]);

  // 自定义图片上传命令（工具栏按钮）
  const imageUploadCommand: ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': '上传图片', title: '上传图片 (也可以直接 Ctrl+V 粘贴)' },
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    ),
    execute: (_state, api) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          setIsUploading(true);
          const processedFile = await compressImage(file, 500);
          const result = await uploadImage(processedFile);
          const imageMarkdown = `![image](${result.url})`;
          api.replaceSelection(imageMarkdown);
        } catch (error) {
          console.error('图片上传失败:', error);
          showAlertMessage('上传失败', '图片上传失败，请重试', 'error');
        } finally {
          setIsUploading(false);
        }
      };
      input.click();
    },
  };

  // 编辑器工具栏命令配置
  const editorCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.divider,
    commands.link,
    imageUploadCommand,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    commands.code,
    commands.codeBlock,
  ];

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      showAlertMessage('标题不能为空', '请输入记录标题后再保存。', 'warning');
      return;
    }
    
    if (!newNote.content.trim()) {
      showAlertMessage('内容不能为空', '请输入记录内容后再保存。', 'warning');
      return;
    }

    try {
      const createdNote = await createProjectNote(project.id, newNote);
      setNotes([createdNote, ...notes]);
      setNewNote({ title: '', content: '', type: 'note' });
      setIsCreating(false);
      onNotesChange?.();
      
      showAlertMessage('创建成功', `记录"${createdNote.title}"已成功创建。`, 'success');
    } catch (error) {
      console.error('创建项目记录失败:', error);
      showAlertMessage('创建失败', '创建记录时发生错误，请重试。', 'error');
    }
  };

  const handleUpdateNote = async (noteId: number, updates: Partial<ProjectNote>) => {
    try {
      const updatedNote = await updateProjectNote(noteId, updates);
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note));
      setEditingNote(null);
      onNotesChange?.();
    } catch (error) {
      console.error('更新项目记录失败:', error);
      showAlertMessage('更新失败', '更新记录时发生错误，请重试。', 'error');
    }
  };

  const handleDeleteNote = async (note: ProjectNote) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteProjectNote(noteToDelete.id);
      setNotes(notes.filter(note => note.id !== noteToDelete.id));
      setNoteToDelete(null);
      onNotesChange?.();
      
      showAlertMessage('删除成功', `记录"${noteToDelete.title}"已成功删除。`, 'success');
    } catch (error) {
      console.error('删除项目记录失败:', error);
      showAlertMessage('删除失败', '删除记录时发生错误，请重试。', 'error');
    }
  };

  const handleCancelDeleteNote = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  // 切换记录展开状态
  const toggleNoteExpansion = (noteId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  // 提取Markdown内容的目录
  const extractTableOfContents = (content: string): string[] => {
    if (!content.trim()) return [];
    
    const lines = content.split('\n');
    const headings: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        const headingText = trimmed.replace(/^#+\s*/, '').trim();
        if (headingText) {
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          const indent = '  '.repeat(Math.max(0, level - 1));
          headings.push(`${indent}• ${headingText}`);
        }
      }
    }
    
    return headings.slice(0, 5);
  };

  // 处理记录类型更改
  const handleTypeChange = async (noteId: number, newType: ProjectNote['type']) => {
    try {
      await handleUpdateNote(noteId, { type: newType });
      setChangingTypeNoteId(null);
    } catch (error) {
      console.error('更改记录类型失败:', error);
    }
  };

  // 获取所有可用的记录类型
  const getAvailableTypes = (): Array<{ value: ProjectNote['type']; label: string; icon: string }> => {
    return [
      { value: 'note', label: '记录', icon: '📝' },
      { value: 'summary', label: '总结', icon: '📋' },
      { value: 'meeting', label: '会议', icon: '🤝' },
      { value: 'issue', label: '问题', icon: '⚠️' },
      { value: 'milestone', label: '里程碑', icon: '🎯' },
      { value: 'reflection', label: '反思', icon: '💭' }
    ];
  };

  const renderMarkdown = (content: string) => {
    if (!content.trim()) {
      return '<p class="text-gray-500 italic">暂无内容</p>';
    }
    try {
      const html = marked(content, {
        breaks: true,
        gfm: true,
      });
      
      if (typeof html === 'string') {
        return html;
      } else {
        console.error('Marked返回了Promise，这不应该发生');
        return '<p class="text-red-500">渲染错误：异步渲染</p>';
      }
    } catch (error) {
      console.error('Markdown渲染失败:', error);
      return `<p class="text-red-500">渲染失败: ${error}</p>`;
    }
  };

  const getTypeConfig = (type: ProjectNote['type']) => {
    switch (type) {
      case 'note':
        return { icon: '📝', label: '记录', color: 'bg-blue-100 text-blue-800' };
      case 'summary':
        return { icon: '📋', label: '总结', color: 'bg-green-100 text-green-800' };
      case 'meeting':
        return { icon: '🤝', label: '会议', color: 'bg-purple-100 text-purple-800' };
      case 'issue':
        return { icon: '⚠️', label: '问题', color: 'bg-red-100 text-red-800' };
      case 'milestone':
        return { icon: '🎯', label: '里程碑', color: 'bg-yellow-100 text-yellow-800' };
      case 'reflection':
        return { icon: '💭', label: '反思', color: 'bg-indigo-100 text-indigo-800' };
      default:
        return { icon: '📝', label: '记录', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getTemplate = (type: ProjectNote['type']) => {
    switch (type) {
      case 'summary':
        return `# 项目总结

## 完成情况
- [x] 已完成的任务
- [ ] 待完成的任务

## 主要成果
- 成果1
- 成果2

## 遇到的问题
- 问题1及解决方案
- 问题2及解决方案

## 经验教训
- 经验1
- 经验2

## 下一步计划
- 计划1
- 计划2`;

      case 'meeting':
        return `# 会议记录

**时间：** ${format(new Date(), 'yyyy-MM-dd HH:mm')}
**参与人员：** 
**会议主题：** 

## 讨论要点
1. 要点1
2. 要点2

## 决定事项
- [ ] 决定1 - 负责人：XXX，截止时间：
- [ ] 决定2 - 负责人：XXX，截止时间：

## 后续行动
- [ ] 行动1
- [ ] 行动2`;

      case 'issue':
        return `# 问题记录

## 问题描述
详细描述遇到的问题...

## 影响范围
- 影响1
- 影响2

## 解决方案
### 方案1
- 步骤1
- 步骤2

### 方案2（备选）
- 步骤1
- 步骤2

## 解决状态
- [ ] 问题分析完成
- [ ] 解决方案确定
- [ ] 解决方案实施
- [ ] 问题验证解决

## 经验总结
从这个问题中学到的经验...`;

      case 'milestone':
        return `# 里程碑记录

## 里程碑名称
${newNote.title || '里程碑名称'}

## 达成时间
${format(new Date(), 'yyyy-MM-dd')}

## 主要成就
- 成就1
- 成就2
- 成就3

## 关键数据
- 数据1：XXX
- 数据2：XXX

## 团队贡献
- 成员1：贡献描述
- 成员2：贡献描述

## 下一个里程碑
目标：XXX
预计时间：XXX`;

      case 'reflection':
        return `# 项目反思

## 做得好的地方
- 优点1
- 优点2

## 需要改进的地方
- 改进点1
- 改进点2

## 学到的经验
- 经验1
- 经验2

## 对未来项目的建议
- 建议1
- 建议2

## 个人成长
在这个项目中的个人收获...`;

      default:
        return `# ${newNote.title || '项目记录'}

## 记录内容
在这里记录项目相关的内容...

## 要点
- 要点1
- 要点2

## 后续行动
- [ ] 行动1
- [ ] 行动2`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <span>📚</span>
          项目记录与总结
          {notes.length > 0 && (
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{notes.length}</span>
          )}
        </h2>
        
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          新建
        </button>
      </div>

      {/* 创建新记录表单 - 更紧凑版 */}
      {isCreating && (
        <div className="mb-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-800">
              创建新记录
              {isUploading && <span className="ml-2 text-blue-600 text-xs animate-pulse">📤 上传中...</span>}
            </h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewNote({ title: '', content: '', type: 'note' });
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
              title="关闭"
            >
              ❌
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="记录标题"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newNote.type}
                onChange={(e) => {
                  const type = e.target.value as ProjectNote['type'];
                  setNewNote({ 
                    ...newNote, 
                    type,
                    content: newNote.content || getTemplate(type)
                  });
                }}
                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="note">📝 记录</option>
                <option value="summary">📋 总结</option>
                <option value="meeting">🤝 会议</option>
                <option value="issue">⚠️ 问题</option>
                <option value="milestone">🎯 里程碑</option>
                <option value="reflection">💭 反思</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setNewNote({ ...newNote, content: getTemplate(newNote.type) })}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
              >
                📋 使用模板
              </button>
              <span className="text-xs text-gray-500">
                💡 可直接 Ctrl+V 粘贴图片
              </span>
            </div>
            
            <div 
              className="markdown-editor-container"
              onPaste={handleNewNotePaste}
            >
              <MDEditor
                value={newNote.content}
                onChange={(val) => setNewNote({ ...newNote, content: val || '' })}
                preview="edit"
                hideToolbar={false}
                height={200}
                data-color-mode="light"
                visibleDragbar={false}
                commands={editorCommands}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                disabled={isUploading}
                className="bg-green-600 text-white px-2 py-1 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <span>💾</span>
                保存
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', type: 'note' });
                }}
                className="bg-gray-500 text-white px-2 py-1 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <span>❌</span>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 记录列表 - 知乎风格单列布局 */}
      {loading ? (
        <div className="text-center py-6">
          <div className="text-gray-400 text-2xl mb-2">⏳</div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-3">📝</div>
          <h3 className="text-base font-medium text-gray-900 mb-2">还没有项目记录</h3>
          <p className="text-gray-600 text-sm mb-3">记录项目的进展、问题、总结和经验教训</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            创建第一条记录
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const typeConfig = getTypeConfig(note.type);
            const isEditing = editingNote?.id === note.id;
            const isExpanded = expandedNotes.has(note.id);
            const tableOfContents = extractTableOfContents(note.content);
            
            return (
              <div 
                key={note.id} 
                className={`border border-gray-200 rounded-lg transition-colors ${
                  isEditing ? 'border-blue-300' : 'hover:bg-gray-50'
                }`}
              >
                {/* 标题行 - 始终显示 */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => !isEditing && toggleNoteExpansion(note.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* 可点击的类型标签 */}
                    <div className="relative flex-shrink-0 type-selector">
                      {changingTypeNoteId === note.id ? (
                        <div className="absolute top-0 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-32">
                          <div className="space-y-1">
                            {getAvailableTypes().map((type) => (
                              <button
                                key={type.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTypeChange(note.id, type.value);
                                }}
                                className={`w-full text-left px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors flex items-center gap-1 ${
                                  note.type === type.value ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                                }`}
                              >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setChangingTypeNoteId(null);
                              }}
                              className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChangingTypeNoteId(note.id);
                          }}
                          className={`text-xs px-1.5 py-0.5 rounded-full ${typeConfig.color} flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer`}
                          title="点击更改记录类型"
                        >
                          <span className="text-xs">{typeConfig.icon}</span>
                          <span className="text-xs">{typeConfig.label}</span>
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="text-sm font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-sm font-medium text-gray-900 truncate flex-1">{note.title}</h3>
                    )}
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), 'MM-dd')}
                      </span>
                      {!isEditing && (
                        <span className="text-xs text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateNote(note.id, editingNote);
                          }}
                          className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded hover:bg-green-200 transition-colors"
                          title="保存更改"
                        >
                          💾
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(null);
                          }}
                          className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
                          title="取消编辑"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(note);
                            setExpandedNotes(new Set([...expandedNotes, note.id]));
                          }}
                          className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors"
                          title="编辑记录"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note);
                          }}
                          className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded hover:bg-red-200 transition-colors"
                          title="删除记录"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 目录预览 - 收起状态下显示 */}
                {!isExpanded && !isEditing && tableOfContents.length > 0 && (
                  <div className="px-3 pb-3">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-medium text-gray-700 mb-1">目录：</div>
                      {tableOfContents.map((heading, index) => (
                        <div key={index} className="text-gray-600">{heading}</div>
                      ))}
                      {extractTableOfContents(note.content).length > 5 && (
                        <div className="text-gray-400 italic">...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 展开内容 - 展开状态下显示 */}
                {(isExpanded || isEditing) && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    {isEditing ? (
                      <div className="mt-3">
                        {isUploading && (
                          <div className="mb-2 text-xs text-blue-600 animate-pulse">📤 图片上传中...</div>
                        )}
                        <div 
                          className="markdown-editor-container"
                          onPaste={handleEditNotePaste}
                        >
                          <MDEditor
                            value={editingNote.content}
                            onChange={(val) => setEditingNote({ ...editingNote, content: val || '' })}
                            preview="edit"
                            hideToolbar={false}
                            height={300}
                            data-color-mode="light"
                            visibleDragbar={false}
                            commands={editorCommands}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div 
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* 删除记录确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDeleteNote}
        onConfirm={handleConfirmDeleteNote}
        title="删除项目记录"
        message={noteToDelete ? 
          `确定要删除记录"${noteToDelete.title}"吗？

记录类型：${getTypeConfig(noteToDelete.type).label}
创建时间：${format(new Date(noteToDelete.createdAt), 'yyyy-MM-dd HH:mm')}

此操作无法撤销，记录内容将永久丢失。` : 
          ''
        }
        confirmText="🗑️ 删除记录"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
      
      {/* 提示对话框 */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default ProjectNotes;

// 添加自定义样式来优化MDEditor显示
const styles = `
  .markdown-editor-container .w-md-editor {
    background-color: transparent;
  }
  
  .markdown-editor-container .w-md-editor-text-pre,
  .markdown-editor-container .w-md-editor-text-input,
  .markdown-editor-container .w-md-editor-text {
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
  
  .markdown-editor-container .w-md-editor-toolbar {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px;
  }
  
  .markdown-editor-container .w-md-editor-toolbar ul li button {
    padding: 4px 6px;
    margin: 0 2px;
  }
  
  .markdown-editor-container .w-md-editor-preview {
    padding: 12px;
  }
  
  .markdown-editor-container .w-md-editor.w-md-editor-focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style[data-md-editor-custom]')) {
    styleElement.setAttribute('data-md-editor-custom', 'true');
    document.head.appendChild(styleElement);
  }
}