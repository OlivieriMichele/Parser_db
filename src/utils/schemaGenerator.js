import { UMLToSchemaConverter } from './umlToSchemaConverter';

export function generateSchemas(parsedUMLData, options = {}) {
  const converter = new UMLToSchemaConverter(parsedUMLData);
  
  if (options.className) {
    const cls = parsedUMLData.classes.find(c => c.name === options.className);
    if (!cls) {
      throw new Error(`Classe ${options.className} non trovata`);
    }
    return converter.convertClass(cls);
  }
  
  return converter.convertAll();
}

export function downloadJSON(filename, data) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}