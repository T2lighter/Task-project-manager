import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Project, ProjectNote } from '../types';
import { 
  createProjectNote, 
  getProjectNotes, 
  updateProjectNote, 
  deleteProjectNote 
} from '../services/projectNoteService';
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
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'note' as ProjectNote['type']
  });
  
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
  const showAlertMessage = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  const handleCreateNote = async () => {
    // 验证输入
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
      
      // 显示成功提示
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
      
      // 显示成功提示
      showAlertMessage('更新成功', `记录"${updatedNote.title}"已成功更新。`, 'success');
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
      
      // 显示成功提示
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

  const renderMarkdown = (content: string) => {
    if (!content.trim()) {
      return '<p class="text-gray-500 italic">暂无内容</p>';
    }
    try {
      // 使用同步API
      const html = marked(content, {
        breaks: true,
        gfm: true,
      });
      
      // 处理可能的Promise返回值
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span>📚</span>
          项目记录与总结
          {notes.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({notes.length}条记录)</span>
          )}
        </h2>
        
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          新建记录
        </button>
      </div>

      {/* 创建新记录表单 */}
      {isCreating && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">创建新记录</h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewNote({ title: '', content: '', type: 'note' });
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
              title="关闭"
            >
              <span>❌</span>
              <span className="text-sm">关闭</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="记录标题"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="note">📝 记录</option>
                <option value="summary">📋 总结</option>
                <option value="meeting">🤝 会议</option>
                <option value="issue">⚠️ 问题</option>
                <option value="milestone">🎯 里程碑</option>
                <option value="reflection">💭 反思</option>
              </select>
            </div>
            
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setNewNote({ ...newNote, content: getTemplate(newNote.type) })}
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition-colors"
              >
                📋 使用模板
              </button>
            </div>
            
            {/* 左右分屏编辑器 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* 左侧：编辑区域 */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📝</span>
                  编辑区域 - 支持Markdown语法
                </div>
                <textarea
                  placeholder="记录内容（支持Markdown语法）"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full h-96 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                />
              </div>
              
              {/* 右侧：预览区域 */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>👁️</span>
                  实时预览
                </div>
                <div className="border border-gray-200 rounded-lg p-3 h-96 bg-gray-50 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(newNote.content) }}
                  />
                </div>
              </div>
            </div>
            
            {/* Markdown语法提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800 font-medium mb-2">💡 Markdown语法提示：</div>
              <div className="text-xs text-blue-700 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div><code># 标题</code> - 一级标题</div>
                <div><code>## 标题</code> - 二级标题</div>
                <div><code>**粗体**</code> - 粗体文字</div>
                <div><code>*斜体*</code> - 斜体文字</div>
                <div><code>- 列表</code> - 无序列表</div>
                <div><code>1. 列表</code> - 有序列表</div>
                <div><code>- [ ] 任务</code> - 待办事项</div>
                <div><code>- [x] 任务</code> - 已完成任务</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>💾</span>
                保存记录
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', type: 'note' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span>❌</span>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 记录列表 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">⏳</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有项目记录</h3>
          <p className="text-gray-600 mb-4">记录项目的进展、问题、总结和经验教训</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建第一条记录
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const typeConfig = getTypeConfig(note.type);
            const isEditing = editingNote?.id === note.id;
            
            return (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeConfig.color} flex items-center gap-1`}>
                        <span>{typeConfig.icon}</span>
                        <span>{typeConfig.label}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                      {note.updatedAt !== note.createdAt && (
                        <span className="text-xs text-gray-400">
                          (已编辑)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdateNote(note.id, editingNote)}
                          className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                          title="保存更改"
                        >
                          <span>💾</span>
                          <span>保存</span>
                        </button>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                          title="取消编辑"
                        >
                          <span>❌</span>
                          <span>取消</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingNote(note)}
                          className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                          title="编辑记录"
                        >
                          <span>✏️</span>
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note)}
                          className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                          title="删除记录"
                        >
                          <span>🗑️</span>
                          <span>删除</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  {isEditing ? (
                    /* 左右分屏编辑器 */
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* 左侧：编辑区域 */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>📝</span>
                          编辑区域
                        </div>
                        <textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                        />
                      </div>
                      
                      {/* 右侧：预览区域 */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>👁️</span>
                          实时预览
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 h-64 bg-gray-50 overflow-y-auto">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(editingNote.content) }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                    />
                  )}
                </div>
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
          `确定要删除记录"${noteToDelete.title}"吗？\n\n记录类型：${getTypeConfig(noteToDelete.type).label}\n创建时间：${format(new Date(noteToDelete.createdAt), 'yyyy-MM-dd HH:mm')}\n\n此操作无法撤销，记录内容将永久丢失。` : 
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