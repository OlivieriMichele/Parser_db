import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { generateSchemas, downloadJSON } from '../../utils/schemaGenerator';

export const SchemaTab = ({ parsedData }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [copied, setCopied] = useState(false);

  const schemas = useMemo(() => {
    try {
      return generateSchemas(parsedData);
    } catch (error) {
      console.error('Errore generazione schemi:', error);
      return [];
    }
  }, [parsedData]);

  const selectedSchema = selectedClass 
    ? schemas.find(s => s.name === selectedClass)
    : null;

  const handleCopy = () => {
    const data = selectedSchema 
      ? JSON.stringify(selectedSchema.attributes, null, 2)
      : JSON.stringify(schemas.map(s => ({
          name: s.name,
          attributes: s.attributes
        })), null, 2);
    
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (selectedSchema) {
      downloadJSON(
        `schema_${selectedSchema.name}.json`, 
        JSON.stringify(selectedSchema.attributes, null, 2)
      );
    } else {
      schemas.forEach(schema => {
        downloadJSON(
          `schema_${schema.name}.json`,
          JSON.stringify(schema.attributes, null, 2)
        );
      });
    }
  };

  if (schemas.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nessuno schema generato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Schemi JSON Generati
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {schemas.length} schemi pronti per l'import in Floki
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiato!' : 'Copia JSON'}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {selectedSchema ? 'Schema' : 'Tutti'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleziona Schema
        </label>
        <select
          value={selectedClass || ''}
          onChange={(e) => setSelectedClass(e.target.value || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Tutti gli schemi</option>
          {schemas.map(schema => (
            <option key={schema.name} value={schema.name}>
              {schema.displayName} ({schema.attributes.length} attributi)
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
        <pre className="text-sm text-gray-100 font-mono">
          {selectedSchema 
            ? JSON.stringify(selectedSchema.attributes, null, 2)
            : JSON.stringify(schemas.map(s => ({
                name: s.name,
                attributes: s.attributes
              })), null, 2)
          }
        </pre>
      </div>

      {selectedSchema && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-3">
            Dettagli Schema: {selectedSchema.displayName}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-indigo-700 font-medium">Attributi totali:</span>
              <span className="ml-2 text-indigo-900">{selectedSchema.attributes.length}</span>
            </div>
            <div>
              <span className="text-indigo-700 font-medium">Relazioni:</span>
              <span className="ml-2 text-indigo-900">
                {selectedSchema.attributes.filter(a => a.relation).length}
              </span>
            </div>
            <div>
              <span className="text-indigo-700 font-medium">Campi in lista:</span>
              <span className="ml-2 text-indigo-900">
                {selectedSchema.attributes.filter(a => a.view?.list).length}
              </span>
            </div>
            <div>
              <span className="text-indigo-700 font-medium">Campi opzionali:</span>
              <span className="ml-2 text-indigo-900">
                {selectedSchema.attributes.filter(a => a.edit?.optional).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};