import React, { useEffect } from 'react';
import { DiagramNode } from './DiagramNode';
import { DiagramEdge } from './DiagramEdge';

const DiagramCanvas = ({ 
  nodes, 
  relations, 
  positions,
  zoom,
  selectedNode,
  dragging,
  onNodeClick,
  onNodeDoubleClick,
  onMouseMove,
  onMouseUp
}) => {
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, onMouseMove, onMouseUp]);

  // Debug: log positions
  useEffect(() => {
    console.log('DiagramCanvas - Nodes:', nodes.length);
    console.log('DiagramCanvas - Positions:', positions.size);
    console.log('DiagramCanvas - Relations:', relations.length);
  }, [nodes, positions, relations]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white p-8 text-center" style={{ height: '800px' }}>
        <p className="text-gray-500">Nessun nodo da visualizzare</p>
      </div>
    );
  }

  if (!positions || positions.size === 0) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white p-8 text-center" style={{ height: '800px' }}>
        <p className="text-gray-500">Calcolo posizioni in corso...</p>
      </div>
    );
  }

  return (
    <div 
      className="border border-gray-300 rounded-lg overflow-auto bg-white" 
      style={{ height: '800px' }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 2400 2000"
        className={dragging ? 'cursor-grabbing' : 'cursor-default'}
      >
        <defs>
          <marker 
            id="arrow-inheritance" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          <marker 
            id="arrow-implementation" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#9333ea" />
          </marker>
          <marker 
            id="arrow-composition" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L5,3 L0,6 z" fill="#dc2626" />
          </marker>
          <marker 
            id="arrow-aggregation" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L5,3 L0,6 z" fill="none" stroke="#ea580c" strokeWidth="1" />
          </marker>
          <marker 
            id="arrow-association" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
          </marker>
          <marker 
            id="arrow-dependency" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
          </marker>
          <marker 
            id="arrow-nested" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <circle cx="5" cy="3" r="3" fill="#ec4899" />
          </marker>
        </defs>

        <g transform={`scale(${zoom})`}>
          {/* Render edges first (background) */}
          {relations.map((rel, idx) => {
            const fromPos = positions.get(rel.from);
            const toPos = positions.get(rel.to);
            
            if (!fromPos || !toPos) {
              console.warn(`Missing position for relation: ${rel.from} -> ${rel.to}`);
              return null;
            }
            
            return (
              <DiagramEdge 
                key={`edge-${idx}`} 
                relation={rel} 
                fromPos={fromPos} 
                toPos={toPos} 
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map(node => {
            const position = positions.get(node.name);
            if (!position) {
              console.warn(`Missing position for node: ${node.name}`);
              return null;
            }

            const isInterface = node.attributes && 
              nodes.some(n => n.name === node.name && !n.methods);
            const isSelected = selectedNode === node.name;
            const isDragging = dragging === node.name;

            return (
              <DiagramNode
                key={node.name}
                node={node}
                position={position}
                isInterface={isInterface}
                isSelected={isSelected}
                isDragging={isDragging}
                onClick={() => onNodeClick(node.name)}
                onDoubleClick={(e) => onNodeDoubleClick(node.name, e)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default DiagramCanvas;