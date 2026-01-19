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

  // Combina classi e interfacce
  const allNodes = React.useMemo(() => {
    const combined = [...parsedData.classes, ...parsedData.interfaces];
    console.log('DiagramTab - Total nodes:', combined.length);
    console.log('DiagramTab - Classes:', parsedData.classes.length);
    console.log('DiagramTab - Interfaces:', parsedData.interfaces.length);
    return combined;
  }, [parsedData]);

  // Calcola layout iniziale quando cambiano i dati
  useEffect(() => {
    if (allNodes.length === 0) {
      console.warn('No nodes to layout');
      return;
    }

    console.log('Calculating layout for', allNodes.length, 'nodes');
    const positions = calculateSmartLayout(allNodes, parsedData.relations);
    console.log('Layout calculated, positions:', positions.size);
    setInitialPositions(positions);
  }, [allNodes, parsedData.relations]);

  const {
    positions,
    dragging,
    startDrag,
    onDrag,
    endDrag,
    resetPositions,
    updateBasePositions,
    hasCustomPositions
  } = useDraggableNodes(initialPositions);

  // Aggiorna posizioni quando cambiano quelle iniziali
  useEffect(() => {
    if (initialPositions.size > 0) {
      updateBasePositions(initialPositions);
    }
  }, [initialPositions, updateBasePositions]);

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

  // Debug: mostra stato
  console.log('DiagramTab render - positions:', positions.size, 'nodes:', allNodes.length);

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