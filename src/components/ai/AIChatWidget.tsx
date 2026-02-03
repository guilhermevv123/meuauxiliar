import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIStore } from '@/lib/useAIStore';
import { VoiceInput } from './VoiceInput';
import { processAICommand } from '@/lib/aiService';
import { PixConfirmationCard } from './PixConfirmationCard';

import { useLocation } from 'react-router-dom';

export const AIChatWidget = () => {
  const { isOpen, toggleOpen, messages, addMessage, isLoading, setIsLoading } = useAIStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // SECURITY & UX: Only show Sofia IA widget on Dashboard
  if (location.pathname !== '/dashboard') return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !input) return;

    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setIsLoading(true);

    try {
      // Pass messages history for context
      const response = await processAICommand(userText, messages);
      addMessage('assistant', response.content, response.uiType, response.data);
    } catch (error) {
      addMessage('assistant', 'Desculpe, tive um problema ao processar seu pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    // Optional: Auto-submit voice commands
    // handleSubmit(); 
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
      >
        <Sparkles className="h-6 w-6 text-white animate-pulse" />
        <span className="absolute -top-10 right-0 bg-white text-violet-600 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm font-bold">
          Sofia IA
        </span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl border-violet-200 overflow-hidden flex flex-col bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/95">
        <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-6 w-6" />
              <CardTitle className="text-lg">Sofia IA 🧠</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleOpen} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 overflow-hidden relative">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-zinc-900/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.uiType === 'pix-confirmation' ? (
                    <div className="max-w-[85%]">
                      <PixConfirmationCard 
                        data={msg.data} 
                        onSuccess={() => {
                          // Opcional: Atualizar algo ou apenas deixar o card mostrar sucesso
                        }} 
                      />
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                      <span className="text-[10px] opacity-50 block text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-zinc-950 border-t flex items-center gap-2 shrink-0">
            <VoiceInput onTranscript={handleVoiceTranscript} isLoading={isLoading} />
            
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite ou fale..."
                className="rounded-full bg-slate-100 dark:bg-zinc-900 border-0 focus-visible:ring-1 focus-visible:ring-violet-500"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full bg-violet-600 hover:bg-violet-700 shrink-0" 
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
