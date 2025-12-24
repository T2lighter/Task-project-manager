import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  onClick?: () => void;
  suffix?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    valueText: 'text-blue-900',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    valueText: 'text-green-900',
    border: 'border-green-200',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    valueText: 'text-yellow-900',
    border: 'border-yellow-200',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    valueText: 'text-red-900',
    border: 'border-red-200',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    valueText: 'text-purple-900',
    border: 'border-purple-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    valueText: 'text-indigo-900',
    border: 'border-indigo-200',
  },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  onClick,
  suffix = '',
}) => {
  const classes = colorClasses[color];

  return (
    <div
      className={`${classes.bg} ${classes.border} border p-4 rounded-lg ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${classes.text}`}>{title}</p>
        {icon && <div className={classes.text}>{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold ${classes.valueText}`}>
            {value}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;