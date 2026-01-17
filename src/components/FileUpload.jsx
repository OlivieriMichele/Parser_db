import React from 'react';
import { Upload, Database } from 'lucide-react';

const FileUpload = ({ onFileLoad }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileLoad(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Parser PlantUML
            </h1>
            <p className="text-gray-600">
              Carica un file .pu per analizzare la struttura del database
            </p>
          </div>
          
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-4 text-indigo-500" />
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-semibold">Clicca per caricare</span> o trascina il file
              </p>
              <p className="text-xs text-gray-500">
                File PlantUML (.pu, .puml, .txt)
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pu,.puml,.txt"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;