import React from 'react';
import { Eye, Box, FileText, Database, GitBranch, FileJson } from 'lucide-react';

const TABS = [
  { id: 'diagram', label: 'Diagramma ER', icon: Eye },
  { id: 'classes', label: 'Classi', icon: Box },
  { id: 'enums', label: 'Enumerazioni', icon: FileText },
  { id: 'interfaces', label: 'Interfacce', icon: Database },
  { id: 'relations', label: 'Relazioni', icon: GitBranch },
  { id: 'schema', label: 'Schemi JSON', icon: FileJson }
];

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-4 px-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;