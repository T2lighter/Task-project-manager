import React from 'react';

// 简单的拖拽测试组件
const DragTest: React.FC = () => {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [dropZoneContent, setDropZoneContent] = React.useState<string>('拖拽区域');

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
    console.log('拖拽开始:', item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    console.log('拖拽结束');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    setDropZoneContent(`已放置: ${item}`);
    console.log('拖拽放置:', item);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">拖拽功能测试</h3>
      
      {/* 可拖拽项目 */}
      <div className="space-y-2">
        <h4 className="font-medium">可拖拽项目:</h4>
        {['项目1', '项目2', '项目3'].map(item => (
          <div
            key={item}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            className={`p-3 border rounded cursor-move transition-all ${
              draggedItem === item 
                ? 'opacity-50 transform rotate-2 scale-105 border-blue-400 bg-blue-50' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            {item} {draggedItem === item && '(拖拽中...)'}
          </div>
        ))}
      </div>

      {/* 放置区域 */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {dropZoneContent}
      </div>

      {/* 状态显示 */}
      <div className="text-sm text-gray-600">
        当前拖拽项目: {draggedItem || '无'}
      </div>
    </div>
  );
};

export default DragTest;