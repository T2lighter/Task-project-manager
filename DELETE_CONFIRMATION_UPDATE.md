# 删除任务确认功能更新

## 更新内容

将删除任务的确认方式从浏览器原生的 `window.confirm` 全局弹窗改为自定义的确认对话框组件，覆盖所有删除任务的场景。

## 新增组件

### ConfirmDialog 组件
- **位置**: `frontend/src/components/ConfirmDialog.tsx`
- **功能**: 提供自定义的确认对话框
- **特性**:
  - 使用与应用一致的设计风格
  - 支持自定义标题、消息和按钮文本
  - 支持自定义按钮样式
  - 基于现有的 Modal 组件构建
  - 支持键盘操作（ESC键关闭）

### 组件属性
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;           // 控制对话框显示/隐藏
  onClose: () => void;       // 关闭对话框的回调
  onConfirm: () => void;     // 确认操作的回调
  title: string;             // 对话框标题
  message: string;           // 确认消息
  confirmText?: string;      // 确认按钮文本（默认："确认"）
  cancelText?: string;       // 取消按钮文本（默认："取消"）
  confirmButtonClass?: string; // 确认按钮样式类
}
```

## 修改的组件

### TaskForm 组件
- **修改内容**:
  - 导入 `ConfirmDialog` 组件
  - 添加 `showDeleteConfirm` 状态管理删除确认对话框的显示
  - 将删除按钮的点击事件从直接调用 `window.confirm` 改为显示自定义确认对话框
  - 添加删除确认和取消的处理函数

### TasksPage 组件
- **修改内容**:
  - 导入 `ConfirmDialog` 组件
  - 添加多个状态管理不同的删除确认场景
  - 修改所有删除相关的函数接口，统一使用Task对象而不是taskId
  - 添加单个任务删除确认对话框
  - 添加批量清理测试任务确认对话框
  - 将原有的 `window.confirm` 替换为自定义确认对话框

### TaskCard 组件
- **接口修改**: `onDelete: (task: Task) => void` - 改为传递完整的Task对象

### Quadrant 组件
- **接口修改**: `onDeleteTask: (task: Task) => void` - 改为传递完整的Task对象

### KanbanBoard 组件
- **接口修改**: `onDeleteTask: (task: Task) => void` - 改为传递完整的Task对象

## 删除确认场景

### 1. 任务表单中的删除（TaskForm）
- **触发**: 编辑任务时点击"删除任务"按钮
- **确认消息**: `确定要删除任务"[任务标题]"吗？此操作无法撤销。`
- **应用页面**: 任务管理页面、日程管理页面

### 2. 任务列表中的删除（TaskCard）
- **触发**: 在任务卡片上点击删除按钮（🗑️）
- **确认消息**: `确定要删除任务"[任务标题]"吗？此操作无法撤销。`
- **应用场景**: 任务列表、四象限视图、看板视图

### 3. 批量清理测试任务
- **触发**: 点击"清理测试任务"按钮
- **确认消息**: `确定要删除 [数量] 个测试任务吗？此操作无法撤销。`
- **应用页面**: 任务管理页面

## 用户体验改进

### 之前
- 使用浏览器原生的 `window.confirm` 确认对话框
- 样式与应用不一致
- 功能有限，无法自定义
- 只在TaskForm中有确认，其他删除操作没有确认

### 现在
- 与应用设计风格一致的确认对话框
- 显示具体的任务标题
- 更清晰的确认消息
- 支持键盘操作
- 更好的视觉反馈
- **所有删除操作都有确认对话框**

## 影响范围

### 自动应用的功能
- **任务管理页面**: 
  - 编辑任务时的删除功能
  - 任务列表中的删除功能
  - 四象限视图中的删除功能
  - 看板视图中的删除功能
  - 批量清理测试任务功能
- **日程管理页面**: 编辑任务时的删除功能

### 技术实现
- 使用 React hooks (`useState`, `useCallback`) 管理状态
- 基于现有的 Modal 组件，保持设计一致性
- 支持小尺寸模态框 (`size="sm"`)
- 统一了组件接口，所有删除回调都传递Task对象
- 完全向后兼容，不影响现有功能

## 使用示例

### 在 TaskForm 中的使用
```typescript
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={handleDeleteCancel}
  onConfirm={handleDeleteConfirm}
  title="删除任务"
  message={`确定要删除任务"${formData.title}"吗？此操作无法撤销。`}
  confirmText="删除"
  cancelText="取消"
  confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
/>
```

### 在 TasksPage 中的使用
```typescript
// 单个任务删除确认
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={handleCancelDeleteTask}
  onConfirm={handleConfirmDeleteTask}
  title="删除任务"
  message={taskToDelete ? `确定要删除任务"${taskToDelete.title}"吗？此操作无法撤销。` : ''}
  confirmText="删除"
  cancelText="取消"
  confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
/>

// 批量清理确认
<ConfirmDialog
  isOpen={showCleanupConfirm}
  onClose={handleCancelCleanupTasks}
  onConfirm={handleConfirmCleanupTasks}
  title="清理测试任务"
  message={`确定要删除 ${testTasksToDelete.length} 个测试任务吗？此操作无法撤销。`}
  confirmText="删除全部"
  cancelText="取消"
  confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
/>
```

## 总结

这次更新全面提升了删除任务的用户体验，确保所有删除操作都有一致的确认流程。用户现在在删除任何任务时都会看到与应用风格一致的确认对话框，提供了更好的用户体验和更安全的操作确认。所有现有功能保持不变，用户可以无缝使用新的确认对话框系统。