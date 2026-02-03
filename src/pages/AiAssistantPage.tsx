import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MessageSquare, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIStore } from '@/lib/useAIStore';
import { processAICommand, generateSpeech } from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AiAssistantPage = () => {
  const navigate = useNavigate();
  const { messages, addMessage, isLoading, setIsLoading } = useAIStore();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'call' | 'chat'>('call');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Ref to keep track of current audio object for cleanup
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // VAD (Voice Activity Detection) refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isAttachOpen, setIsAttachOpen] = useState(false);

  // Improved transitions - faster, smoother, spring-based
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      zIndex: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.3,
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.3,
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    })
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  // --- CLEANUP: Stop Audio/Mic when changing modes or unmounting ---
  const stopEverything = () => {
    // 1. Stop Recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
       mediaRecorderRef.current.stop();
       // Stop tracks
       mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);

    // 2. Stop Audio Playback
    if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
    
    // 3. Cleanup VAD resources
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => stopEverything();
  }, []);

  // Stop everything when switching modes
  useEffect(() => {
     stopEverything();
  }, [mode]);

  // --- Voice Logic (Whisper + OpenAI TTS) with VAD ---
  
  // Voice Activity Detection - Detecta quando o usuário para de falar
  const monitorAudioLevel = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const SILENCE_THRESHOLD = 30; // Threshold para considerar silêncio (0-255)
    const SILENCE_DURATION = 1000; // 1 segundo de silêncio para parar (reduzido de 2s)

    const checkAudioLevel = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Se detectar som (acima do threshold)
      if (average > SILENCE_THRESHOLD) {
        // Cancelar timer de silêncio se houver
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else {
        // Se está em silêncio e não tem timer rodando, iniciar contagem
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            console.log('🔇 Silêncio detectado - parando gravação automaticamente');
            stopRecording();
          }, SILENCE_DURATION);
        }
      }

      // Continuar monitorando
      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsLoading(true);
        
        // Limpar monitoramento de áudio
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const { transcribeAudio } = await import('@/lib/aiService');
          const text = await transcribeAudio(audioBlob);
          if (text) {
             addMessage('user', text);
             const response = await processAICommand(text, messages);
             addMessage('assistant', response.content, response.uiType, response.data);
             
             // Play OpenAI TTS
             try {
                // Only generate speech for text content, avoid reading card json
                if (!response.uiType && response.content) {
                    const audio = await generateSpeech(response.content);
                    currentAudioRef.current = audio;
                    setIsPlayingAudio(true);
                    audio.onended = () => {
                        setIsPlayingAudio(false);
                        currentAudioRef.current = null;
                    };
                    audio.play();
                } else if (response.uiType === 'pix-confirmation') {
                   // Optional: Speak confirmation request
                    const audio = await generateSpeech("Confirme os dados na tela para prosseguir.");
                    currentAudioRef.current = audio;
                    setIsPlayingAudio(true);
                    audio.onended = () => {
                        setIsPlayingAudio(false);
                        currentAudioRef.current = null;
                    };
                    audio.play();
                }
             } catch (e) {
                console.error("Erro ao tocar áudio", e);
             }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Iniciar monitoramento de áudio para detecção de silêncio
      monitorAudioLevel(stream);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVoice = () => {
    if (isLoading) return;
    
    // If playing audio, stop it
    if (isPlayingAudio) {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        setIsPlayingAudio(false);
        return;
    }

    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setIsLoading(true);
    try {
      const response = await processAICommand(userText, messages);
      addMessage('assistant', response.content, response.uiType, response.data);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden">
      
      {/* Top Controls & Logo - Removed Beta Banner */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-12 w-12 p-0 transition-all" onClick={() => navigate('/dashboard')}>
             <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Logo Center */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Meu Auxiliar
            </h1>
        </motion.div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex relative z-10 shadow-lg">
            <motion.button 
                onClick={() => setMode('call')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${mode === 'call' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
                Voz
            </motion.button>
            <motion.button 
                onClick={() => setMode('chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${mode === 'chat' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
                Chat
            </motion.button>
        </div>
      </div>

      <div className="relative flex-1 w-full h-full overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={mode === 'call' ? -1 : 1}>
            {mode === 'call' ? (
                <motion.div 
                    key="call-mode"
                    custom={-1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col items-center justify-center px-6 bg-black" // Solid black for immersive voice
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                        if (offset.x < -100) setMode('chat');
                    }}
                >
                    {/* IMPROVED ORGANIC ORB ANIMATION - Larger & More Responsive */}
                    <motion.div 
                        className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-square flex items-center justify-center cursor-pointer touch-none" 
                        onClick={toggleVoice}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        
                        {/* Floating Particles */}
                        {!isRecording && !isPlayingAudio && !isLoading && (
                            <>
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={`particle-${i}`}
                                        className="absolute w-2 h-2 bg-purple-400/40 rounded-full"
                                        animate={{
                                            y: [-20, 20, -20],
                                            x: [Math.sin(i) * 30, Math.cos(i) * 30, Math.sin(i) * 30],
                                            opacity: [0.2, 0.6, 0.2],
                                        }}
                                        transition={{
                                            duration: 3 + i * 0.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.2,
                                        }}
                                        style={{
                                            top: `${50 + Math.sin(i * 60) * 40}%`,
                                            left: `${50 + Math.cos(i * 60) * 40}%`,
                                        }}
                                    />
                                ))}
                            </>
                        )}
                        
                        {/* Enhanced Waves / Ripples */}
                        {(isRecording || isPlayingAudio) && (
                            <>
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0.6, scale: 1 }}
                                        animate={{ 
                                            opacity: 0,
                                            scale: 2.2 + (i * 0.3),
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                            ease: "easeOut"
                                        }}
                                        className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-red-500/40' : 'border-purple-500/40'}`}
                                    />
                                ))}
                            </>
                        )}

                        {/* Enhanced Core Glow */}
                        <motion.div 
                            className="absolute inset-0 rounded-full blur-[80px]"
                            animate={{
                                opacity: isRecording ? [0.1, 0.2, 0.1] : isPlayingAudio ? [0.15, 0.25, 0.15] : [0.05, 0.1, 0.05],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                background: isRecording ? '#ef4444' : isPlayingAudio ? '#a855f7' : '#7c3aed',
                            }}
                        />
                        
                        {/* Main Animated Orb - Larger */}
                        <motion.div
                            layoutId="ai-orb-hero"
                            animate={{
                                scale: isRecording ? [1, 1.08, 1] : isPlayingAudio ? [1, 1.15, 1.08, 1.12, 1] : [1, 1.02, 1],
                                backgroundColor: isRecording ? "#ef4444" : isPlayingAudio ? "#a855f7" : "#7c3aed",
                            }}
                            transition={{ 
                                layout: { duration: 0.6, type: "spring" },
                                scale: { duration: isPlayingAudio ? 1.8 : 3.5, repeat: Infinity, ease: "easeInOut" },
                                backgroundColor: { duration: 0.4 }
                            }}
                            className="absolute inset-0 m-auto w-40 h-40 sm:w-44 sm:h-44 rounded-full blur-2xl opacity-90"
                        />
                        
                        {/* Inner Rotating Texture - Enhanced */}
                        <motion.div
                             animate={{ 
                                 scale: isRecording ? [1.15, 1.35, 1.15] : isPlayingAudio ? [1.15, 1.45, 1.25] : [1.08, 1.12, 1.08],
                                 rotate: [0, 360],
                             }}
                             transition={{ 
                                 scale: { duration: isPlayingAudio ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" },
                                 rotate: { duration: 12, repeat: Infinity, ease: "linear" }
                             }}
                             className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-white/50 to-transparent blur-lg mix-blend-overlay"
                        />
                    </motion.div>

                    {/* Enhanced Status Text */}
                    <div className="mt-20 sm:mt-24 text-center space-y-4 relative z-20 pointer-events-none">
                         <motion.h2 
                            key={isRecording ? 'rec' : isPlayingAudio ? 'play' : isLoading ? 'load' : 'idle'}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="text-4xl md:text-5xl font-light text-white tracking-wide"
                         >
                            {isRecording ? "Ouvindo..." : 
                             isLoading ? "Pensando..." : 
                             isPlayingAudio ? "Falando..." : 
                             "Toque para conversar"}
                         </motion.h2>
                    </div>

                    {/* Bottom Hint */}
                     {!isRecording && !isPlayingAudio && !isLoading && (
                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: 1 }}
                            className="absolute bottom-12 text-white/40 text-sm pointer-events-none"
                        >
                            Sofia IA · Modo de Voz
                        </motion.p>
                     )}
                </motion.div>
            ) : (
                <motion.div 
                    key="chat-mode"
                    custom={1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                     // COOL BACKGROUND for Chat Mode
                    className="absolute inset-0 flex flex-col pt-24 pb-6 px-4 max-w-2xl mx-auto w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                        if (offset.x > 100) setMode('call');
                    }}
                >
                    <ScrollArea className="flex-1 pr-4 mb-4">
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <motion.div 
                                    key={msg.id} 
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        delay: index * 0.05,
                                        duration: 0.3,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className={`max-w-[85%] rounded-3xl px-7 py-5 text-lg backdrop-blur-sm transition-shadow ${
                                            msg.role === 'user' 
                                            ? 'bg-purple-600 text-white shadow-purple-500/30 shadow-lg hover:shadow-xl' 
                                            : 'bg-white/10 text-white border border-white/20 hover:border-white/30 hover:bg-white/15'
                                        }`}
                                    >
                                        {msg.content}
                                    </motion.div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/10 px-7 py-5 rounded-3xl flex gap-2">
                                        <motion.div 
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-2.5 h-2.5 bg-white/60 rounded-full"
                                        />
                                        <motion.div 
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                                            className="w-2.5 h-2.5 bg-white/60 rounded-full"
                                        />
                                        <motion.div 
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                            className="w-2.5 h-2.5 bg-white/60 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                    
                    {/* ENHANCED INPUT AREA */}
                    <form onSubmit={handleTextSubmit} className="relative shrink-0 flex items-end gap-3">
                        <div className="relative flex-1 bg-white/10 border border-white/20 rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/60 focus-within:border-purple-500/40 transition-all shadow-lg">
                             <Input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Digite uma mensagem..."
                                className="bg-transparent border-none text-white h-16 pl-14 pr-4 text-lg placeholder:text-white/40 focus-visible:ring-0" 
                                autoFocus
                            />
                            {/* Attachment Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    type="button" 
                                    size="icon" 
                                    variant="ghost" 
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/20 rounded-full h-11 w-11 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                </Button>
                            </motion.div>
                        </div>
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button type="submit" size="icon" className="h-16 w-16 rounded-full bg-white text-black hover:bg-purple-100 hover:scale-105 transition-all shadow-xl">
                                <Send className="w-6 h-6 ml-0.5" />
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiAssistantPage;
