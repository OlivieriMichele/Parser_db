import React, { useState, useEffect } from 'react';
import DiagramCanvas from '../diagram/DiagramCanvas';
import DiagramControls from '../diagram/DiagramControls';
import { NodeDetails } from '../diagram/NodeDetails';
import { useDraggableNodes } from '../../hooks/useDraggableNodes';
import { calculateSmartLayout } from '../../utils/layoutCalculator';

export const DiagramTab = ({ parsedData }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [initialPositions, setInitialPositions] = useState(new Map());

  const allNodes = [...parsedData.classes, ...parsedData.interfaces];

  // Calcola layout iniziale quando cambiano i dati
  useEffect(() => {
    const positions = calculateSmartLayout(allNodes, parsedData.relations);
    setInitialPositions(positions);
  }, [parsedData]);

  const {
    positions,
    dragging,
    startDrag,
    onDrag,
    endDrag,
    resetPositions,
    hasCustomPositions
  } = useDraggableNodes(initialPositions);

  const handleNodeClick = (nodeName) => {
    if (!dragging) {
      setSelectedNode(selectedNode === nodeName ? null : nodeName);
    }
  };

  const handleNodeDoubleClick = (nodeName, event) => {
    event.stopPropagation();
    startDrag(nodeName, event);
  };

  const handleReset = () => {
    setZoom(1);
  };

  const getSelectedNodeData = () => {
    if (!selectedNode) return null;
    return allNodes.find(n => n.name === selectedNode);
  };

  const getNodeRelations = () => {
    if (!selectedNode) return [];
    return parsedData.relations.filter(
      rel => rel.from === selectedNode || rel.to === selectedNode
    );
  };

  return (
    <div className="relative">
      <DiagramControls
        zoom={zoom}
        setZoom={setZoom}
        onReset={handleReset}
        onResetPositions={resetPositions}
        hasCustomPositions={hasCustomPositions}
      />

      <DiagramCanvas
        nodes={allNodes}
        relations={parsedData.relations}
        positions={positions}
        zoom={zoom}
        selectedNode={selectedNode}
        dragging={dragging}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
      />

      <NodeDetails
        node={getSelectedNodeData()}
        relations={getNodeRelations()}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};