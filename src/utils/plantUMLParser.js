/**
 * Parser per file PlantUML
 * Estrae classi, enumerazioni, interfacce e relazioni
 */

export const parseFile = (content) => {
  const lines = content.split('\n');
  const classes = [];
  const enums = [];
  const interfaces = [];
  const relations = [];
  const packages = [];
  
  let currentPackage = null;
  let currentClass = null;
  let currentEnum = null;
  let currentInterface = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Package
    if (line.startsWith('package ')) {
      currentPackage = line.match(/package\s+(\w+)/)?.[1];
      if (currentPackage && !packages.includes(currentPackage)) {
        packages.push(currentPackage);
      }
    }

    // Class
    if (line.startsWith('class ') && !line.includes('<<')) {
      const className = line.match(/class\s+"?([^"\s{]+)"?/)?.[1] || line.match(/class\s+(\w+)/)?.[1];
      if (className) {
        currentClass = {
          name: className,
          package: currentPackage,
          attributes: [],
          methods: []
        };
        classes.push(currentClass);
      }
    }

    // Enum
    if (line.startsWith('enum ')) {
      const enumName = line.match(/enum\s+(\w+)/)?.[1];
      if (enumName) {
        currentEnum = {
          name: enumName,
          package: currentPackage,
          values: []
        };
        enums.push(currentEnum);
        currentClass = null;
      }
    }

    // Interface
    if (line.startsWith('interface ')) {
      const interfaceName = line.match(/interface\s+(\w+)/)?.[1];
      if (interfaceName) {
        currentInterface = {
          name: interfaceName,
          package: currentPackage,
          attributes: []
        };
        interfaces.push(currentInterface);
        currentClass = null;
      }
    }

    // Attributes for classes
    if (currentClass && line.includes(':') && !line.startsWith('class') && 
        !line.startsWith('enum') && !line.includes('--') && !line.includes('..') && 
        line !== '..') {
      const attrMatch = line.match(/(\w+)\s*:\s*([^\/]+)/);
      if (attrMatch) {
        currentClass.attributes.push({
          name: attrMatch[1].trim(),
          type: attrMatch[2].trim()
        });
      }
    }

    // Attributes for interfaces
    if (currentInterface && line.includes(':') && !line.startsWith('interface') && 
        !line.includes('--') && !line.includes('..')) {
      const attrMatch = line.match(/(\w+)\s*:\s*([^\/]+)/);
      if (attrMatch) {
        currentInterface.attributes.push({
          name: attrMatch[1].trim(),
          type: attrMatch[2].trim()
        });
      }
    }

    // Enum values
    if (currentEnum && !line.startsWith('enum') && !line.includes('}') && 
        line.length > 0 && !line.startsWith('note')) {
      const enumValue = line.replace(/[[\]]/g, '').trim();
      if (enumValue && !enumValue.includes(':')) {
        currentEnum.values.push(enumValue);
      }
    }

    // Relations
    const relationPatterns = [
      { regex: /(\w+)\s*<\|-+\[.*?\]-\s*(\w+)/, type: 'inheritance' },
      { regex: /(\w+)\s*<\|-+\s*(\w+)/, type: 'inheritance' },
      { regex: /(\w+)\s*<\|\.+\s*(\w+)/, type: 'implementation' },
      { regex: /(\w+)\s*\*--\s*(\w+)/, type: 'composition' },
      { regex: /(\w+)\s*o--\s*(\w+)/, type: 'aggregation' },
      { regex: /(\w+)\s*--\*\s*(\w+)/, type: 'composition' },
      { regex: /(\w+)\s*-->\s*(\w+)/, type: 'association' },
      { regex: /(\w+)\s*--\s*(\w+)/, type: 'association' }
    ];

    for (const pattern of relationPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        relations.push({
          from: match[1],
          to: match[2],
          type: pattern.type
        });
        break;
      }
    }

    // Reset current context
    if (line === '}' || line.startsWith('}')) {
      currentClass = null;
      currentEnum = null;
      currentInterface = null;
    }
  }

  return { classes, enums, interfaces, relations, packages };
};

export const getRelationSymbol = (type) => {
  switch(type) {
    case 'inheritance': return '◁───';
    case 'implementation': return '◁···';
    case 'composition': return '◆───';
    case 'aggregation': return '◇───';
    case 'association': return '───';
    default: return '───';
  }
};

export const getRelationColor = (type) => {
  switch(type) {
    case 'inheritance': return 'text-blue-600';
    case 'implementation': return 'text-purple-600';
    case 'composition': return 'text-red-600';
    case 'aggregation': return 'text-orange-600';
    case 'association': return 'text-gray-600';
    default: return 'text-gray-600';
  }
};

export const getRelationStrokeColor = (type) => {
  switch(type) {
    case 'inheritance': return '#3b82f6';
    case 'implementation': return '#9333ea';
    case 'composition': return '#dc2626';
    case 'aggregation': return '#ea580c';
    default: return '#6b7280';
  }
};

export const getRelationMarker = (type) => {
  switch(type) {
    case 'inheritance': return 'url(#arrow-inheritance)';
    case 'implementation': return 'url(#arrow-implementation)';
    case 'composition': return 'url(#arrow-composition)';
    case 'aggregation': return 'url(#arrow-aggregation)';
    default: return 'url(#arrow-association)';
  }
};

export const getRelationDashArray = (type) => {
  return type === 'implementation' ? '5,5' : 'none';
};