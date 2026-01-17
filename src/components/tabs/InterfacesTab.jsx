import { Database } from 'lucide-react';

export const InterfacesTab = ({ interfaces }) => {
  return (
    <div className="space-y-4">
      {interfaces.map(iface => (
        <div key={iface.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">{iface.name}</h3>
            </div>
            {iface.package && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {iface.package}
              </span>
            )}
          </div>
          {iface.attributes.length > 0 && (
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Attributi:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {iface.attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-green-600">{attr.name}</span>
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