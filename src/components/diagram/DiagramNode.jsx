import React from 'react';

export const DiagramNode = ({ 
  node, 
  position, 
  isInterface, 
  isSelected, 
  isDragging,
  onClick, 
  onDoubleClick 
}) => {
  const { x, y } = position;

  return (
    <g 
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="cursor-pointer"
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
    >
      <rect
        width="250"
        height="100"
        fill={isSelected ? '#fef3c7' : (isInterface ? '#f0fdf4' : '#fff')}
        stroke={isSelected ? '#f59e0b' : (isInterface ? '#22c55e' : '#6366f1')}
        strokeWidth={isSelected ? '3' : '2'}
        rx="8"
        className="transition-all"
      />
      
      <rect
        width="250"
        height="30"
        fill={isInterface ? '#dcfce7' : '#e0e7ff'}
        rx="8"
      />
      <rect
        y="30"
        width="250"
        height="70"
        fill="transparent"
      />

      <text
        x="125"
        y="20"
        textAnchor="middle"
        className="font-bold"
        fontSize="14"
        fill="#1f2937"
      >
        {isInterface ? '<<interface>>' : ''}
      </text>
      <text
        x="125"
        y={isInterface ? "40" : "20"}
        textAnchor="middle"
        className="font-bold"
        fontSize="16"
        fill="#1f2937"
      >
        {node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name}
      </text>

      {node.package && (
        <text
          x="125"
          y={isInterface ? "55" : "38"}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {node.package}
        </text>
      )}

      <text
        x="125"
        y="75"
        textAnchor="middle"
        fontSize="12"
        fill="#6b7280"
      >
        {node.attributes.length} attributi
      </text>
    </g>
  );
};