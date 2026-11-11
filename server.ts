import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  AnalyzeSkillRequestPayload,
  BUSINESS_GUIDE_SYSTEM_INSTRUCTION,
  parseAndValidateBusinessGuideResponse,
  parseDataUrlToInlineData,
} from './src/utils/businessGuide';
import {
  FIRST_WEEK_PLAN_SYSTEM_INSTRUCTION,
  FirstWeekPlanRequestPayload,
  parseAndValidateFirstWeekPlanResponse,
} from './src/utils/firstWeekPlan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const BUSINESS_GUIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skill_summary: {
      type: Type.STRING,
      description:
        'A concise summary of the user skill and craft observed in the photos and input, written in simple Urdu and English.',
    },
    style_description: {
      type: Type.STRING,
      description:
        'Description of the visual style, materials, and workmanship visible in the uploaded photos, in simple Urdu and English.',
    },
    target_customers: {
      type: Type.STRING,
      description:
        'Practical description of who would buy this work in or near her city, in simple Urdu and English.',
    },
    suggested_products: {
      type: Type.ARRAY,
      description:
        'Exactly 3 practical product ideas based on the visible skill and photos.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Name of the suggested product.',
          },
          reason: {
            type: Type.STRING,
            description:
              'Why this product fits what is visible in her photos and her stated skill.',
          },
          description_urdu: {
            type: Type.STRING,
            description: 'Simple, clear description of this product in Urdu.',
          },
          description_english: {
            type: Type.STRING,
            description: 'Simple, clear description of this product in English.',
          },
        },
        required: [
          'name',
          'reason',
          'description_urdu',
          'description_english',
        ],
      },
    },
    whatsapp_message_urdu: {
      type: Type.STRING,
      description:
        'A short, friendly announcement in Urdu that she can send on WhatsApp to her contacts about her work.',
    },
  },
  required: [
    'skill_summary',
    'style_description',
    'target_customers',
    'suggested_products',
    'whatsapp_message_urdu',
  ],
};

const FIRST_WEEK_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    days: {
      type: Type.ARRAY,
      description:
        'A 7-day checklist containing EXACTLY 7 items (Day 1 to Day 7) with one simple, practical action per day in both simple Urdu and simple English.',
      items: {
        type: Type.OBJECT,
        properties: {
          day: {
            type: Type.INTEGER,
            description: 'The day number from 1 to 7.',
          },
          title_urdu: {
            type: Type.STRING,
            description: 'Short title of the daily action in simple Urdu.',
          },
          title_english: {
            type: Type.STRING,
            description: 'Short title of the daily action in simple English.',
          },
          action_urdu: {
            type: Type.STRING,
            description:
              'One simple, practical action she can do from home on this day, written in simple Urdu.',
          },
          action_english: {
            type: Type.STRING,
            description:
              'One simple, practical action she can do from home on this day, written in simple English.',
          },
        },
        required: [
          'day',
          'title_urdu',
          'title_english',
          'action_urdu',
          'action_english',
        ],
      },
    },
  },
  required: ['days'],
};

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));

  app.post('/api/analyze-skill', async (req, res) => {
    try {
      const body = req.body as AnalyzeSkillRequestPayload;
      const skill = typeof body?.skill === 'string' ? body.skill.trim() : '';
      const city = typeof body?.city === 'string' ? body.city.trim() : '';
      const photos = Array.isArray(body?.photos) ? body.photos : [];

      if (!skill || !city || photos.length < 1 || photos.length > 4) {
        res.status(400).json({
          error:
            'Please provide a skill, a city, and between 1 and 4 photos of your work.',
        });
        return;
      }

      const imageParts = photos
        .slice(0, 4)
        .map((photo) => parseDataUrlToInlineData(photo.dataUrl))
        .filter(
          (part): part is { mimeType: string; data: string } => part !== null
        )
        .map((inlineData) => ({ inlineData }));

      if (imageParts.length === 0) {
        res.status(400).json({
          error: 'Could not read the uploaded photo data.',
        });
        return;
      }

      const textPart = {
        text: `User Stated Skill: ${skill}\nUser City: ${city}\nNumber of Work Photos Attached: ${imageParts.length}\n\nPlease analyze the attached work photos and user details, and return a JSON object with skill_summary, style_description, target_customers, suggested_products (must contain EXACTLY 3 items, each with name, reason, description_urdu, description_english), and whatsapp_message_urdu.`,
      };

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [...imageParts, textPart],
        },
        config: {
          systemInstruction: BUSINESS_GUIDE_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: BUSINESS_GUIDE_SCHEMA,
        },
      });

      const rawText = response.text ?? '';
      const validated = parseAndValidateBusinessGuideResponse(rawText);

      res.json({ result: validated });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze skill and photos';
      console.error('Error in /api/analyze-skill:', message);
      res.status(502).json({
        error: message,
      });
    }
  });

  app.post('/api/first-week-plan', async (req, res) => {
    try {
      const body = req.body as FirstWeekPlanRequestPayload;
      const skill = typeof body?.skill === 'string' ? body.skill.trim() : '';
      const city = typeof body?.city === 'string' ? body.city.trim() : '';
      const products = Array.isArray(body?.products)
        ? body.products
            .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
            .slice(0, 3)
        : [];

      if (!skill || !city) {
        res.status(400).json({
          error: 'Please provide your skill and city to generate the first week plan.',
        });
        return;
      }

      const productListText =
        products.length > 0 ? products.join(', ') : 'handmade items';

      const promptText = `User Skill: ${skill}
User City: ${city}
Suggested Products: ${productListText}

Create a 7-day checklist (Day 1 to Day 7) of simple, practical actions she can take from home during her first week to start sharing her work with people she knows (for example: take a clear photo of each product in daylight, post on WhatsApp status, message 5 contacts, prepare a simple price list, arrange clean packaging, show samples to neighbors, follow up politely). Return a JSON object with a "days" array of EXACTLY 7 items, each having day (1 to 7), title_urdu, title_english, action_urdu, and action_english.`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: FIRST_WEEK_PLAN_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: FIRST_WEEK_PLAN_SCHEMA,
        },
      });

      const rawText = response.text ?? '';
      const validated = parseAndValidateFirstWeekPlanResponse(rawText);

      res.json({ result: validated });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to generate first week plan';
      console.error('Error in /api/first-week-plan:', message);
      res.status(502).json({
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hunar Saathi server running on http://localhost:${PORT}`);
  });
}

startServer();
