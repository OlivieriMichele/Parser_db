import React from 'react';
import { Box } from 'lucide-react';

export const ClassesTab = ({ classes }) => {
  return (
    <div className="space-y-4">
      {classes.map(cls => (
        <div key={cls.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
            </div>
            {cls.package && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                {cls.package}
              </span>
            )}
          </div>
          {cls.attributes.length > 0 && (
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Attributi:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cls.attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-indigo-600">{attr.name}</span>
                    <span className="text-gray-400">:</span>
                    <span className="text-gray-700">{attr.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
