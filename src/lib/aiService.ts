import { supabase } from './supabaseClient';
import { getSession } from './session';
import { addFinanceiro, addLembrete, getFinanceiroByMonth, getLembretesByMonth, getGastosPorCategoria } from './api';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

import { Message } from './useAIStore';

export const generateSpeech = async (text: string): Promise<HTMLAudioElement> => {
  if (!OPENAI_API_KEY) throw new Error("API Key ausente");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova"
      })
    });

    if (!response.ok) throw new Error("Erro no TTS");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return audio;
  } catch (error) {
    console.error("Erro TTS:", error);
    throw error;
  }
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "add_transaction",
      description: "Adicionar uma transação financeira (receita ou despesa)",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["receita", "despesa"], description: "Tipo da transação" },
          value: { type: "number", description: "Valor numérico da transação (ex: 50.00)" },
          description: { type: "string", description: "Descrição do que foi comprado ou recebido" },
          category: { type: "string", description: "Categoria (Alimentação, Transporte, Lazer, Saúde, Outros)" }
        },
        required: ["type", "value", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_reminder",
      description: "Adicionar um lembrete ou compromisso na agenda",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do compromisso" },
          datetime: { type: "string", description: "Data e hora ISO 8601 (ex: 2024-02-20T14:00:00). Se não especificado ano, usar ano atual." }
        },
        required: ["title", "datetime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_monthly_finance",
      description: "Consultar extrato financeiro (receitas e despesas) de um mês específico. Use para responder perguntas sobre gastos, saldo, ou histórico.",
      parameters: {
        type: "object",
        properties: {
          month: { type: "number", description: "Mês (1-12). Se não informado, usar mês atual." },
          year: { type: "number", description: "Ano (ex: 2024). Se não informado, usar ano atual." }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_monthly_reminders",
      description: "Consultar agenda e lembretes de um mês/ano.",
      parameters: {
        type: "object",
        properties: {
          month: { type: "number", description: "Mês (1-12)." },
          year: { type: "number", description: "Ano (ex: 2024)." }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_category_summary",
      description: "Ver quanto foi gasto por categoria (resumo) em um mês.",
      parameters: {
        type: "object",
        properties: {
          month: { type: "number", description: "Mês (1-12)." },
          year: { type: "number", description: "Ano." }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_pix_authorization",
      description: "SOLICITAR a autorização do usuário para fazer um PIX. Use APÓS o usuário confirmar verbalmente que quer pagar. Esta função abrirá a tela de senha para o usuário.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Chave PIX (CPF, Email, Telefone ou Aleatória)" },
          value: { type: "number", description: "Valor da transferência em Reais" },
          description: { type: "string", description: "Descrição ou motivo da transferência" },
          bank: { type: "string", description: "Nome do banco ou instituição de destino (opcional)" }
        },
        required: ["key", "value"]
      }
    }
  }
];

// Define response type
type AIResponse = {
  content: string;
  uiType?: 'text' | 'pix-confirmation';
  data?: any;
};

export const processAICommand = async (userText: string, history: Message[]): Promise<AIResponse> => {
  if (!OPENAI_API_KEY) {
    return { content: "Preciso da chave de API da OpenAI configurada no sistema (VITE_OPENAI_API_KEY) para funcionar com inteligência máxima." };
  }

  const sessionId = getSession()?.sessionId;
  if (!sessionId) return { content: "Você precisa estar logado." };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const APP_CONTEXT = `
Você é a Sofia, a inteligência artificial oficial do sistema "Meu Auxiliar".
Sua missão é ajudar o usuário a gerenciar seu negócio e tirar dúvidas sobre o sistema.

IMPORTANTE: SEMPRE responda em PORTUGUÊS BRASILEIRO. Nunca responda em inglês ou outro idioma.

SOBRE O MEU AUXILIAR:
É uma plataforma completa de gestão para autônomos e pequenos empreendedores.
Funcionalidades principais:
1. 💰 FINANCEIRO: Registrar receitas, despesas, ver saldos.
2. 📅 AGENDA: Marcar compromissos e lembretes.
3. 📊 DASHBOARD: Visão geral da saúde financeira.

ACESS A DADOS:
Você AGORA TEM ACESSO aos dados do usuário através das ferramentas (tools). 
- Se o usuário perguntar "quanto gastei esse mês?", CHAME a ferramenta 'get_monthly_finance'.
- Se perguntar "tenho compromissos?", CHAME 'get_monthly_reminders'.
- Para fazer PIX: Se o usuário disser "Faz um pix de X para Y", NÃO chame a tool imediatamente. Pergunte: "Confirma o PIX de R$ X para a chave Y?". Só chame a tool 'request_pix_authorization' APÓS o usuário confirmar.
- NÃO invente dados. Se precisar de dados, use as tools.

ESTILO DE RESPOSTA:
- Seja clara, objetiva e amigável
- Use emojis quando apropriado para deixar a conversa mais leve
- Responda sempre em português brasileiro

Hoje é ${now.toLocaleDateString('pt-BR')} (Mês ${currentMonth}/${currentYear}).
`;

    const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: APP_CONTEXT },
          ...conversationHistory,
          { role: "user", content: userText }
        ],
        tools: TOOLS,
        tool_choice: "auto"
      })
    });

    const initialData = await initialResponse.json();
    
    if (!initialResponse.ok) throw new Error(initialData.error?.message || "Erro desconhecido na API");

    const message = initialData.choices?.[0]?.message;
    if (!message) throw new Error("Sem resposta da IA");

    // Check for Tool Calls
    if (message.tool_calls) {
      const toolOutputs: any[] = [];
      let pendingPixData = null;

      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        
        let output;
        
        if (toolCall.function.name === "add_transaction") {
          await addFinanceiro({
            sessionId,
            type: args.type,
            value: args.value,
            category: args.category || 'Outros',
            description: args.description,
            dateIso: new Date().toISOString()
          });
          output = `Sucesso: ${args.type} de R$ ${args.value} registrada.`;
        } 
        else if (toolCall.function.name === "add_reminder") {
            await addLembrete({
              sessionId,
              title: args.title,
              dateIso: args.datetime,
              antecedencia: null
            });
            output = `Sucesso: Lembrete "${args.title}" agendado.`;
        }
        else if (toolCall.function.name === "get_monthly_finance") {
            const m = args.month || currentMonth;
            const y = args.year || currentYear;
            const data = await getFinanceiroByMonth(sessionId, y, m);
            
            // Calcular totais com segurança (garantir que sempre seja número)
            const totalEntrada = data
              .filter(d => d.tipo === 'entrada')
              .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
              
            const totalSaida = data
              .filter(d => d.tipo === 'saida')
              .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
            
            const saldo = totalEntrada - totalSaida;
            
            output = JSON.stringify({
                resumo: `Mês ${m}/${y}: Entradas R$ ${totalEntrada.toFixed(2)}, Saídas R$ ${totalSaida.toFixed(2)}, Saldo R$ ${saldo.toFixed(2)}`,
                qtd_transacoes: data.length,
                ultimas_transacoes: data.slice(0, 10).map(t => ({
                  tipo: t.tipo,
                  valor: t.valor,
                  categoria: t.categoria,
                  descricao: t.descricao,
                  data: t.data_transacao
                }))
            });
        }
        else if (toolCall.function.name === "get_monthly_reminders") {
            const m = args.month || currentMonth;
            const y = args.year || currentYear;
            const data = await getLembretesByMonth(sessionId, y, m);
            output = JSON.stringify(data.length > 0 ? data : "Nenhum compromisso encontrado.");
        }
        else if (toolCall.function.name === "get_category_summary") {
            const m = args.month || currentMonth;
            const y = args.year || currentYear;
            const data = await getGastosPorCategoria(sessionId, y, m);
            output = JSON.stringify(data);
        }
        else if (toolCall.function.name === "request_pix_authorization") {
            const { key, value, description, bank } = args;
            pendingPixData = { key, value, description, bank };
            output = `Iniciando interface de pagamento PIX para ${key}...`;
        }

        toolOutputs.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: output || "Erro na execução"
        });
      }

      // Se for PIX, retorna imediatamente o card para o usuário confirmar
      if (pendingPixData) {
        return {
          content: "Por favor, confirme os dados da transferência e insira sua senha de segurança:",
          uiType: 'pix-confirmation',
          data: pendingPixData
        };
      }

      // Send tool outputs back to OpenAI for final response
      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: APP_CONTEXT },
                ...conversationHistory,
                { role: "user", content: userText },
                message, // The tool calls assistant message
                ...toolOutputs
            ]
        })
      });

      const secondData = await secondResponse.json();
      return { content: secondData.choices?.[0]?.message?.content || "Tarefa concluída." };
    }

    return { content: message.content || "Não entendi, pode repetir?" };

  } catch (error: any) {
    console.error("Erro completo:", error);
    return { content: `Erro: ${error.message || "Falha na conexão"}` };
  }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error("API Key ausente");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "pt");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Erro na transcrição");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Erro Whisper:", error);
    throw error;
  }
};
