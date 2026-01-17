import { FileText } from 'lucide-react';

export const EnumsTab = ({ enums }) => {
  return (
    <div className="space-y-4">
      {enums.map(enm => (
        <div key={enm.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">{enm.name}</h3>
            </div>
            {enm.package && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {enm.package}
              </span>
            )}
          </div>
          {enm.values.length > 0 && (
            <div className="bg-gray-50 rounded p-3">
              <div className="flex flex-wrap gap-2">
                {enm.values.map((val, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};