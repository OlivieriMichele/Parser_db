import { getRelationSymbol, getRelationColor } from '../../utils/plantUMLParser';

export const NodeDetails = ({ node, relations, onClose }) => {
  if (!node) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">{node.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl px-2"
        >
          ✕
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        Package: <span className="font-semibold">{node.package || 'N/A'}</span>
      </p>
      
      {node.attributes.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Attributi:</h4>
          <div className="grid grid-cols-2 gap-2">
            {node.attributes.map((attr, idx) => (
              <div key={idx} className="text-sm bg-white p-2 rounded">
                <span className="font-mono text-indigo-600">{attr.name}</span>
                <span className="text-gray-400"> : </span>
                <span className="text-gray-700">{attr.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Relazioni:</h4>
        <div className="space-y-1">
          {relations.length === 0 ? (
            <p className="text-sm text-gray-500">Nessuna relazione</p>
          ) : (
            relations.map((rel, idx) => (
              <div key={idx} className="text-sm bg-white p-2 rounded flex items-center gap-2">
                <span className="font-mono">{rel.from}</span>
                <span className={getRelationColor(rel.type)}>
                  {getRelationSymbol(rel.type)}
                </span>
                <span className="font-mono">{rel.to}</span>
                <span className="text-xs text-gray-500 ml-auto">{rel.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};