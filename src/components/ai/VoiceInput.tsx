import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIStore } from '@/lib/useAIStore';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isLoading?: boolean;
}

export const VoiceInput = ({ onTranscript, isLoading }: VoiceInputProps) => {
  const { isListening, setIsListening } = useAIStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice Activity Detection (VAD) - Detecta quando o usuário para de falar
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
    const SILENCE_DURATION = 2000; // 2 segundos de silêncio para parar automaticamente

    const checkAudioLevel = () => {
      if (!isListening) return;

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
            console.log('Silêncio detectado - parando gravação automaticamente');
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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        
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
            onTranscript(text);
            toast.success("Áudio transcrito com sucesso!");
          }
        } catch (error) {
          console.error(error);
          toast.error("Erro ao entender áudio. Tente novamente.");
        } finally {
          setIsProcessing(false);
          // Parar todas as faixas de áudio
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      
      // Iniciar monitoramento de áudio para detecção de silêncio
      monitorAudioLevel(stream);
      
      toast.info("🎤 Escutando... Fale agora! (Para automaticamente ao detectar silêncio)");
    } catch (e) {
      console.error(e);
      toast.error("❌ Permissão de microfone negada.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isLoading || isProcessing) return;

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Button
      variant={isListening ? "destructive" : "secondary"}
      size="icon"
      className={`rounded-full shadow-lg transition-all duration-300 ${isListening ? 'scale-110 animate-pulse ring-4 ring-red-500/20' : ''}`}
      onClick={toggleListening}
      disabled={isLoading || isProcessing}
    >
      {(isLoading || isProcessing) ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};
