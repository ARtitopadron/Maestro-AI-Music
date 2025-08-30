
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getMusicalAnswer } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { SendIcon, PrinterIcon, AssistantIcon } from './common/IconComponents';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Reusable AI Avatar Component
const AiAvatar: React.FC = () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3 shadow-lg shadow-teal-500/50">
       <AssistantIcon className="w-6 h-6 text-white" />
    </div>
);

// New component for rendering a single chat message
const ChatMessage: React.FC<{ message: Message; isPrintable: boolean; onPrint: () => void; }> = ({ message, isPrintable, onPrint }) => {
    const isAi = message.sender === 'ai';

    return (
        <div className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
            {isAi && <AiAvatar />}
            <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                <div
                    className={`max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-3 rounded-2xl ${
                        isAi
                            ? 'bg-[#21262d] text-gray-300 rounded-bl-lg'
                            : 'bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-br-lg'
                    }`}
                >
                    <div
                        className="prose prose-invert prose-sm prose-p:my-3 prose-li:my-1.5 prose-ul:pl-5 prose-ol:pl-5 prose-li:marker:text-teal-400 prose-strong:text-white whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                </div>

                {isPrintable && (
                    <button
                        onClick={onPrint}
                        title="Imprimir respuesta"
                        aria-label="Imprimir respuesta"
                        className="mt-2 flex items-center space-x-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <PrinterIcon className="h-4 w-4" />
                        <span>Imprimir</span>
                    </button>
                )}
            </div>
        </div>
    );
};


const MusicalAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: 'ai',
            text: '¡Hola! Soy Asistente Musical. ¿En qué puedo ayudarte hoy?',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, status]);

    const handlePrintMessage = (text: string) => {
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (!printWindow) return;

        const formattedContent = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');

        printWindow.document.write(`
          <html>
            <head>
              <title>Respuesta del Asistente de IA Musical</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  line-height: 1.6; 
                  color: #111;
                  padding: 2rem;
                }
                strong { font-weight: 600; }
                ul, ol { padding-left: 20px; }
                li { margin-bottom: 0.5em; }
              </style>
            </head>
            <body>
              <h2>Respuesta del Asistente</h2>
              <hr>
              <div>${formattedContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleSendMessage = useCallback(async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || status === 'loading') return;

        const userMessage: Message = { sender: 'user', text: trimmedInput };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setStatus('loading');

        try {
            const aiResponseText = await getMusicalAnswer(trimmedInput);
            const aiMessage: Message = { sender: 'ai', text: aiResponseText };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                sender: 'ai',
                text: 'Lo siento, ha ocurrido un error al conectar con el asistente. Por favor, intenta de nuevo.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setStatus('idle');
        }
    }, [inputValue, status]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <h2 className="text-xl text-center sm:text-left sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 [filter:drop-shadow(2px_2px_4px_rgba(0,0,0,0.6))_drop-shadow(0_0_10px_theme(colors.teal.400))]">
                Asistente de IA Musical
            </h2>
            <p className="text-gray-400 text-sm text-center sm:text-left sm:text-base">
                ¿Tienes dudas sobre teoría musical? Pregúntale a nuestro asistente experto sobre escalas, acordes, composición y más. Obtén respuestas claras y al instante.
            </p>

            <Card className="flex flex-col h-[65vh] max-h-[550px] sm:h-[65vh] sm:max-h-[700px]">
                <div className="flex-grow p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            message={msg}
                            isPrintable={msg.sender === 'ai' && index > 0}
                            onPrint={() => handlePrintMessage(msg.text)}
                        />
                    ))}
                    {status === 'loading' && (
                        <div className="flex items-start gap-3 justify-start">
                            <AiAvatar />
                            <div className="bg-[#21262d] px-4 py-3 rounded-2xl rounded-bl-lg">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-3 sm:p-4 border-t border-[#30363D] bg-[#161B22]/50 rounded-b-xl">
                    <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 sm:space-x-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pregúntale al asistente..."
                            className="custom-input flex-grow"
                            disabled={status === 'loading'}
                            aria-label="Tu pregunta de música"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || !inputValue.trim()}
                            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            aria-label="Enviar pregunta"
                        >
                            {status === 'loading' ? <Spinner className="animate-spin h-5 w-5 text-white" /> : <SendIcon className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default MusicalAssistant;
