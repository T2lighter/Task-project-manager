import React from 'react';
import Modal from './Modal';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = '确定'
}) => {
  const getTypeConfig = (alertType: string) => {
    switch (alertType) {
      case 'error':
        return {
          icon: '❌',
          titleColor: 'text-red-800',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: '⚠️',
          titleColor: 'text-yellow-800',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-100'
        };
      case 'success':
        return {
          icon: '✅',
          titleColor: 'text-green-800',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          icon: 'ℹ️',
          titleColor: 'text-blue-800',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
    >
      <div className="space-y-4">
        {/* 图标和标题 */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center text-lg`}>
            {config.icon}
          </div>
          <h3 className={`text-lg font-semibold ${config.titleColor}`}>
            {title}
          </h3>
        </div>
        
        {/* 消息内容 */}
        <div className="text-gray-700 whitespace-pre-line ml-12">
          {message}
        </div>
        
        {/* 确定按钮 */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition-colors ${config.buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;