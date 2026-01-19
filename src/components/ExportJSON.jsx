import React from 'react';
import { Download, FileJson } from 'lucide-react';

/**
 * Componente per esportare i dati parsati in formato JSON
 */
const ExportJSON = ({ parsedData, filename = 'database-schema' }) => {
  
  const handleExportJSON = () => {
    // Crea il JSON formattato
    const jsonData = JSON.stringify(parsedData, null, 2);
    
    // Crea un blob
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Crea un URL temporaneo
    const url = URL.createObjectURL(blob);
    
    // Crea un link temporaneo e lo clicca
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    const jsonData = JSON.stringify(parsedData, null, 2);
    navigator.clipboard.writeText(jsonData).then(() => {
      alert('JSON copiato negli appunti!');
    }).catch(err => {
      console.error('Errore nella copia:', err);
      alert('Errore nella copia del JSON');
    });
  };

  const handleViewInNewTab = () => {
    const jsonData = JSON.stringify(parsedData, null, 2);
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Database Schema JSON</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              background: #1e1e1e;
              color: #d4d4d4;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <pre>${jsonData}</pre>
        </body>
      </html>
    `);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        title="Scarica come file JSON"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Scarica JSON</span>
      </button>
      
      <button
        onClick={handleCopyToClipboard}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Copia JSON negli appunti"
      >
        <FileJson className="w-4 h-4" />
        <span className="hidden sm:inline">Copia JSON</span>
      </button>
      
      <button
        onClick={handleViewInNewTab}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Visualizza JSON in una nuova scheda"
      >
        <span className="hidden sm:inline">Visualizza JSON</span>
        <span className="sm:hidden">👁️</span>
      </button>
    </div>
  );
};

export default ExportJSON;