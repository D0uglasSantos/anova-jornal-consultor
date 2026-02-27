import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

// --- API Client Initialization ---
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 1. Text Chat (Gemini 3 Pro for Complex / Flash for Speed) ---
export const sendMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  useThinking: boolean = false,
  imagePart?: { data: string; mimeType: string }
) => {
  const ai = getClient();
  
  // Model selection based on task complexity
  // 'gemini-3-pro-preview' is used for complex reasoning (Advisor persona)
  // 'gemini-2.5-flash' can be used for faster, simpler interactions
  const model = "gemini-3-pro-preview"; 

  const config: any = {
    systemInstruction: "Você é um assistente de IA especialista para consultores financeiros da Anova (WealthTech). Seu tom é profissional, empático e focado em ações. Você ajuda a analisar carteiras, sugerir mensagens para clientes e explicar cenários econômicos. Sempre considere o perfil de risco do cliente.",
  };

  if (useThinking) {
    // Thinking budget allows the model to reason before responding
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  } else {
    // Enable search grounding for general queries to get fresh market data
    config.tools = [{ googleSearch: {} }];
  }

  const chat = ai.chats.create({
    model: model,
    config: config,
    history: history.map(h => ({
      role: h.role,
      parts: h.parts.map(p => ({ text: p.text }))
    })),
  });

  const parts: any[] = [{ text: newMessage }];
  if (imagePart) {
    parts.unshift({ inlineData: imagePart });
  }

  const response = await chat.sendMessage({ message: parts });
  
  // Extract grounding metadata if available (URLs)
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const webSources = groundingChunks
    .map((chunk: any) => chunk.web?.uri)
    .filter((uri: any) => uri);

  return {
    text: response.text || "Sem resposta.",
    webSources: [...new Set(webSources)] // Unique URLs
  };
};

// --- 2. Text Analysis (Fast summarization) ---
export const analyzeTextFast = async (text: string) => {
  const ai = getClient();
  // Using gemini-2.5-flash for speed and reliability on basic text tasks
  // Passing 'contents' as a simple string avoids ContentUnion type errors
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Resuma este texto financeiro em 3 pontos chave para um consultor ler rápido: ${text}`,
  });
  return response.text;
};

// --- 3. Text-to-Speech (TTS) ---
export const speakText = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    return audioBuffer;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// --- 4. Live API (Real-time Audio) ---
export const connectLiveSession = async (
    onAudioData: (buffer: AudioBuffer) => void,
    onClose: () => void
) => {
    const ai = getClient();
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Setup stream
    let stream: MediaStream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        console.error("Mic permission denied", e);
        onClose();
        return;
    }

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "Você é o Copiloto da Anova. Um assistente de voz para consultores financeiros que estão em movimento ou analisando telas complexas. Seja conciso e direto.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
        },
        callbacks: {
            onopen: () => {
                console.log("Live Session Connected");
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                     const audioBuffer = await decodeAudioData(
                        decode(base64Audio),
                        outputAudioContext,
                        24000,
                        1
                    );
                    onAudioData(audioBuffer);
                }
            },
            onclose: () => {
                console.log("Live Session Closed");
                stream.getTracks().forEach(track => track.stop());
                inputAudioContext.close();
                outputAudioContext.close();
                onClose();
            },
            onerror: (err) => {
                console.error("Live Session Error", err);
                onClose();
            }
        }
    });

    return {
        disconnect: async () => {
            const session = await sessionPromise;
            session.close();
        }
    };
};

// --- Helpers ---

function createBlob(data: Float32Array): { data: string; mimeType: string } {
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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