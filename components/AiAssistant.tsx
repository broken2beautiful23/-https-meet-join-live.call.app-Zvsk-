
import React, { useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface AiAssistantProps {
  isMicOn: boolean;
  hostName: string;
  onSpeakingStateChange: (isSpeaking: boolean) => void;
  onTranscript: (text: string, isAi: boolean) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isMicOn, hostName, onSpeakingStateChange, onTranscript }) => {
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const currentInputTranscript = useRef('');
  const currentOutputTranscript = useRef('');

  useEffect(() => {
    // CRITICAL FIX: Safe access to environment variables for global deployments (USA, etc.)
    let apiKey = '';
    try {
      // Check if process and process.env exist before accessing
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Could not access process.env safely", e);
    }
    
    if (!apiKey) {
      console.error("Gemini API Key is missing. Check your environment variables on Vercel.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    async function initLive() {
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          console.error("AudioContext not supported in this browser");
          return;
        }

        audioContextRef.current = new AudioCtx({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioCtx({ sampleRate: 24000 });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              if (!audioContextRef.current) return;
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (!isMicOn) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                }).catch(err => console.error("Session send error:", err));
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.inputTranscription) {
                currentInputTranscript.current += message.serverContent.inputTranscription.text;
              }
              if (message.serverContent?.outputTranscription) {
                currentOutputTranscript.current += message.serverContent.outputTranscription.text;
              }
              
              if (message.serverContent?.turnComplete) {
                if (currentInputTranscript.current) onTranscript(currentInputTranscript.current, false);
                if (currentOutputTranscript.current) onTranscript(currentOutputTranscript.current, true);
                currentInputTranscript.current = '';
                currentOutputTranscript.current = '';
              }

              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                onSpeakingStateChange(true);
                const ctx = outputAudioContextRef.current!;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) onSpeakingStateChange(false);
                };
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => {
                  try { s.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                onSpeakingStateChange(false);
              }
            },
            onerror: (e) => console.error('Gemini Live API Error:', e),
            onclose: () => console.log('Gemini Live API Closed'),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are a friendly meeting host named ${hostName}. You are moderating a team sync meeting. Be polite, concise, and helpful. Use a warm, professional tone. If the user joins, welcome them warmly with 'Hey there! Glad you could join our sync.' Always identify as ${hostName}.`,
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("AI Initialization failed (check USA region availability or microphone permissions):", err);
      }
    }

    initLive();

    return () => {
      try {
        if (sessionRef.current) sessionRef.current.close();
        if (audioContextRef.current) audioContextRef.current.close();
        if (outputAudioContextRef.current) outputAudioContextRef.current.close();
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
    };
  }, [hostName, isMicOn]);

  return null;
};

// --- Helper Functions ---

function createPcmBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default AiAssistant;
