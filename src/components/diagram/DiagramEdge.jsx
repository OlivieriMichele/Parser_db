import { 
  getRelationStrokeColor, 
  getRelationMarker, 
  getRelationDashArray 
} from '../../utils/plantUMLParser';

export const DiagramEdge = ({ relation, fromPos, toPos }) => {
  if (!fromPos || !toPos) return null;

  const fromX = fromPos.x + 125; // Center of node
  const fromY = fromPos.y + 50;
  const toX = toPos.x + 125;
  const toY = toPos.y + 50;

  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      stroke={getRelationStrokeColor(relation.type)}
      strokeWidth="2"
      strokeDasharray={getRelationDashArray(relation.type)}
      markerEnd={getRelationMarker(relation.type)}
      opacity="0.6"
    />
  );
};