
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { generateChordProgression } from '../services/geminiService';
import { Key, Style, Mood } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { ChordIcon, RefreshIcon, PrinterIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './common/IconComponents';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ChordGeneratorState {
  key: Key;
  style: Style;
  mood: Mood;
  chords: string;
  status: Status;
  error: string;
}

const initialState: ChordGeneratorState = {
  key: Key.CMajor,
  style: Style.Pop,
  mood: Mood.Happy,
  chords: '',
  status: 'idle',
  error: '',
};

const ChordGenerator: React.FC = () => {
  const [state, setState] = useState<ChordGeneratorState>(initialState);
  const { key, style, mood, chords, status, error } = state;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    return () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };
  }, []);

  const { majorKeys, minorKeys } = useMemo(() => {
    const allKeys = Object.values(Key);
    return {
      majorKeys: allKeys.filter(k => k.includes('Mayor')),
      minorKeys: allKeys.filter(k => k.includes('menor')),
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    const currentRequest = Date.now();
    requestRef.current = currentRequest;
    setState(s => ({ ...s, status: 'loading', chords: '', error: '' }));

    try {
      const result = await generateChordProgression(key, style, mood);
      if (requestRef.current === currentRequest) {
        setState(s => ({ ...s, chords: result, status: 'success' }));
      }
    } catch (err) {
      if (requestRef.current === currentRequest) {
        setState(s => ({
          ...s,
          error: 'Ha ocurrido un error inesperado al generar los acordes.',
          status: 'error'
        }));
      }
    }
  }, [key, style, mood]);

  const handleReset = useCallback(() => {
    requestRef.current = 0;
     if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setState(initialState);
  }, []);
  
  const handlePrint = () => {
    const content = resultsRef.current;
    if (content) {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Progresión de Acordes</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.6; color: #333; } strong { font-weight: bold; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>Progresión de Acordes</h1><h3>Tonalidad: ${key}, Estilo: ${style}, Emoción: ${mood}</h3><hr>`);
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }
  };

  const handleListen = useCallback(() => {
    if (!chords || !('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported or no text to speak.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Process the entire text, not just the chord progression.
    const textToSpeak = chords
      // Remove markdown for bold text
      .replace(/\*\*/g, '')
       // Replace hyphens between chords with commas for better pacing
      .replace(/\s-\s/g, ', ')
      // Replace complex chord names first for better Spanish pronunciation
      .replace(/Am7/g, 'La menor séptima')
      .replace(/Fmaj7/g, 'Fa mayor séptima')
      .replace(/Dm7/g, 'Re menor séptima')
      .replace(/Gsus4/g, 'Sol sus cuatro')
      .replace(/Cmaj7/g, 'Do mayor séptima')
      .replace(/G\/B/g, 'Sol con bajo en Si')
      // Replace simple minor chords
      .replace(/Am/g, 'La menor')
      .replace(/Bm/g, 'Si menor')
      .replace(/Cm/g, 'Do menor')
      .replace(/Dm/g, 'Re menor')
      .replace(/Em/g, 'Mi menor')
      .replace(/Fm/g, 'Fa menor')
      .replace(/Gm/g, 'Sol menor')
      // Replace simple major chords (using word boundary \b to avoid replacing parts of words)
      .replace(/\bC\b/g, 'Do')
      .replace(/\bD\b/g, 'Re')
      .replace(/\bE\b/g, 'Mi')
      .replace(/\bF\b/g, 'Fa')
      .replace(/\bG\b/g, 'Sol')
      .replace(/\bA\b/g, 'La')
      .replace(/\bB\b/g, 'Si');

    if (!textToSpeak.trim()) {
        console.warn("Text is empty after processing.");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; 

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      // The 'interrupted' error is expected when the user cancels speech synthesis.
      // We'll ignore it to avoid unnecessary console errors.
      if (event.error !== 'interrupted') {
        console.error("SpeechSynthesisUtterance.onerror", event.error);
      }
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [chords, isSpeaking]);


  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl text-center sm:text-left sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 [filter:drop-shadow(2px_2px_4px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_theme(colors.blue.400))]">
        Generador de Acordes
      </h2>
      <p className="text-gray-400 text-sm text-center sm:text-left sm:text-base">
        ¿Sin inspiración? Elige una tonalidad, un estilo y una emoción, y deja que la IA cree una progresión de acordes para tu próxima canción.
      </p>
      
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="key-select" className="block text-sm font-medium text-gray-300 mb-2">Tonalidad</label>
                    <select id="key-select" value={key} onChange={(e) => setState(s => ({ ...s, key: e.target.value as Key }))} disabled={status === 'loading'} className="custom-select">
                        <optgroup label="Escalas Mayores">
                            {majorKeys.map((k) => (<option key={k} value={k}>{k}</option>))}
                        </optgroup>
                        <optgroup label="Escalas Menores">
                            {minorKeys.map((k) => (<option key={k} value={k}>{k}</option>))}
                        </optgroup>
                    </select>
                </div>
                 <div>
                    <label htmlFor="style-select" className="block text-sm font-medium text-gray-300 mb-2">Estilo Musical</label>
                    <select id="style-select" value={style} onChange={(e) => setState(s => ({ ...s, style: e.target.value as Style }))} disabled={status === 'loading'} className="custom-select">
                        {Object.values(Style).map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="mood-select" className="block text-sm font-medium text-gray-300 mb-2">Emoción</label>
                    <select id="mood-select" value={mood} onChange={(e) => setState(s => ({ ...s, mood: e.target.value as Mood }))} disabled={status === 'loading'} className="custom-select">
                        {Object.values(Mood).map((m) => (<option key={m} value={m}>{m}</option>))}
                    </select>
                </div>
            </div>
            
            <div className="flex justify-center items-center pt-4">
                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading'}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChordIcon className="mr-2 h-5 w-5" />
                    Generar Acordes
                </button>
            </div>
        </div>
      </Card>
      
      {status === 'error' && <p className="text-red-400 text-center">{error}</p>}
      
      {status === 'loading' && (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center">
                <Spinner />
                <span className="ml-3 text-gray-300">Componiendo tu progresión...</span>
              </div>
            </div>
        </Card>
      )}

      {status === 'success' && chords && (
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 flex-col sm:flex-row gap-4 sm:gap-2">
            <h3 className="text-xl font-semibold text-gray-200 pt-1">Tu Progresión de Acordes</h3>
             <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-auto">
                <button 
                  onClick={handleListen} 
                  disabled={!chords}
                  className="flex items-center justify-center w-full sm:w-auto space-x-2 text-sm text-white bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpeaking ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                  <span>{isSpeaking ? 'Detener' : 'Escuchar'}</span>
                </button>
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
            <div ref={resultsRef} className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: chords.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
            </div>
        </Card>
      )}
    </div>
  );
};

export default ChordGenerator;