import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  uiType?: 'text' | 'pix-confirmation';
  data?: any; // Para guardar dados do PIX (chave, valor, bank)
};

type AIStore = {
  isOpen: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string, uiType?: 'text' | 'pix-confirmation', data?: any) => void;
  clearMessages: () => void;
  
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const useAIStore = create<AIStore>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou sua assistente virtual. Posso ajudar a agendar compromissos, verificar sua agenda ou tirar dúvidas. Como posso ajudar hoje?',
      timestamp: Date.now(),
    }
  ],
  addMessage: (role, content, uiType, data) => set((state) => ({ 
    messages: [...state.messages, { 
      id: String(Date.now()), 
      role, 
      content, 
      timestamp: Date.now(),
      uiType,
      data
    }] 
  })),
  clearMessages: () => set({ messages: [] }),
  
  isListening: false,
  setIsListening: (isListening) => set({ isListening }),
  
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
