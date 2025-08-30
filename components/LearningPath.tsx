
import React, { useState, useCallback, useRef } from 'react';
import { createLearningPath } from '../services/geminiService';
import { Instrument, SkillLevel, Goal } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { BookOpenIcon, RefreshIcon, PrinterIcon } from './common/IconComponents';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface LearningPathState {
  instrument: Instrument;
  level: SkillLevel;
  goal: Goal;
  path: string;
  status: Status;
}

const initialState: LearningPathState = {
  instrument: Instrument.Piano,
  level: SkillLevel.Beginner,
  goal: Goal.Improvisation,
  path: '',
  status: 'idle',
};

const LearningPath: React.FC = () => {
  const [state, setState] = useState<LearningPathState>(initialState);
  const { instrument, level, goal, path, status } = state;
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const handleGenerate = useCallback(async () => {
    const currentRequest = Date.now();
    requestRef.current = currentRequest;

    setState(s => ({ ...s, status: 'loading', path: '' }));
    
    try {
        const result = await createLearningPath(instrument, level, goal);
        
        if (requestRef.current === currentRequest) {
          setState(s => ({ ...s, path: result, status: 'success' }));
        }
    } catch (err) {
        if (requestRef.current === currentRequest) {
            setState(s => ({ ...s, path: 'Ha ocurrido un error inesperado al generar la ruta de aprendizaje.', status: 'error' }));
        }
    }
  }, [instrument, level, goal]);

  const handleStop = useCallback(() => {
    requestRef.current = 0;
    setState(initialState);
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
  }, [handleStop]);

  const handlePrint = () => {
    const content = resultsRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Ruta de Aprendizaje</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.6; color: #333; } strong { font-weight: bold; } h2, h4 { color: #111; } h4 { margin-top: 1.5em; margin-bottom: 0.5em; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h2>Ruta de Aprendizaje para ${instrument} (${level})</h2>`);
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl text-center sm:text-left sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 [filter:drop-shadow(2px_2px_4px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_theme(colors.yellow.400))]">
        Rutas de Aprendizaje Personalizadas
      </h2>
      <p className="text-gray-400 text-sm text-center sm:text-left sm:text-base">
        Define tus metas musicales y la IA diseñará un plan de estudio paso a paso solo para ti.
      </p>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="instrument-select" className="block text-sm font-medium text-gray-300 mb-1">Instrumento</label>
                <select id="instrument-select" value={instrument} onChange={(e) => setState(s => ({ ...s, instrument: e.target.value as Instrument }))} className="custom-select" disabled={status === 'loading'}>
                  {Object.values(Instrument).map((inst) => (<option key={inst} value={inst}>{inst}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="level-select" className="block text-sm font-medium text-gray-300 mb-1">Nivel</label>
                <select id="level-select" value={level} onChange={(e) => setState(s => ({ ...s, level: e.target.value as SkillLevel }))} className="custom-select" disabled={status === 'loading'}>
                  {Object.values(SkillLevel).map((lvl) => (<option key={lvl} value={lvl}>{lvl}</option>))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label htmlFor="goal-select" className="block text-sm font-medium text-gray-300 mb-1">Meta</label>
                <select id="goal-select" value={goal} onChange={(e) => setState(s => ({ ...s, goal: e.target.value as Goal }))} className="custom-select" disabled={status === 'loading'}>
                  {Object.values(Goal).map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
            </div>
            <div className="flex justify-center pt-2">
                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading'}
                    className="inline-flex items-center justify-center w-auto bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/80 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BookOpenIcon className="mr-2 h-5 w-5" />
                    Crear mi Ruta de Aprendizaje
                </button>
            </div>
        </div>
      </Card>
      
      {status === 'loading' && (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center">
                <Spinner />
                <span className="ml-3 text-gray-300">Diseñando tu ruta personalizada...</span>
              </div>
            </div>
        </Card>
      )}
      
      {status === 'success' && path && (
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 flex-col sm:flex-row gap-4 sm:gap-2">
            <h3 className="text-xl font-semibold text-gray-200 pt-1">Tu Plan de 4 Semanas</h3>
             <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-auto">
                <button 
                  onClick={handlePrint} 
                  className="flex items-center justify-center w-full sm:w-auto space-x-2 text-sm text-white bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                    <PrinterIcon className="h-4 w-4" />
                    <span>Imprimir</span>
                </button>
                <button 
                  onClick={handleReset} 
                  className="flex items-center justify-center w-full sm:w-auto space-x-2 text-sm text-white bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                    <RefreshIcon className="h-4 w-4" />
                    <span>Empezar de Nuevo</span>
                </button>
            </div>
          </div>
          <div ref={resultsRef} className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white prose-headings:text-yellow-400 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: path.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/Semana (\d+):/g, '<h4>Semana $1:</h4>') }}>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LearningPath;
