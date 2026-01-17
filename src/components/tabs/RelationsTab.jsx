import { getRelationSymbol, getRelationColor } from '../../utils/plantUMLParser';

export const RelationsTab = ({ relations }) => {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Legenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">◁───</span>
            <span>Ereditarietà</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">◁···</span>
            <span>Implementazione</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">◆───</span>
            <span>Composizione</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-600">◇───</span>
            <span>Aggregazione</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">───</span>
            <span>Associazione</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {relations.map((rel, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="font-mono text-sm font-semibold text-gray-800 min-w-32">
              {rel.from}
            </span>
            <span className={`font-mono ${getRelationColor(rel.type)}`}>
              {getRelationSymbol(rel.type)}
            </span>
            <span className="font-mono text-sm font-semibold text-gray-800 min-w-32">
              {rel.to}
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {rel.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};