
import { GoogleGenAI } from "@google/genai";
import { Instrument, SkillLevel, Goal, Key, Style, Mood } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handleApiError = (error: unknown, context: string): string => {
  console.error(`Error ${context}:`, error);

  let errorMessage = `Lo siento, no pude ${context} en este momento. Por favor, inténtalo de nuevo.`;

  if (error instanceof Error) {
    if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = "Has alcanzado el límite de solicitudes. Por favor, espera un momento antes de volver a intentarlo.";
    }
  }
  
  return errorMessage;
};

export const generateChordProgression = async (key: Key, style: Style, mood: Mood): Promise<string> => {
  const prompt = `Actúa como un experto en teoría musical y un talentoso compositor. 
Tu tarea es generar una progresión de acordes creativa y musicalmente coherente.
Parámetros:
- Tonalidad: ${key}
- Estilo: ${style}
- Emoción: ${mood}

Instrucciones:
1.  Genera una progresión de 4 a 8 acordes que se ajuste perfectamente a los parámetros dados.
2.  Presenta la progresión de forma clara y en negrita. Ejemplo: **C - G - Am - F**.
3.  Escribe una breve explicación (2-3 frases) de por qué esa progresión funciona para el estilo y la emoción solicitados, utilizando un lenguaje inspirador y fácil de entender.
4.  La respuesta debe estar íntegramente en español.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "generar la progresión de acordes");
  }
};


export const generateExercises = async (instrument: Instrument, weakness: string): Promise<string> => {
    const prompt = `Actúa como un asistente de práctica musical. Genera 3 ejercicios de calentamiento personalizados para un músico de ${instrument} que tiene dificultades con "${weakness}". Los ejercicios deben describirse claramente en texto y en español. Cada ejercicio debe tener un título en negrita y una breve descripción de su propósito.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return handleApiError(error, "generar los ejercicios");
    }
};

export const createLearningPath = async (instrument: Instrument, level: SkillLevel, goal: Goal): Promise<string> => {
    const prompt = `Actúa como un tutor de música de IA. Crea un plan de aprendizaje personalizado de 4 semanas para un músico de ${instrument} de nivel ${level} cuyo objetivo es "${goal}". El plan debe estar estructurado semana a semana. Para cada semana, enumera 2-3 tareas específicas, incluyendo conceptos teóricos para estudiar, ejercicios técnicos para practicar y una pieza de repertorio para aprender. El tono debe ser motivador y claro, y la respuesta debe estar en español.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return handleApiError(error, "generar la ruta de aprendizaje");
    }
};

export const transcribeSong = async (songTitle: string, artist: string, level: SkillLevel): Promise<string> => {
    const prompt = `Actúa como un útil asistente de músico. Genera una tabla de acordes simplificada para la canción "${songTitle}" de ${artist}, adaptada para un músico de nivel ${level}. La tabla debe ser fácil de leer. Incluye las secciones principales de la canción (por ejemplo, Verso, Coro, Puente). Si es posible, agrega un diagrama simple de rasgueo. La respuesta debe estar en español.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
      } catch (error) {
        return handleApiError(error, "generar la transcripción");
      }
};

export const getMusicalAnswer = async (question: string): Promise<string> => {
  const prompt = `Un estudiante de música pregunta: "${question}". 
  
  Actúa como un Asistente Musical de IA experto en música. Eres amigable, pedagógico y tus respuestas son claras y concisas. Tu especialidad es la teoría musical, incluyendo escalas, acordes, composición y ritmo. Responde a la pregunta del estudiante de manera que sea fácil de entender, utilizando analogías y ejemplos prácticos cuando sea posible. Si la pregunta es demasiado amplia, como 'háblame de los acordes', sugiere al usuario temas específicos sobre los que podría preguntar. Formatea tu respuesta con negritas para los términos importantes y listas para los conceptos clave, usando markdown. La respuesta debe estar íntegramente en español.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "responder tu pregunta");
  }
};
