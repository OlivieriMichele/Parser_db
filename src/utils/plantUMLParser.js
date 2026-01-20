/**
 * Parser PlantUML - Conforme alla Reference Guide ufficiale
 * Supporta: classi, interfacce, enum, abstract, separatori, alias, note
 */

export const parseFile = (content) => {
  const lines = content.split('\n');
  const classes = [];
  const enums = [];
  const interfaces = [];
  const relations = [];
  const packages = [];
  
  let currentPackage = null;
  let currentEntity = null; // Può essere class, enum o interface
  let currentEntityType = null; // 'class', 'enum', 'interface'
  let inNote = false;
  let noteDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines, comments, and PlantUML directives
    if (!line || 
        line.startsWith("'") || 
        line.startsWith('@startuml') || 
        line.startsWith('@enduml') ||
        line.startsWith('skinparam') ||
        line.startsWith('left to right') ||
        line.startsWith('hide ')) {
      continue;
    }

    // Handle multi-line notes
    if (line.startsWith('note ') || line.includes(' note ')) {
      inNote = true;
      noteDepth = 1;
      continue;
    }
    if (inNote) {
      if (line === 'end note') {
        inNote = false;
        noteDepth = 0;
      }
      continue;
    }

    // Package declaration
    if (line.match(/^package\s+/)) {
      const match = line.match(/package\s+(\w+)/);
      if (match) {
        currentPackage = match[1];
        if (!packages.includes(currentPackage)) {
          packages.push(currentPackage);
        }
      }
      continue;
    }

    // Close package
    if (line === '}' && currentPackage && !currentEntity) {
      currentPackage = null;
      continue;
    }

    // Class declaration (con supporto per alias e modificatori)
    // Formato: [abstract] class "Name" [as Alias] {
    if (line.match(/^\s*(abstract\s+)?class\s+/)) {
      const match = line.match(/(?:abstract\s+)?class\s+(?:"([^"]+)"\s+as\s+(\w+)|"([^"]+)"|(\w+))/);
      if (match) {
        const displayName = match[1] || match[3]; // Nome tra virgolette
        const alias = match[2]; // Alias dopo "as"
        const simpleName = match[4]; // Nome semplice senza virgolette
        
        const className = alias || displayName || simpleName;
        
        currentEntity = {
          name: className.replace(/\\n/g, ''), // Rimuovi \n dai nomi
          displayName: displayName || simpleName,
          package: currentPackage,
          attributes: [],
          methods: []
        };
        classes.push(currentEntity);
        currentEntityType = 'class';
      }
      continue;
    }

    // Interface declaration
    if (line.match(/^\s*interface\s+/)) {
      const match = line.match(/interface\s+(\w+)/);
      if (match) {
        currentEntity = {
          name: match[1],
          package: currentPackage,
          attributes: []
        };
        interfaces.push(currentEntity);
        currentEntityType = 'interface';
      }
      continue;
    }

    // Enum declaration
    if (line.match(/^\s*enum\s+/)) {
      const match = line.match(/enum\s+(\w+)/);
      if (match) {
        currentEntity = {
          name: match[1],
          package: currentPackage,
          values: []
        };
        enums.push(currentEntity);
        currentEntityType = 'enum';
      }
      continue;
    }

    // Close entity
    if (line === '}' && currentEntity) {
      currentEntity = null;
      currentEntityType = null;
      continue;
    }

    // Inside an entity - parse members
    if (currentEntity) {
      // Skip separators and section headers
      if (line === '..' || 
          line.startsWith('==') || 
          line.startsWith('--') ||
          line === '{' ||
          line === '}') {
        continue;
      }

      // Enum values
      if (currentEntityType === 'enum') {
        // Remove brackets, quotes, and trailing comments
        let enumValue = line
          .replace(/^\[/, '')
          .replace(/\]$/, '')
          .replace(/\[D\]/, 'D')
          .replace(/\[W\]/, 'W')
          .replace(/\[M\]/, 'M')
          .replace(/\[Y\]/, 'Y')
          .split('//')[0]
          .split(':')[0]
          .trim();
        
        if (enumValue && enumValue.length > 0 && !enumValue.includes('note')) {
          currentEntity.values.push(enumValue);
        }
        continue;
      }

      // Class/Interface attributes and methods
      if (currentEntityType === 'class' || currentEntityType === 'interface') {
        // Attribute format: name : type [multiplicity] [= defaultValue]
        // OR just: name (without type, defaults to String)
        // Method format: name(params) : returnType
        
        // Check if it's a method (contains parentheses)
        const isMethod = line.includes('(') && line.includes(')');
        
        if (isMethod && currentEntityType === 'class') {
          const methodMatch = line.match(/(\w+)\s*\([^)]*\)\s*(?::\s*(.+))?/);
          if (methodMatch) {
            currentEntity.methods.push({
              name: methodMatch[1],
              returnType: methodMatch[2]?.trim() || 'void'
            });
          }
        } else {
          // It's an attribute
          if (line.includes(':')) {
            // Standard format: name : type
            const attrMatch = line.match(/(\w+)\s*:\s*(.+?)$/);
            if (attrMatch) {
              let attrName = attrMatch[1].trim();
              let attrType = attrMatch[2].trim();
              
              // Clean up the type:
              // Remove comments
              attrType = attrType.split('//')[0].trim();
              
              // Remove visibility modifiers if present at the start
              attrType = attrType.replace(/^[\+\-\#\~]\s*/, '');
              
              currentEntity.attributes.push({
                name: attrName,
                type: attrType
              });
            }
          } else {
            // Attribute without type: just name
            const nameMatch = line.match(/^[\+\-\#\~]?\s*(\w+)\s*$/);
            if (nameMatch) {
              currentEntity.attributes.push({
                name: nameMatch[1].trim(),
                type: 'String' // Default type
              });
            }
          }
        }
        continue;
      }
    }

    // Parse relations (outside entities)
    if (!currentEntity) {
      // Relation patterns from PlantUML spec with support for:
      // - Direction modifiers: [udlr] (up, down, left, right)
      // - Line styles: [thickness=N], [bold], [dashed], etc.
      // - Colors and labels
      
      const relationPatterns = [
        // Inheritance/Extension with modifiers
        { regex: /(\w+)\s+<\|-+\[.*?\][udlr]?-?\s*(\w+)/, type: 'inheritance' },
        { regex: /(\w+)\s+<\|-+[udlr]?\s+(\w+)/, type: 'inheritance' },
        { regex: /(\w+)\s+<\|-+\s+(\w+)/, type: 'inheritance' },
        
        // Implementation with modifiers (most common in your file)
        // Format: Interface <|.[thickness=2]d. Class
        { regex: /(\w+)\s+<\|\.+\[.*?\][udlr]?\.+\s*(\w+)/, type: 'implementation' },
        { regex: /(\w+)\s+<\|\.+[udlr]?\.+\s*(\w+)/, type: 'implementation' },
        { regex: /(\w+)\s+<\|\.+\[.*?\]\s*(\w+)/, type: 'implementation' },
        { regex: /(\w+)\s+<\|\.+\s+(\w+)/, type: 'implementation' },
        
        // Composition (strong) with modifiers
        { regex: /(\w+)(?:::\w+)?\s+\*-+\[.*?\][udlr]?-?\s*(\w+)(?:::\w+)?/, type: 'composition' },
        { regex: /(\w+)(?:::\w+)?\s+-+\[.*?\][udlr]?\*\s*(\w+)(?:::\w+)?/, type: 'composition' },
        { regex: /(\w+)(?:::\w+)?\s+\*--\s+(\w+)(?:::\w+)?/, type: 'composition' },
        { regex: /(\w+)(?:::\w+)?\s+--\*\s+(\w+)(?:::\w+)?/, type: 'composition' },
        
        // Aggregation (weak) with modifiers
        { regex: /(\w+)(?:::\w+)?\s+o-+\[.*?\][udlr]?-?\s*(\w+)(?:::\w+)?/, type: 'aggregation' },
        { regex: /(\w+)(?:::\w+)?\s+-+\[.*?\][udlr]?o\s*(\w+)(?:::\w+)?/, type: 'aggregation' },
        { regex: /(\w+)(?:::\w+)?\s+o--\s+(\w+)(?:::\w+)?/, type: 'aggregation' },
        { regex: /(\w+)(?:::\w+)?\s+--o\s+(\w+)(?:::\w+)?/, type: 'aggregation' },
        { regex: /(\w+)(?:::\w+)?\s+o\.+\s+(\w+)(?:::\w+)?/, type: 'aggregation' },
        
        // Association (directed) with modifiers
        { regex: /(\w+)(?:::\w+)?\s+-+\[.*?\][udlr]?>\s*(\w+)(?:::\w+)?/, type: 'association' },
        { regex: /(\w+)(?:::\w+)?\s+<-+\[.*?\][udlr]?-?\s*(\w+)(?:::\w+)?/, type: 'association' },
        { regex: /(\w+)(?:::\w+)?\s+-->\s+(\w+)(?:::\w+)?/, type: 'association' },
        { regex: /(\w+)(?:::\w+)?\s+<--\s+(\w+)(?:::\w+)?/, type: 'association' },
        { regex: /(\w+)(?:::\w+)?\s+\.+>\s+(\w+)(?:::\w+)?/, type: 'dependency' },
        
        // Association (non-directed) with modifiers
        { regex: /(\w+)(?:::\w+)?\s+-+\[.*?\][udlr]?-?\s*(\w+)(?:::\w+)?/, type: 'association' },
        { regex: /(\w+)(?:::\w+)?\s+--\s+(\w+)(?:::\w+)?/, type: 'association' },
        
        // Nested/Inner classes
        { regex: /(\w+)\s+\+--\s+(\w+)/, type: 'nested' }
      ];

      for (const pattern of relationPatterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const from = match[1];
          const to = match[2];
          
          // Check for duplicates
          const isDuplicate = relations.some(r => 
            r.from === from && r.to === to && r.type === pattern.type
          );
          
          if (!isDuplicate) {
            relations.push({
              from: from,
              to: to,
              type: pattern.type
            });
          }
          break;
        }
      }
    }
  }

  console.log('=== PARSING RESULTS ===');
  console.log('Classes:', classes.length, classes.map(c => `${c.name} (${c.attributes.length} attrs)`));
  console.log('Interfaces:', interfaces.length, interfaces.map(i => `${i.name} (${i.attributes.length} attrs)`));
  console.log('Enums:', enums.length, enums.map(e => `${e.name} (${e.values.length} values)`));
  console.log('Relations:', relations.length);
  
  return { classes, enums, interfaces, relations, packages };
};

export const getRelationSymbol = (type) => {
  switch(type) {
    case 'inheritance': return '◁───';
    case 'implementation': return '◁···';
    case 'composition': return '◆───';
    case 'aggregation': return '◇───';
    case 'association': return '───';
    case 'dependency': return '···>';
    case 'nested': return '⊕───';
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
    case 'dependency': return 'text-green-600';
    case 'nested': return 'text-pink-600';
    default: return 'text-gray-600';
  }
};

export const getRelationStrokeColor = (type) => {
  switch(type) {
    case 'inheritance': return '#3b82f6';
    case 'implementation': return '#9333ea';
    case 'composition': return '#dc2626';
    case 'aggregation': return '#ea580c';
    case 'dependency': return '#22c55e';
    case 'nested': return '#ec4899';
    default: return '#6b7280';
  }
};

export const getRelationMarker = (type) => {
  switch(type) {
    case 'inheritance': return 'url(#arrow-inheritance)';
    case 'implementation': return 'url(#arrow-implementation)';
    case 'composition': return 'url(#arrow-composition)';
    case 'aggregation': return 'url(#arrow-aggregation)';
    case 'dependency': return 'url(#arrow-dependency)';
    case 'nested': return 'url(#arrow-nested)';
    default: return 'url(#arrow-association)';
  }
};

export const getRelationDashArray = (type) => {
  return (type === 'implementation' || type === 'dependency') ? '5,5' : 'none';
};