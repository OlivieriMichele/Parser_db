import React, { useState } from 'react';
import { parseFile } from './utils/plantUMLParser';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import { DiagramTab } from './components/tabs/DiagramTab';
import { ClassesTab } from './components/tabs/ClassesTab';
import { EnumsTab } from './components/tabs/EnumsTab';
import { InterfacesTab } from './components/tabs/InterfacesTab';
import { RelationsTab } from './components/tabs/RelationsTab';

const App = () => {
  const [parsedData, setParsedData] = useState(null);
  const [activeTab, setActiveTab] = useState('diagram');
  const [filterPackage, setFilterPackage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileLoad = (content) => {
    const data = parseFile(content);
    setParsedData(data);
    setActiveTab('diagram');
  };

  const handleReset = () => {
    setParsedData(null);
    setFilterPackage('all');
    setSearchTerm('');
    setActiveTab('diagram');
  };

  // Filtra i dati in base ai filtri attivi
  const getFilteredData = (items) => {
    return items.filter(item =>
      (filterPackage === 'all' || item.package === filterPackage) &&
      (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredClasses = parsedData ? getFilteredData(parsedData.classes) : [];
  const filteredEnums = parsedData ? getFilteredData(parsedData.enums) : [];
  const filteredInterfaces = parsedData ? getFilteredData(parsedData.interfaces) : [];

  // Se non ci sono dati, mostra il componente di upload
  if (!parsedData) {
    return <FileUpload onFileLoad={handleFileLoad} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header
          parsedData={parsedData}
          filterPackage={filterPackage}
          setFilterPackage={setFilterPackage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onReset={handleReset}
        />

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'diagram' && <DiagramTab parsedData={parsedData} />}
            {activeTab === 'classes' && <ClassesTab classes={filteredClasses} />}
            {activeTab === 'enums' && <EnumsTab enums={filteredEnums} />}
            {activeTab === 'interfaces' && <InterfacesTab interfaces={filteredInterfaces} />}
            {activeTab === 'relations' && <RelationsTab relations={parsedData.relations} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;