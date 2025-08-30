
import React, { useState, useCallback, useRef } from 'react';
import { transcribeSong } from '../services/geminiService';
import { SkillLevel } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { MusicNoteIcon, RefreshIcon, PrinterIcon, StopCircleIcon } from './common/IconComponents';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface SmartLibraryState {
  songTitle: string;
  artist: string;
  level: SkillLevel;
  transcription: string;
  status: Status;
}

const initialState: SmartLibraryState = {
  songTitle: '',
  artist: '',
  level: SkillLevel.Beginner,
  transcription: '',
  status: 'idle',
};

const SmartLibrary: React.FC = () => {
  const [state, setState] = useState<SmartLibraryState>(initialState);
  const { songTitle, artist, level, transcription, status } = state;

  const resultsRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !artist) return;
    
    const currentRequest = Date.now();
    requestRef.current = currentRequest;

    setState(s => ({ ...s, status: 'loading', transcription: '' }));
    
    try {
        const result = await transcribeSong(songTitle, artist, level);
        
        if (requestRef.current === currentRequest) {
          setState(s => ({ ...s, transcription: result, status: 'success' }));
        }
    } catch (err) {
        if (requestRef.current === currentRequest) {
          setState(s => ({ ...s, transcription: 'Ha ocurrido un error inesperado al generar la transcripción.', status: 'error' }));
        }
    }
  }, [songTitle, artist, level]);

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
            printWindow.document.write(`<html><head><title>Transcripción de ${songTitle}</title>`);
            printWindow.document.write('<style>body { font-family: monospace; line-height: 1.6; white-space: pre-wrap; color: #333; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>${songTitle} - ${artist}</h1>`);
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl text-center sm:text-left sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 [filter:drop-shadow(2px_2px_4px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_theme(colors.pink.500))]">
        Biblioteca de Música Inteligente
      </h2>
      <p className="text-gray-400 text-sm text-center sm:text-left sm:text-base">
        Escribe una canción y la IA generará una transcripción simplificada adaptada a tu nivel de habilidad.
      </p>

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="song-title" className="block text-sm font-medium text-gray-300 mb-1">Título de la Canción</label>
              <input
                id="song-title"
                type="text"
                value={songTitle}
                onChange={(e) => setState(s => ({ ...s, songTitle: e.target.value }))}
                placeholder="Ej: Yesterday"
                className="custom-input"
                required
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">Artista</label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setState(s => ({ ...s, artist: e.target.value }))}
                placeholder="Ej: The Beatles"
                className="custom-input"
                required
                disabled={status === 'loading'}
              />
            </div>
          </div>
          <div>
              <label htmlFor="level-select-lib" className="block text-sm font-medium text-gray-300 mb-1">Adaptar para Nivel</label>
              <select id="level-select-lib" value={level} onChange={(e) => setState(s => ({ ...s, level: e.target.value as SkillLevel }))} className="custom-select" disabled={status === 'loading'}>
                {Object.values(SkillLevel).map((lvl) => (<option key={lvl} value={lvl}>{lvl}</option>))}
              </select>
          </div>
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={status === 'loading' || !songTitle || !artist}
              className="inline-flex items-center justify-center w-auto bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MusicNoteIcon className="mr-2 h-5 w-5" />
              Generar Transcripción
            </button>
          </div>
        </form>
      </Card>
      
      {status === 'loading' && (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center">
                <Spinner />
                <span className="ml-3 text-gray-300">Transcribiendo tu canción...</span>
              </div>
            </div>
        </Card>
      )}

      {status === 'success' && transcription && (
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 flex-col sm:flex-row gap-4 sm:gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-200 pt-1">
              {`Acordes para "${songTitle}"`}
            </h3>
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
          <div ref={resultsRef} className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white prose-pre:bg-gray-900/50 whitespace-pre-wrap font-mono text-sm">
              {transcription}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SmartLibrary;
