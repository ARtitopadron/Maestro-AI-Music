
import React, { useState, useCallback, useRef } from 'react';
import { generateExercises } from '../services/geminiService';
import { Instrument } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { RefreshIcon, ChartBarIcon, PrinterIcon, StopCircleIcon } from './common/IconComponents';

type Status = 'idle' | 'loading' | 'success' | 'error';

const weaknessOptions = [
  "Velocidad de los dedos",
  "Precisión rítmica",
  "Afinación",
  "Transiciones de acordes",
  "Control de la respiración (voz)",
  "Dinámicas (tocar suave/fuerte)"
];

interface ExerciseGeneratorState {
  instrument: Instrument;
  weakness: string;
  exercises: string;
  status: Status;
}

const initialState: ExerciseGeneratorState = {
  instrument: Instrument.Guitar,
  weakness: weaknessOptions[0],
  exercises: '',
  status: 'idle',
};

const ExerciseGenerator: React.FC = () => {
  const [state, setState] = useState<ExerciseGeneratorState>(initialState);
  const { instrument, weakness, exercises, status } = state;

  const resultsRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const handleGenerate = useCallback(async () => {
    const currentRequest = Date.now();
    requestRef.current = currentRequest;
    
    setState(s => ({ ...s, status: 'loading', exercises: '' }));
    
    try {
      const result = await generateExercises(instrument, weakness);
      
      if (requestRef.current === currentRequest) {
        setState(s => ({ ...s, exercises: result, status: 'success' }));
      }
    } catch (err) {
      if (requestRef.current === currentRequest) {
        setState(s => ({ ...s, exercises: 'Ha ocurrido un error inesperado al generar los ejercicios.', status: 'error' }));
      }
    }
  }, [instrument, weakness]);

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
        printWindow.document.write('<html><head><title>Ejercicios Personalizados</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.6; color: #333; } strong { font-weight: bold; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Ejercicios Personalizados</h1>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl text-center sm:text-left sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 [filter:drop-shadow(2px_2px_4px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_theme(colors.green.400))]">
        Generador de Ejercicios Adaptativos
      </h2>
      <p className="text-gray-400 text-sm text-center sm:text-left sm:text-base">
        ¿Atascado en un punto? Dinos en qué necesitas trabajar y la IA creará ejercicios a tu medida.
      </p>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instrument-select" className="block text-sm font-medium text-gray-300 mb-1">Instrumento</label>
                <select
                  id="instrument-select"
                  value={instrument}
                  onChange={(e) => setState(s => ({ ...s, instrument: e.target.value as Instrument }))}
                  className="custom-select"
                  disabled={status === 'loading'}
                >
                  {Object.values(Instrument).map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="weakness-select" className="block text-sm font-medium text-gray-300 mb-1">Área a mejorar</label>
                <select
                  id="weakness-select"
                  value={weakness}
                  onChange={(e) => setState(s => ({ ...s, weakness: e.target.value }))}
                  className="custom-select"
                  disabled={status === 'loading'}
                >
                  {weaknessOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/50 hover:shadow-green-500/80 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChartBarIcon className="mr-2 h-5 w-5" />
                Generar Ejercicios
              </button>
            </div>
        </div>
      </Card>
      
      {status === 'loading' && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center">
              <Spinner />
              <span className="ml-3 text-gray-300">Creando tus ejercicios...</span>
            </div>
          </div>
        </Card>
      )}
      
      {status === 'success' && exercises && (
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 flex-col sm:flex-row gap-4 sm:gap-2">
            <h3 className="text-xl font-semibold text-gray-200 pt-1">Tus Ejercicios Personalizados</h3>
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
            <div ref={resultsRef} className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: exercises.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
            </div>
        </Card>
      )}
    </div>
  );
};

export default ExerciseGenerator;
