import React, { useRef, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  id?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '输入描述...',
  minHeight = '80px',
  className = '',
  id
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // 初始化和同步外部值
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  // 处理内容变化
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // 执行格式化命令
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // 工具栏按钮
  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }> = ({ onClick, title, children, active }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded hover:bg-amber-200 transition-colors ${
        active ? 'bg-amber-200' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`sticky-note-editor ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center gap-0.5 p-1.5 bg-amber-100 border border-amber-300 rounded-t-md">
        <ToolbarButton onClick={() => execCommand('bold')} title="粗体 (Ctrl+B)">
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="斜体 (Ctrl+I)">
          <span className="italic text-sm">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="下划线 (Ctrl+U)">
          <span className="underline text-sm">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('strikeThrough')} title="删除线">
          <span className="line-through text-sm">S</span>
        </ToolbarButton>
        
        <div className="w-px h-4 bg-amber-400 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="无序列表">
          <span className="text-sm">•</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="有序列表">
          <span className="text-sm">1.</span>
        </ToolbarButton>
        
        <div className="w-px h-4 bg-amber-400 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('removeFormat')} title="清除格式">
          <span className="text-sm">✕</span>
        </ToolbarButton>
      </div>
      
      {/* 编辑区域 */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="w-full px-3 py-2 border border-t-0 border-amber-300 rounded-b-md 
                   bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 
                   focus:border-amber-400 overflow-auto cursor-text
                   [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400
                   prose prose-sm max-w-none
                   [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
        style={{ 
          minHeight,
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
