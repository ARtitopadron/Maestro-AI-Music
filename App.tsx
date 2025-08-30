
import React, { useState, useMemo } from 'react';
import ChordGenerator from './components/RealTimeAnalysis';
import ExerciseGenerator from './components/ExerciseGenerator';
import LearningPath from './components/LearningPath';
import SmartLibrary from './components/SmartLibrary';
import MusicalAssistant from './components/MusicalAssistant';
import { MusicNoteIcon, ChordIcon, ChartBarIcon, BookOpenIcon, LibraryIcon, AssistantIcon } from './components/common/IconComponents';

type Feature = 'chords' | 'exercises' | 'paths' | 'library' | 'assistant';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('assistant');

  const features = [
    { id: 'assistant', name: ['Asistente de', 'IA Musical'], icon: AssistantIcon, color: 'teal' },
    { id: 'chords', name: ['Generador de', 'Acordes'], icon: ChordIcon, color: 'blue' },
    { id: 'exercises', name: ['Generador de', 'Ejercicios'], icon: ChartBarIcon, color: 'green' },
    { id: 'paths', name: ['Rutas de', 'Aprendizaje'], icon: BookOpenIcon, color: 'yellow' },
    { id: 'library', name: ['Biblioteca', 'Inteligente'], icon: LibraryIcon, color: 'pink' },
  ] as const;

  const activeColorClasses: Record<typeof features[number]['color'], string> = {
    teal: 'bg-teal-500 shadow-teal-500/30',
    blue: 'bg-blue-600 shadow-blue-600/30',
    green: 'bg-green-600 shadow-green-600/30',
    yellow: 'bg-yellow-500 shadow-yellow-500/30',
    pink: 'bg-pink-600 shadow-pink-600/30',
  };

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'assistant':
        return <MusicalAssistant />;
      case 'chords':
        return <ChordGenerator />;
      case 'exercises':
        return <ExerciseGenerator />;
      case 'paths':
        return <LearningPath />;
      case 'library':
        return <SmartLibrary />;
      default:
        return <MusicalAssistant />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans flex flex-col">
      <header className="bg-[#0D1117]/80 backdrop-blur-sm border-b border-[#30363D]/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg [box-shadow:0px_5px_15px_rgba(168,85,247,0.4),_inset_0px_1px_2px_rgba(255,255,255,0.3)]">
                <MusicNoteIcon className="h-5 w-5 text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.7))_drop-shadow(0_0_8px_rgba(192,132,252,0.9))_drop-shadow(0_0_15px_rgba(192,132,252,0.6))]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7),_0_0_5px_rgba(255,255,255,0.5),_0_0_10px_rgba(168,85,247,0.3)]">Maestro AI</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col items-center gap-6 sm:gap-8">
        {/* --- Navigation Buttons --- */}
        <nav className="flex justify-center items-center flex-wrap gap-4 w-full">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            const activeClass = isActive ? activeColorClasses[feature.color] : '';
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id as Feature)}
                className={`flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 p-2 sm:p-3 rounded-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117] ${
                  isActive
                    ? `${activeClass} text-white shadow-lg`
                    : 'bg-[#161B22] text-gray-400 hover:bg-[#21262d] hover:text-white'
                }`}
              >
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 mb-1 sm:mb-2" />
                <span className="text-center text-xs sm:text-sm font-medium leading-tight">
                  {feature.name[0]}
                  <br />
                  {feature.name[1]}
                </span>
              </button>
            );
          })}
        </nav>
        
        {/* --- Main Content --- */}
        <div className="w-full max-w-4xl">
          {useMemo(() => renderActiveFeature(), [activeFeature])}
        </div>
      </main>

       <footer className="text-center p-4 text-xs text-gray-500">
        Desarrollado por <a href="https://www.linkedin.com/in/jorgealvaropadron/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Jorge Tito Padrón</a> y <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Gemini</a>
      </footer>
    </div>
  );
};

export default App;
