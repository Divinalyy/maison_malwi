import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  RefreshCw,
  Send,
  Radio,
  CheckCircle2,
  Heart,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { pcmToBase64, LiveAudioPlayer } from '../utils/audio';
import { CATALOG, Product } from '../data/catalog';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

interface VoiceSessionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const VoiceSession: React.FC<VoiceSessionProps> = ({
  onSelectProduct,
  onAddToCart,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Coucou ! Je suis Léa, ta conseillère beauté Maison Malwi. Appuie sur le micro ou dis-moi : quelle est la texture naturelle de tes cheveux au quotidien ? Lisses, bouclés, frisés ou crépus ?",
      timestamp: 'À l’instant',
      isAudio: true,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(
    CATALOG[0] // Default preview Kinky Curly Half Wig
  );
  const [selectedTexture, setSelectedTexture] = useState<string>('4C');
  const [diagnosticGoal, setDiagnosticGoal] = useState<string>('Pose rapide & naturelle');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize AudioPlayer
  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer();
    audioPlayerRef.current.onPlayStateChange = (isPlaying) => {
      setIsModelSpeaking(isPlaying);
    };

    return () => {
      audioPlayerRef.current?.close();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Visualizer Animation
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Determine active intensity
      const active = isModelSpeaking || isUserSpeaking;
      const amplitude = active ? 24 : 4;
      const frequency = active ? 0.05 : 0.02;

      phase += active ? 0.08 : 0.02;

      // Draw flowing golden-crimson wave (representing silk and natural hair flow)
      const gradients = [
        { color: 'rgba(179, 25, 43, 0.85)', offset: 0, width: 2.5 }, // Crimson Maison Malwi
        { color: 'rgba(212, 175, 55, 0.75)', offset: Math.PI / 3, width: 2 }, // Gold
        { color: 'rgba(255, 255, 255, 0.6)', offset: Math.PI / 1.5, width: 1.5 }, // White
      ];

      gradients.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.width;

        for (let x = 0; x < width; x += 3) {
          const y =
            centerY +
            Math.sin(x * frequency + phase + wave.offset) *
              amplitude *
              Math.sin((x / width) * Math.PI); // Pinched at borders
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isModelSpeaking, isUserSpeaking]);

  // Connect to Gemini 3.8 Live API
  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // 1. Setup Audio Input
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      audioStreamRef.current = stream;

      // 2. Setup WebSocket connection to server.ts
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Live WS] Connected to server');
        setIsConnected(true);
        setIsConnecting(false);

        // Send initial greeting trigger if needed
        ws.send(
          JSON.stringify({
            type: 'text',
            text: 'Bonjour Léa, je souhaite faire un diagnostic capillaire pour choisir ma perruque ou mes extensions chez Maison Malwi.',
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            audioPlayerRef.current?.playChunk(data.audio);
          } else if (data.type === 'interrupted') {
            audioPlayerRef.current?.interrupt();
          } else if (data.type === 'transcript') {
            handleIncomingTranscript(data.text, data.role || 'model');
          } else if (data.type === 'error') {
            setConnectionError(data.message);
          }
        } catch (e) {
          console.error('[Live WS] Error handling incoming data:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live WS] Socket error:', err);
        setConnectionError('Impossible de joindre le service audio Live API.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('[Live WS] Closed');
        setIsConnected(false);
        setIsConnecting(false);
        stopAudioCapture();
      };

      // 3. Setup Mic Stream Processing
      const source = inputCtx.createMediaStreamSource(stream);
      // Buffer size 2048 (~128ms @ 16kHz)
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Check if user is actually speaking (energy threshold)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setIsUserSpeaking(rms > 0.015);

        const base64Audio = pcmToBase64(inputData);
        ws.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          })
        );
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('[Live] Setup failed:', err);
      setConnectionError(
        err.name === 'NotAllowedError'
          ? 'Autorisation du microphone refusée. Veuillez autoriser l’accès au micro pour dialoguer avec Léa.'
          : err.message || 'Erreur lors du démarrage du micro.'
      );
      setIsConnecting(false);
      stopAudioCapture();
    }
  };

  const stopAudioCapture = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    setIsUserSpeaking(false);
  };

  const endLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopAudioCapture();
    audioPlayerRef.current?.interrupt();
    setIsConnected(false);
  };

  // Helper to append transcript and dynamically detect product mentions
  const handleIncomingTranscript = (text: string, role: 'model' | 'user') => {
    if (!text || text.trim().length === 0) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        role,
        text,
        timestamp: 'En direct',
        isAudio: true,
      },
    ]);

    // Intelligent keyword detection to update recommended product in real-time
    const lower = text.toLowerCase();
    if (lower.includes('half wig') || lower.includes('kinky curly')) {
      const p = CATALOG.find((c) => c.id === 'half-wig-kinky-curly');
      if (p) setRecommendedProduct(p);
      setSelectedTexture('4C');
      setDiagnosticGoal('Pose express 3 min');
    } else if (lower.includes('body wave') || lower.includes('frontal')) {
      const p = CATALOG.find((c) => c.id === 'lace-frontal-body-wave');
      if (p) setRecommendedProduct(p);
      setSelectedTexture('Ondulé / Lisse');
      setDiagnosticGoal('Glamour Hollywood');
    } else if (lower.includes('clip-in') || lower.includes('kinky straight')) {
      const p = CATALOG.find((c) => c.id === 'clipins-kinky-straight');
      if (p) setRecommendedProduct(p);
      setSelectedTexture('4A-4C étiré');
      setDiagnosticGoal('Volume sans chaleur');
    } else if (lower.includes('huile') || lower.includes('élixir')) {
      const p = CATALOG.find((c) => c.id === 'elixir-royal-oil');
      if (p) setRecommendedProduct(p);
    }
  };

  // Send quick option prompt or manual text to Léa
  const sendPromptToLea = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Add user message to UI
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: 'À l’instant',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // If Live API is connected, forward text directly to live session
    if (isConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: prompt,
        })
      );
      return;
    }

    // Otherwise, use REST fallback endpoint with TTS playback!
    try {
      const res = await fetch('/api/diagnostic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentContext: {
            selectedTexture,
            diagnosticGoal,
          },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const replyMsg: Message = {
          id: `mod-${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: 'À l’instant',
          isAudio: true,
        };
        setMessages((prev) => [...prev, replyMsg]);
        handleIncomingTranscript(data.reply, 'model');

        // Play TTS audio of Léa's answer
        playTtsAudio(data.reply);
      }
    } catch (err) {
      console.error('[Chat Fallback] Error:', err);
    }
  };

  const playTtsAudio = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audio) {
        // Base64 WAV from gemini-3.8-flash-lite-tts
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        setIsModelSpeaking(true);
        audio.onended = () => setIsModelSpeaking(false);
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.error('[TTS] Playback error:', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto items-start">
      {/* LEFT & CENTER PANEL: Voice Hub & Live Conversation */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        {/* Voice Call Console */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141418] to-[#0e0e11] p-6 shadow-2xl backdrop-blur-md">
          {/* Subtle glowing accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#b3192b]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />

          {/* Header Status Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/60 overflow-hidden flex items-center justify-center shadow-inner">
                  <span className="font-serif-luxury text-xl text-white font-medium">L</span>
                </div>
                {/* Active pulse dot */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#141418] ${
                    isConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : isConnecting
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-neutral-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-lg text-white font-semibold tracking-wide">
                    Léa — Experte Maison Malwi
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#b3192b]/40 bg-[#b3192b]/10 text-[#e63946] font-medium tracking-wider uppercase">
                    Live API 3.8
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {isConnected
                    ? isModelSpeaking
                      ? 'Léa vous parle en temps réel...'
                      : isUserSpeaking
                      ? 'Je vous écoute...'
                      : 'Connexion vocale active & fluide'
                    : isConnecting
                    ? 'Établissement du canal vocal...'
                    : 'Prête pour votre diagnostic personnalisé'}
                </p>
              </div>
            </div>

            {/* Quick Live Mode Indicator */}
            <div className="flex items-center gap-2">
              {isConnected && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>En Direct</span>
                </div>
              )}
            </div>
          </div>

          {/* Audio Waveform Canvas */}
          <div className="relative my-4 h-24 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center overflow-hidden">
            <canvas
              ref={visualizerCanvasRef}
              width={600}
              height={96}
              className="w-full h-full"
            />

            {/* Overlay hint */}
            {!isConnected && !isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <p className="text-xs text-neutral-300 font-light flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  Activez le micro pour vivre une consultation vocale interactive avec Léa
                </p>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {!isConnected ? (
              <button
                onClick={startLiveSession}
                disabled={isConnecting}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white font-medium text-sm transition-all shadow-[0_4px_20px_rgba(179,25,43,0.35)] cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connexion à Léa...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Démarrer le diagnostic vocal en direct</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? 'Micro coupé' : 'Micro actif'}</span>
                </button>

                <button
                  onClick={() => audioPlayerRef.current?.interrupt()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-sm transition-colors cursor-pointer"
                  title="Interrompre la voix en cours"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Interrompre</span>
                </button>

                <button
                  onClick={endLiveSession}
                  className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60 text-sm font-medium transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Terminer l'appel</span>
                </button>
              </div>
            )}
          </div>

          {/* Connection Error Notification */}
          {connectionError && (
            <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span>{connectionError}</span>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Vous pouvez aussi poser vos questions par écrit ci-dessous, Léa vous répondra avec la même expertise et synthèse vocale.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Box */}
        <div className="rounded-2xl border border-white/10 bg-[#121216]/90 p-5 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Transcription en direct & Conseils de Léa
            </span>
            <span className="text-xs text-neutral-500">
              {messages.length} échanges
            </span>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-neutral-400">
                    {m.role === 'user' ? 'Vous' : 'Léa (Maison Malwi)'}
                  </span>
                  <span className="text-[10px] text-neutral-600">
                    {m.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#b3192b]/25 border border-[#b3192b]/40 text-neutral-100 rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none font-light'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Vocal Suggestion Chips */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="text-neutral-500 text-[11px] shrink-0">Suggestions :</span>
              {[
                'Mes cheveux sont crépus type 4C',
                'Je cherche un truc facile pour tous les jours',
                'Comment poser une Half Wig en 3 min ?',
                'Quels soins pour entretenir les boucles ?',
                'Je veux une perruque lisse indétectable',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendPromptToLea(chip)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendPromptToLea(inputText);
              }}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez ou répondez à Léa..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#b3192b]/70"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#b3192b] border border-white/10 text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Diagnostic Progress & Dynamic Product Card */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Step-by-Step Diagnostic Monitor */}
        <div className="rounded-2xl border border-white/10 bg-[#121216]/90 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <h4 className="font-serif-luxury text-base text-white tracking-wide">
                Votre Diagnostic Personnalisé
              </h4>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Sur-mesure
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-wider mb-1">
                Texture Détectée
              </span>
              <div className="flex items-center gap-1.5 font-medium text-white text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{selectedTexture}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-wider mb-1">
                Objectif Beauté
              </span>
              <div className="flex items-center gap-1.5 font-medium text-white text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">{diagnosticGoal}</span>
              </div>
            </div>
          </div>

          {/* Interactive Texture Selector chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400">
              Ajuster manuellement votre texture si besoin :
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Type 1-2', sub: 'Lisse/Ondulé' },
                { label: 'Type 3A-3C', sub: 'Bouclé' },
                { label: 'Type 4A-4B', sub: 'Frisé' },
                { label: 'Type 4C', sub: 'Crépu' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedTexture(item.label);
                    sendPromptToLea(
                      `Mes cheveux sont de texture ${item.label} (${item.sub}). Quelle perruque ou extension me conseilles-tu ?`
                    );
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedTexture.includes(item.label)
                      ? 'bg-[#b3192b]/20 border-[#b3192b] text-white'
                      : 'bg-black/30 border-white/5 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[9px] text-neutral-400">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Highlighted Recommended Product Card */}
        {recommendedProduct && (
          <div className="group rounded-2xl border border-white/10 bg-[#121216] overflow-hidden shadow-2xl transition-all hover:border-[#b3192b]/50">
            {/* Image with badge */}
            <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
              <img
                src={recommendedProduct.image}
                alt={recommendedProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Badge */}
              {recommendedProduct.badge && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#b3192b]/90 backdrop-blur-md text-white text-xs font-serif-luxury tracking-wider shadow-lg">
                  {recommendedProduct.badge}
                </div>
              )}

              {/* Installation Time Pill */}
              {recommendedProduct.installationTime && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#d4af37] text-[11px] font-medium">
                  {recommendedProduct.installationTime}
                </div>
              )}

              {/* Title & Price floating at bottom of image */}
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[11px] uppercase tracking-widest text-[#d4af37] font-medium block">
                  Recommandation Léa
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-white font-medium leading-snug">
                  {recommendedProduct.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-semibold text-white">
                    {recommendedProduct.price} €
                  </span>
                  {recommendedProduct.length && (
                    <span className="text-xs text-neutral-300">
                      • {recommendedProduct.length}
                    </span>
                  )}
                  {recommendedProduct.density && (
                    <span className="text-xs text-neutral-400">
                      • {recommendedProduct.density}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content & Care Advice */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {recommendedProduct.description}
              </p>

              {/* Key Benefits */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Les Atouts Maison Malwi :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {recommendedProduct.keyBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-neutral-300 flex items-start gap-1.5"
                    >
                      <span className="text-[#b3192b] font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Léa's Care Advice */}
              <div className="p-3 rounded-xl bg-[#b3192b]/10 border border-[#b3192b]/30">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#e63946] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Le Conseil d’Entretien de Léa</span>
                </div>
                <p className="text-[11px] text-neutral-200 leading-relaxed">
                  {recommendedProduct.careAdvice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectProduct(recommendedProduct)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  Détails & Rituels de Pose
                </button>
                <button
                  onClick={() => onAddToCart(recommendedProduct)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b3192b] to-[#800f1c] hover:from-[#c92a3e] hover:to-[#911222] text-white text-xs font-medium transition-all shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ajouter au panier</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
