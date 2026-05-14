/*import { GoogleGenAI, Type } from "@google/genai";*/
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ToolType, Platform } from "../types";
import { 
  collection, 
  addDoc, 
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Configuration adaptée à votre nouvel exemple
/*const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});*/
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
  generateContent: async (tool: ToolType, params: any) => {
    const { niche, platform, topic, tone, message, goal, duration, angles, intensity } = params;

    let systemInstruction = "";
    let prompt = "";
    let responseSchema: any = null;

    // --- Switch Case Logic (Gardé tel quel car c'est votre logique métier) ---
    switch (tool) {
      case 'hooks':
        systemInstruction = `Tu es un expert senior en marketing de contenu viral pour TikTok et Facebook, spécialisé en Afrique francophone...`;
        prompt = `Génère 10 hooks d'accroche percutants...`; // (Prompts raccourcis ici pour la lisibilité, gardez les vôtres)
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            hooks: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  hook: { type: SchemaType.STRING },
                  framework: { type: SchemaType.STRING },
                  platform: { type: SchemaType.STRING },
                  score: { type: SchemaType.NUMBER },
                  justification: { type: SchemaType.STRING },
                },
                required: ["hook", "framework", "platform", "score", "justification"],
              },
            },
          },
          required: ["hooks"],
        };
        break;

      case 'script':
        systemInstruction = `Tu es un scénariste expert en contenu court...`;
        prompt = `Écris un script de contenu complet...`;
        // Logique de schema conditionnelle gardée
        if (platform === 'tiktok') {
          responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
              platform: { type: SchemaType.STRING },
              sections: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    id: { type: SchemaType.STRING },
                    label: { type: SchemaType.STRING },
                    content: { type: SchemaType.STRING },
                    visual_note: { type: SchemaType.STRING },
                  },
                  required: ["id", "label", "content"],
                },
              },
            },
            required: ["platform", "sections"],
          };
        } else {
          responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
              platform: { type: SchemaType.STRING },
              sections: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    id: { type: SchemaType.STRING },
                    label: { type: SchemaType.STRING },
                    content: { type: SchemaType.STRING },
                  },
                  required: ["id", "label", "content"],
                },
              },
            },
            required: ["platform", "sections"],
          };
        }
        break;

      case 'ideas':
        systemInstruction = `Tu es un stratège de contenu expert...`;
        prompt = `Génère 20 idées de contenus...`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            ideas: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  format: { type: SchemaType.STRING },
                  platform: { type: SchemaType.STRING },
                },
                required: ["title", "description", "format", "platform"],
              },
            },
          },
          required: ["ideas"],
        };
        break;

      case 'calendar':
        systemInstruction = `Tu es un directeur de contenu digital...`;
        prompt = `Crée un calendrier de contenu complet sur 30 jours.`;
        responseSchema = {
          type: SchemaType.OBJECT,
          properties: {
            calendar: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  day: { type: SchemaType.NUMBER },
                  week: { type: SchemaType.NUMBER },
                  idea: { type: SchemaType.STRING },
                  hook: { type: SchemaType.STRING },
                  format: { type: SchemaType.STRING },
                  platform: { type: SchemaType.STRING },
                },
                required: ["day", "week", "idea", "hook", "format", "platform"],
              },
            },
          },
          required: ["calendar"],
        };
        break;
    }

    // --- Nouvelle implémentation de l'appel AI ---
    // --- Corrected AI Call ---
// 1. Initialize the model with instructions and schema
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest", // Use the stable model name
  systemInstruction: systemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  },
});

// 2. Generate the content
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
const data = JSON.parse(text || "{}");

    // --- Sauvegarde Firestore (Gardée inchangée) ---
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'generations'), {
          user_id: auth.currentUser.uid,
          tool,
          niche,
          platform,
          input_data: params,
          output_data: data,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Error saving generation:", e);
      }
    }

    return data;
  },

  getHistory: async (limitCount: number = 5) => {
    if (!auth.currentUser) return [];
    
    try {
      const q = query(
        collection(db, 'generations'),
        where('user_id', '==', auth.currentUser.uid),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching history:", e);
      return [];
    }
  },

  getMonthlyCount: async (month: number, year: number) => {
    if (!auth.currentUser) return 0;
    
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      
      const q = query(
        collection(db, 'generations'),
        where('user_id', '==', auth.currentUser.uid),
        where('created_at', '>=', startDate),
        where('created_at', '<=', endDate)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (e) {
      console.error("Error counting monthly generations:", e);
      return 0;
    }
  }
};