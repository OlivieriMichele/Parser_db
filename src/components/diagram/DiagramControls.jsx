import React from 'react';
import { RotateCcw } from 'lucide-react';

const DiagramControls = ({ zoom, setZoom, onReset, onResetPositions, hasCustomPositions }) => {
  return (
    <div className="mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
        >
          −
        </button>
        <span className="text-sm font-medium min-w-16 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
        >
          +
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Reset Zoom
        </button>
        {hasCustomPositions && (
          <button
            onClick={onResetPositions}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Posizioni
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Doppio click</span> su un nodo per trascinarlo •
        <span className="font-semibold"> Click</span> per vedere i dettagli
      </div>
    </div>
  );
};

export default DiagramControls;