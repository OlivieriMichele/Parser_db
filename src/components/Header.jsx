import React from 'react';
import { Database, Filter } from 'lucide-react';

const Header = ({ 
  parsedData, 
  filterPackage, 
  setFilterPackage, 
  searchTerm, 
  setSearchTerm, 
  onReset 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Struttura Database</h1>
            <p className="text-sm text-gray-600">
              {parsedData.classes.length} classi · {parsedData.enums.length} enum · 
              {parsedData.interfaces.length} interfacce · {parsedData.relations.length} relazioni
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Carica Nuovo File
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tutti i Package</option>
            {parsedData.packages.map(pkg => (
              <option key={pkg} value={pkg}>{pkg}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Cerca classe, enum, interface..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-64"
        />
      </div>
    </div>
  );
};

export default Header;