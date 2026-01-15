import React, { useRef, useEffect, useCallback, useState } from 'react';
import { compressImage, uploadImage } from '../services/uploadService';

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
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const insertImageAtCursor = useCallback((imageUrl: string) => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) {
      if (editorRef.current) {
        editorRef.current.innerHTML += `<img src="${imageUrl}" alt="image" />`;
        handleInput();
      }
      return;
    }

    range.deleteContents();
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'image';
    range.insertNode(img);

    const spacer = document.createTextNode('');
    img.after(spacer);

    const newRange = document.createRange();
    newRange.setStartAfter(img);
    newRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(newRange);
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (!file) return;

        try {
          setIsUploading(true);
          const processedFile = await compressImage(file, 500);
          const result = await uploadImage(processedFile);
          insertImageAtCursor(result.url);
        } catch (error) {
          console.error('图片上传失败:', error);
        } finally {
          setIsUploading(false);
        }
        return;
      }
    }
  }, [insertImageAtCursor]);

  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.tagName === 'IMG') {
      const src = (target as HTMLImageElement).src;
      if (src) {
        setPreviewImage(src);
      }
    }
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const inserted = document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      if (!inserted) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        if (range) {
          const tabNode = document.createTextNode('\u00A0\u00A0\u00A0\u00A0');
          range.insertNode(tabNode);
          const newRange = document.createRange();
          newRange.setStartAfter(tabNode);
          newRange.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        }
      }
      handleInput();
      return;
    }

    if (event.key !== 'Backspace') return;

    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;

    if (container.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
      const previous = container.previousSibling;
      if (previous && (previous as HTMLElement).tagName === 'IMG') {
        event.preventDefault();
        previous.remove();
        handleInput();
      }
      return;
    }

    if (container.nodeType === Node.ELEMENT_NODE && range.startOffset > 0) {
      const element = container as HTMLElement;
      const previous = element.childNodes[range.startOffset - 1];
      if (previous && (previous as HTMLElement).tagName === 'IMG') {
        event.preventDefault();
        previous.remove();
        handleInput();
      }
    }
  }, [handleInput]);

  // 执行格式化命令 - 使用 mousedown 事件避免失去选区
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  // 阻止编辑区域内的拖拽事件，防止选中文字时触发拖拽
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  // 阻止拖拽相关事件冒泡
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 工具栏按钮 - 使用 onMouseDown 而不是 onClick，防止失去选区
  const ToolbarButton: React.FC<{
    onMouseDown: (e: React.MouseEvent) => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }> = ({ onMouseDown, title, children, active }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMouseDown(e);
      }}
      title={title}
      className={`p-0.5 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-600 cursor-pointer ${
        active ? 'bg-gray-200' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* 紧凑工具栏 */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 border border-gray-300 rounded-t-md bg-white">
        <ToolbarButton onMouseDown={() => execCommand('bold')} title="粗体 (Ctrl+B)">
          <span className="font-bold text-xs">B</span>
        </ToolbarButton>
        <ToolbarButton onMouseDown={() => execCommand('italic')} title="斜体 (Ctrl+I)">
          <span className="italic text-xs">I</span>
        </ToolbarButton>
        <ToolbarButton onMouseDown={() => execCommand('underline')} title="下划线 (Ctrl+U)">
          <span className="underline text-xs">U</span>
        </ToolbarButton>
        <ToolbarButton onMouseDown={() => execCommand('strikeThrough')} title="删除线">
          <span className="line-through text-xs">S</span>
        </ToolbarButton>
        
        <div className="w-px h-3 bg-gray-300 mx-0.5" />
        
        <ToolbarButton onMouseDown={() => execCommand('insertUnorderedList')} title="无序列表">
          <span className="text-xs">•</span>
        </ToolbarButton>
        <ToolbarButton onMouseDown={() => execCommand('insertOrderedList')} title="有序列表">
          <span className="text-xs">1.</span>
        </ToolbarButton>
        
        <div className="w-px h-3 bg-gray-300 mx-0.5" />
        
        <ToolbarButton onMouseDown={() => execCommand('removeFormat')} title="清除格式">
          <span className="text-xs">✕</span>
        </ToolbarButton>
        <div className="ml-auto text-[10px] text-gray-500">
          {isUploading ? '图片上传中...' : '支持 Ctrl+V 粘贴图片'}
        </div>
      </div>
      
      {/* 编辑区域 - 移除 draggable 属性，改用事件阻止 */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragOver={handleDrag}
        onPaste={handlePaste}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="w-full px-2 py-1.5 border border-t-0 border-gray-300 rounded-b-md 
                   bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 
                   focus:border-blue-500 overflow-auto
                   [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400
                   prose prose-sm max-w-none text-sm
                   [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4
                   [&_img]:max-w-[40%] [&_img]:h-auto [&_img]:cursor-zoom-in"
        style={{ 
          minHeight,
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
          lineHeight: '1.5',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          cursor: 'text'
        }}
      />
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="预览"
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;