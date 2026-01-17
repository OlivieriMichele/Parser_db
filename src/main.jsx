import React, { useState } from 'react';
import { Upload, FileText, Database, GitBranch, Box, ArrowRight, Eye, Filter } from 'lucide-react';

const PlantUMLParser = () => {
  const [parsedData, setParsedData] = useState(null);
  const [activeTab, setActiveTab] = useState('diagram');
  const [filterPackage, setFilterPackage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const parseFile = (content) => {
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

      // Attributes
      if (currentClass && line.includes(':') && !line.startsWith('class') && !line.startsWith('enum') && !line.includes('--') && !line.includes('..') && line !== '..') {
        const attrMatch = line.match(/(\w+)\s*:\s*([^\/]+)/);
        if (attrMatch) {
          currentClass.attributes.push({
            name: attrMatch[1].trim(),
            type: attrMatch[2].trim()
          });
        }
      }

      // Interface attributes
      if (currentInterface && line.includes(':') && !line.startsWith('interface') && !line.includes('--') && !line.includes('..')) {
        const attrMatch = line.match(/(\w+)\s*:\s*([^\/]+)/);
        if (attrMatch) {
          currentInterface.attributes.push({
            name: attrMatch[1].trim(),
            type: attrMatch[2].trim()
          });
        }
      }

      // Enum values
      if (currentEnum && !line.startsWith('enum') && !line.includes('}') && line.length > 0 && !line.startsWith('note')) {
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const data = parseFile(content);
        setParsedData(data);
      };
      reader.readAsText(file);
    }
  };

  const getRelationSymbol = (type) => {
    switch(type) {
      case 'inheritance': return '◁───';
      case 'implementation': return '◁···';
      case 'composition': return '◆───';
      case 'aggregation': return '◇───';
      case 'association': return '───';
      default: return '───';
    }
  };

  const getRelationColor = (type) => {
    switch(type) {
      case 'inheritance': return 'text-blue-600';
      case 'implementation': return 'text-purple-600';
      case 'composition': return 'text-red-600';
      case 'aggregation': return 'text-orange-600';
      case 'association': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredClasses = parsedData?.classes.filter(c => 
    (filterPackage === 'all' || c.package === filterPackage) &&
    (searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredEnums = parsedData?.enums.filter(e => 
    (filterPackage === 'all' || e.package === filterPackage) &&
    (searchTerm === '' || e.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredInterfaces = parsedData?.interfaces.filter(i => 
    (filterPackage === 'all' || i.package === filterPackage) &&
    (searchTerm === '' || i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <Database className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Parser PlantUML</h1>
              <p className="text-gray-600">Carica un file .pu per analizzare la struttura del database</p>
            </div>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-indigo-500" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Clicca per caricare</span> o trascina il file
                </p>
                <p className="text-xs text-gray-500">File PlantUML (.pu, .puml, .txt)</p>
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
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              onClick={() => {
                setParsedData(null);
                setFilterPackage('all');
                setSearchTerm('');
              }}
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

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { id: 'diagram', label: 'Diagramma ER', icon: Eye },
                { id: 'classes', label: 'Classi', icon: Box },
                { id: 'enums', label: 'Enumerazioni', icon: FileText },
                { id: 'interfaces', label: 'Interfacce', icon: Database },
                { id: 'relations', label: 'Relazioni', icon: GitBranch }
              ].map(tab => (
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

          <div className="p-6">
            {activeTab === 'diagram' && (
              <div className="relative">
                <div className="mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Clicca su un nodo per vedere i dettagli • Usa lo scroll per fare zoom
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg overflow-auto bg-white" style={{ height: '800px' }}>
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 2000 1500"
                    className="cursor-move"
                  >
                    <defs>
                      <marker id="arrow-inheritance" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                      </marker>
                      <marker id="arrow-implementation" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#9333ea" />
                      </marker>
                      <marker id="arrow-composition" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L5,3 L0,6 z" fill="#dc2626" />
                      </marker>
                      <marker id="arrow-aggregation" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L5,3 L0,6 z" fill="none" stroke="#ea580c" strokeWidth="1" />
                      </marker>
                      <marker id="arrow-association" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
                      </marker>
                    </defs>

                    <g transform={`scale(${zoom}) translate(${pan.x}, ${pan.y})`}>
                      {/* Render relations first (background) */}
                      {parsedData.relations.map((rel, idx) => {
                        const fromClass = [...parsedData.classes, ...parsedData.interfaces].find(c => c.name === rel.from);
                        const toClass = [...parsedData.classes, ...parsedData.interfaces].find(c => c.name === rel.to);
                        
                        if (!fromClass || !toClass) return null;
                        
                        const fromIndex = [...parsedData.classes, ...parsedData.interfaces].indexOf(fromClass);
                        const toIndex = [...parsedData.classes, ...parsedData.interfaces].indexOf(toClass);
                        
                        const cols = 5;
                        const fromX = (fromIndex % cols) * 350 + 175;
                        const fromY = Math.floor(fromIndex / cols) * 200 + 100;
                        const toX = (toIndex % cols) * 350 + 175;
                        const toY = Math.floor(toIndex / cols) * 200 + 100;

                        const getMarker = () => {
                          switch(rel.type) {
                            case 'inheritance': return 'url(#arrow-inheritance)';
                            case 'implementation': return 'url(#arrow-implementation)';
                            case 'composition': return 'url(#arrow-composition)';
                            case 'aggregation': return 'url(#arrow-aggregation)';
                            default: return 'url(#arrow-association)';
                          }
                        };

                        const getColor = () => {
                          switch(rel.type) {
                            case 'inheritance': return '#3b82f6';
                            case 'implementation': return '#9333ea';
                            case 'composition': return '#dc2626';
                            case 'aggregation': return '#ea580c';
                            default: return '#6b7280';
                          }
                        };

                        const getDashArray = () => {
                          return rel.type === 'implementation' ? '5,5' : 'none';
                        };

                        return (
                          <g key={`rel-${idx}`}>
                            <line
                              x1={fromX}
                              y1={fromY}
                              x2={toX}
                              y2={toY}
                              stroke={getColor()}
                              strokeWidth="2"
                              strokeDasharray={getDashArray()}
                              markerEnd={getMarker()}
                              opacity="0.6"
                            />
                          </g>
                        );
                      })}

                      {/* Render classes and interfaces */}
                      {[...parsedData.classes, ...parsedData.interfaces].map((item, index) => {
                        const cols = 5;
                        const x = (index % cols) * 350 + 50;
                        const y = Math.floor(index / cols) * 200 + 50;
                        const isInterface = parsedData.interfaces.includes(item);
                        const isSelected = selectedNode === item.name;

                        return (
                          <g 
                            key={item.name} 
                            transform={`translate(${x}, ${y})`}
                            onClick={() => setSelectedNode(isSelected ? null : item.name)}
                            className="cursor-pointer"
                          >
                            <rect
                              width="250"
                              height="100"
                              fill={isSelected ? '#fef3c7' : (isInterface ? '#f0fdf4' : '#fff')}
                              stroke={isSelected ? '#f59e0b' : (isInterface ? '#22c55e' : '#6366f1')}
                              strokeWidth={isSelected ? '3' : '2'}
                              rx="8"
                              className="transition-all"
                            />
                            
                            {/* Header */}
                            <rect
                              width="250"
                              height="30"
                              fill={isInterface ? '#dcfce7' : '#e0e7ff'}
                              rx="8"
                            />
                            <rect
                              y="30"
                              width="250"
                              height="70"
                              fill="transparent"
                            />

                            {/* Class name */}
                            <text
                              x="125"
                              y="20"
                              textAnchor="middle"
                              className="font-bold"
                              fontSize="14"
                              fill="#1f2937"
                            >
                              {isInterface ? '<<interface>>' : ''}
                            </text>
                            <text
                              x="125"
                              y={isInterface ? "40" : "20"}
                              textAnchor="middle"
                              className="font-bold"
                              fontSize="16"
                              fill="#1f2937"
                            >
                              {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                            </text>

                            {/* Package badge */}
                            {item.package && (
                              <text
                                x="125"
                                y={isInterface ? "55" : "38"}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#6b7280"
                              >
                                {item.package}
                              </text>
                            )}

                            {/* Attributes count */}
                            <text
                              x="125"
                              y="75"
                              textAnchor="middle"
                              fontSize="12"
                              fill="#6b7280"
                            >
                              {item.attributes.length} attributi
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>

                {/* Details panel */}
                {selectedNode && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{selectedNode}</h3>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    {(() => {
                      const entity = [...parsedData.classes, ...parsedData.interfaces].find(c => c.name === selectedNode);
                      if (!entity) return null;
                      
                      return (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Package: <span className="font-semibold">{entity.package || 'N/A'}</span>
                          </p>
                          {entity.attributes.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Attributi:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {entity.attributes.map((attr, idx) => (
                                  <div key={idx} className="text-sm bg-white p-2 rounded">
                                    <span className="font-mono text-indigo-600">{attr.name}</span>
                                    <span className="text-gray-400"> : </span>
                                    <span className="text-gray-700">{attr.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Show relations */}
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Relazioni:</h4>
                            <div className="space-y-1">
                              {parsedData.relations
                                .filter(rel => rel.from === selectedNode || rel.to === selectedNode)
                                .map((rel, idx) => (
                                  <div key={idx} className="text-sm bg-white p-2 rounded flex items-center gap-2">
                                    <span className="font-mono">{rel.from}</span>
                                    <span className={getRelationColor(rel.type)}>{getRelationSymbol(rel.type)}</span>
                                    <span className="font-mono">{rel.to}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{rel.type}</span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4">
                {filteredClasses.map(cls => (
                  <div key={cls.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Box className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                      </div>
                      {cls.package && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {cls.package}
                        </span>
                      )}
                    </div>
                    {cls.attributes.length > 0 && (
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Attributi:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {cls.attributes.map((attr, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="font-mono text-indigo-600">{attr.name}</span>
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
            )}

            {activeTab === 'enums' && (
              <div className="space-y-4">
                {filteredEnums.map(enm => (
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
            )}

            {activeTab === 'interfaces' && (
              <div className="space-y-4">
                {filteredInterfaces.map(iface => (
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
            )}

            {activeTab === 'relations' && (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Legenda:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">◁───</span>
                      <span>Ereditarietà</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">◁···</span>
                      <span>Implementazione</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">◆───</span>
                      <span>Composizione</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">◇───</span>
                      <span>Aggregazione</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">───</span>
                      <span>Associazione</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {parsedData.relations.map((rel, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-mono text-sm font-semibold text-gray-800 min-w-32">
                        {rel.from}
                      </span>
                      <span className={`font-mono ${getRelationColor(rel.type)}`}>
                        {getRelationSymbol(rel.type)}
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-800 min-w-32">
                        {rel.to}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {rel.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantUMLParser;