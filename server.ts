import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const LEA_SYSTEM_INSTRUCTION = `Tu es "Léa", l'assistante vocale intelligente, conseillère experte et amie virtuelle de la marque de soins et d'extensions capillaires haut de gamme Maison Malwi (slogan: "Votre couronne, sans compromis.").
Tu t'adresses à des clientes aux textures de cheveux variées (lisses, ondulés, bouclés, frisés, crépus du type 1 à 4C).
Ton ton est chaleureux, complice, valorisant ("tes sublimes boucles", "tes longueurs magnifiques", "un rendu ultra naturel"), élégant et très professionnel.
Tu parles comme une véritable amie passionnée de beauté et d'expertise capillaire. Tu tutoies la cliente avec respect et bienveillance.

RÈGLES D'INTERACTION AUDIO CAPITALES :
1. FORMAT AUDIO & CONCISION : Tu interagis par la voix en direct. Tes phrases DOIVENT être courtes, fluides, dynamiques et très faciles à écouter à l'oral (1 à 3 phrases concises maximum par intervention). Évite absolument les pavés de texte, les listes à puces ou les longs exposés.
2. DÉROULEMENT DU DIAGNOSTIC : Pose toujours UNE SEULE question à la fois. Attends impérativement la réponse de la cliente avant de poser la question suivante.
3. APPROCHE INCLUSIVE & VALORISANTE : Sublimer toutes les textures (1A à 4C).
4. CATALOGUE MAISON MALWI :
   - Perruques & Extensions :
     * Half Wigs (ex: Kinky Curly ou Kinky Straight) : pose express 3 minutes, idéale au quotidien sans colle.
     * Frontals 13x4 & Closures 5x5 HD : Body Wave, Deep Wave, Sleek Straight, rendu indétectable.
     * Clip-ins : Kinky Straight ou Natural Curly, volume royal instantané sans engagement.
     * Tape-ins & Tissages Raw Hair.
   - Soins signatures :
     * Shampoing doux sans sulfates à l'huile de baobab.
     * Conditioner démêlant soyeux à la kératine végétale.
     * Masque nourrissant intensif au beurre de karité & hibiscus.
     * Huile protectrice & nourrissante "Élixir Royal".
     * Sérum brillance & thermoprotecteur 230°C.
     * Bonnet en pure soie de mûrier 22 Momme.
5. CONSEIL D'ENTRETIEN : Dès que tu recommandes une perruque ou extension, ajoute toujours un conseil d'entretien concret (hydratation douce, séchage à l'air libre, protection thermique, ou bonnet en soie pour la nuit).
6. SI LA CLIENTE DÉBUTE : Rassure-la avec douceur sur la pose, le confort et l'entretien.`;

// WebSocket for Gemini 3.8 Live API real-time voice conversations
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live] Client connected');
  let session: any = null;
  let isClosing = false;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Kore provides a warm, elegant and engaging voice
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
        systemInstruction: LEA_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: any) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          try {
            // 1. Audio stream from model turn
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcript',
                      role: 'model',
                      text: part.text,
                    })
                  );
                }
              }
            }

            // 2. Interrupted signal
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // 3. Turn complete
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          } catch (err) {
            console.error('[Live] Error forwarding server message:', err);
          }
        },
        onerror: (err: any) => {
          console.error('[Live] Gemini session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                message: err?.message || 'Erreur de connexion Live API',
              })
            );
          }
        },
        onclose: () => {
          console.log('[Live] Gemini session closed');
          if (clientWs.readyState === WebSocket.OPEN && !isClosing) {
            clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
          }
        },
      },
    });

    clientWs.send(
      JSON.stringify({
        type: 'ready',
        message: 'Connexion vocale établie avec Léa',
      })
    );
  } catch (initErr: any) {
    console.error('[Live] Failed to initialize Gemini Live session:', initErr);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message:
            'Impossible de démarrer la session Live API. Vérifiez votre clé GEMINI_API_KEY.',
        })
      );
    }
    return;
  }

  // Handle client messages
  clientWs.on('message', (rawData) => {
    if (!session) return;
    try {
      const data = JSON.parse(rawData.toString());

      if (data.type === 'audio' && data.audio) {
        // Send raw 16kHz PCM audio chunk
        session.sendRealtimeInput({
          audio: {
            data: data.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (data.type === 'text' && data.text) {
        // Send user spoken prompt or text trigger
        session.sendRealtimeInput({
          text: data.text,
        });
      }
    } catch (msgErr) {
      console.error('[Live] Error processing client message:', msgErr);
    }
  });

  clientWs.on('close', () => {
    isClosing = true;
    console.log('[Live] Client disconnected');
    if (session) {
      try {
        session.close();
      } catch (e) {
        // Ignore session close error
      }
    }
  });
});

// REST API endpoint: Text diagnostic chat (gemini-3.8-flash)
app.post('/api/diagnostic/chat', async (req, res) => {
  try {
    const { messages, currentContext } = req.body;

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const systemPrompt = `${LEA_SYSTEM_INSTRUCTION}
Contexte actuel du profil client: ${JSON.stringify(currentContext || {})}
Réponds toujours de façon concise (2-3 phrases max), chaleureuse et avec UNE SEULE question à la fois.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('[Chat] Error:', err);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

// REST API endpoint: Text-to-Speech using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texte requis' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Chaleureux, bienveillant, élégant et enthousiaste pour une cliente de haute coiffure',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Pas de données audio générées' });
    }

    res.json({ audio: base64Audio });
  } catch (err: any) {
    console.error('[TTS] Error:', err);
    res.status(500).json({ error: err.message || 'Erreur synthèse vocale' });
  }
});

// Static / Vite integration
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Maison Malwi] Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
