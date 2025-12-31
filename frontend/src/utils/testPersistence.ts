// 测试持久化功能的辅助函数
export const testLabelPersistence = () => {
  console.log('=== 测试标签持久化 ===');
  
  // 测试标签存储
  const testLabels = [
    { id: 1, name: '测试标签1', color: '#FF0000' },
    { id: 2, name: '测试标签2', color: '#00FF00' }
  ];
  
  localStorage.setItem('personalized_labels', JSON.stringify(testLabels));
  const retrieved = JSON.parse(localStorage.getItem('personalized_labels') || '[]');
  
  console.log('存储的标签:', testLabels);
  console.log('读取的标签:', retrieved);
  console.log('标签持久化测试:', JSON.stringify(testLabels) === JSON.stringify(retrieved) ? '✅ 成功' : '❌ 失败');
  
  // 测试任务标签映射存储
  const testMapping = {
    1: [1, 2], // 任务1有标签1和2
    2: [1],    // 任务2有标签1
  };
  
  localStorage.setItem('task_labels_mapping', JSON.stringify(testMapping));
  const retrievedMapping = JSON.parse(localStorage.getItem('task_labels_mapping') || '{}');
  
  console.log('存储的映射:', testMapping);
  console.log('读取的映射:', retrievedMapping);
  console.log('映射持久化测试:', JSON.stringify(testMapping) === JSON.stringify(retrievedMapping) ? '✅ 成功' : '❌ 失败');
  
  console.log('=== 测试完成 ===');
};

// 清理测试数据
export const cleanupTestData = () => {
  localStorage.removeItem('personalized_labels');
  localStorage.removeItem('task_labels_mapping');
  console.log('测试数据已清理');
};

// 测试视图切换时的数据同步
export const testViewSwitchSync = () => {
  console.log('=== 测试视图切换同步 ===');
  
  // 模拟一些任务标签映射数据
  const mockMapping = {
    1: [1], // 任务1分配给标签1
    2: [2], // 任务2分配给标签2
    3: [1, 3], // 任务3分配给标签1和3
  };
  
  const mockLabels = [
    { id: 1, name: '对内标签', color: '#3B82F6', description: '内部工作相关任务', userId: 1 },
    { id: 2, name: '对外标签', color: '#EF4444', description: '外部合作相关任务', userId: 1 },
    { id: 3, name: '交叉标签', color: '#10B981', description: '跨部门协作任务', userId: 1 }
  ];
  
  // 保存到localStorage
  localStorage.setItem('task_labels_mapping', JSON.stringify(mockMapping));
  localStorage.setItem('personalized_labels', JSON.stringify(mockLabels));
  
  console.log('已设置测试数据:');
  console.log('- 任务标签映射:', mockMapping);
  console.log('- 标签数据:', mockLabels);
  console.log('现在切换到个性化展示应该能看到正确的任务分组');
  
  return { mockMapping, mockLabels };
};

// 测试拖拽取消标签功能
export const testDragToRemoveLabel = () => {
  console.log('=== 测试拖拽取消标签功能 ===');
  
  // 设置一个有标签的任务
  const mockMapping = {
    1: [1], // 任务1分配给标签1
    2: [2], // 任务2分配给标签2
  };
  
  const mockLabels = [
    { id: 1, name: '对内标签', color: '#3B82F6', description: '内部工作相关任务', userId: 1 },
    { id: 2, name: '对外标签', color: '#EF4444', description: '外部合作相关任务', userId: 1 }
  ];
  
  localStorage.setItem('task_labels_mapping', JSON.stringify(mockMapping));
  localStorage.setItem('personalized_labels', JSON.stringify(mockLabels));
  
  console.log('测试步骤:');
  console.log('1. 切换到个性化展示');
  console.log('2. 从标签区域拖拽任务到左侧任务列表');
  console.log('3. 任务应该从标签中移除，回到未分类状态');
  console.log('4. 检查localStorage中的task_labels_mapping是否已更新');
  
  return { mockMapping, mockLabels };
};

// 测试多标签功能
export const testMultiLabelFeature = () => {
  console.log('=== 测试多标签功能 ===');
  
  // 设置一个任务有多个标签
  const mockMapping = {
    1: [1, 2, 3], // 任务1同时属于三个标签
    2: [1, 3],    // 任务2属于标签1和3
    3: [2],       // 任务3只属于标签2
  };
  
  const mockLabels = [
    { id: 1, name: '对内标签', color: '#3B82F6', description: '内部工作相关任务', userId: 1 },
    { id: 2, name: '对外标签', color: '#EF4444', description: '外部合作相关任务', userId: 1 },
    { id: 3, name: '交叉标签', color: '#10B981', description: '跨部门协作任务', userId: 1 }
  ];
  
  localStorage.setItem('task_labels_mapping', JSON.stringify(mockMapping));
  localStorage.setItem('personalized_labels', JSON.stringify(mockLabels));
  
  console.log('已设置多标签测试数据:');
  console.log('- 任务1同时出现在三个标签中');
  console.log('- 任务2出现在标签1和3中');
  console.log('- 任务3只出现在标签2中');
  console.log('');
  console.log('测试步骤:');
  console.log('1. 切换到个性化展示，应该看到任务在多个标签中重复出现');
  console.log('2. 从某个标签拖拽任务1到任务列表，只应该从该标签移除');
  console.log('3. 任务1应该仍然出现在其他标签中');
  console.log('4. 从任务列表拖拽任务到标签，应该添加新的标签关联');
  
  return { mockMapping, mockLabels };
};