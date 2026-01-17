# 🔍 Parser PlantUML Interattivo

Un parser web interattivo per analizzare e visualizzare diagrammi PlantUML (.pu) con supporto per diagrammi ER, classi, enumerazioni e relazioni.

## ✨ Caratteristiche

- 📊 **Visualizzazione Diagramma ER** - Grafo interattivo con nodi e relazioni
- 🔎 **Analisi Classi** - Estrazione automatica di classi e attributi
- 📝 **Enumerazioni** - Lista completa di tutti gli enum e loro valori
- 🔗 **Relazioni** - Identificazione di ereditarietà, composizione, aggregazione, ecc.
- 🎯 **Filtri Avanzati** - Ricerca e filtro per package
- 🖱️ **Interattivo** - Click sui nodi per dettagli, zoom e pan
- 🐳 **Docker Ready** - Ambiente containerizzato pronto all'uso

## 🎯 Tipi di Relazioni Supportate

| Simbolo | Tipo | Descrizione |
|---------|------|-------------|
| `◁───` | Ereditarietà | Relazione "is-a" tra classi |
| `◁···` | Implementazione | Implementazione di interfacce |
| `◆───` | Composizione | Relazione forte "part-of" |
| `◇───` | Aggregazione | Relazione debole "has-a" |
| `───` | Associazione | Relazione generica |

## 📋 Prerequisiti

- **Docker** (versione 20.10+)
- **Docker Compose** (versione 2.0+)

## 🚀 Installazione e Avvio

### Opzione 1: Con Docker

```bash
# 1. Clone o scarica il repository
docker-compose up

# 3. Apri il browser
# http://localhost:3000
```

## 📂 Struttura del Progetto

```
parser/
├── 📄 Dockerfile                 # Configurazione Docker
├── 📄 docker-compose.yml         # Orchestrazione container
├── 📄 package.json               # Dipendenze Node.js
├── 📄 vite.config.js            # Configurazione Vite
├── 📄 index.html                # Entry point HTML
├── 📄 README.md                 # Questo file
└── 📁 src/
    ├── 📄 main.jsx              # Entry point React
    └── 📄 App.jsx               # Componente principale con parser
```

## 🎮 Come Usare

### 1. Carica un file PlantUML

- Clicca su **"Clicca per caricare"** o trascina un file `.pu`
- Formati supportati: `.pu`, `.puml`, `.txt`

### 2. Esplora il Diagramma ER

- **Tab "Diagramma ER"**: Visualizza il grafo completo
- **Click sui nodi**: Vedi attributi e relazioni dettagliate
- **Zoom**: Usa i pulsanti +/− o lo scroll del mouse
- **Reset**: Torna alla vista iniziale

### 3. Naviga le Sezioni

- **Classi**: Lista di tutte le classi con attributi
- **Enumerazioni**: Tutti gli enum e loro valori
- **Interfacce**: Interfacce definite nel diagramma
- **Relazioni**: Lista completa delle relazioni

### 4. Filtra e Cerca

- **Filtro Package**: Seleziona un package specifico
- **Ricerca**: Cerca per nome di classe/enum/interface

## 🛠️ Tecnologie Utilizzate

- **React 18.2** - Framework UI
- **Vite 4.3** - Build tool veloce
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icone moderne
- **Docker** - Containerizzazione
- **Node.js 18** - Runtime

## 📊 Statistiche Parser

Il parser estrae automaticamente:

- ✅ **Classi** con tutti gli attributi e metodi
- ✅ **Enumerazioni** con tutti i valori
- ✅ **Interfacce** con le loro proprietà
- ✅ **Relazioni** di 5 tipi diversi
- ✅ **Package** per organizzazione gerarchica

## 📄 Licenza

MIT License - Sentiti libero di usare questo progetto come preferisci.

**Realizzato per semplificare l'analisi di diagrammi PlantUML**