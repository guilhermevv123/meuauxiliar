import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Plus, Pencil, Trash2, MessageCircle, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { AgendaDialog } from "../AgendaDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLembretesByMonth, getLembretesSemData, cleanupOldLembretesSemData, cleanupLembretesSemDataRpc, toggleLembreteStatus, updateLembretesOrdem } from "@/lib/api";
import { getSession } from "@/lib/session";
import { addLembrete, updateLembrete, deleteLembrete, addLembreteSemData, updateLembreteSemData } from "@/lib/api";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { createCalendarEvent } from "@/lib/googleCalendar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Appointment = { id: string; title: string; date: string; time: string; location?: string; type: string; value: number };

const getTypeColor = (type: string) => {
  switch (type) {
    case "work": return "bg-blue-500/20 text-blue-500";
    case "payment": return "bg-red-500/20 text-red-500";
    case "health": return "bg-green-500/20 text-green-500";
    default: return "bg-gray-500/20 text-gray-500";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "work": return "Trabalho";
    case "payment": return "Pagamento";
    case "health": return "Saúde";
    default: return "Outro";
  }
};

// Sortable Lembrete Item Component
const SortableLembreteItem = ({ lembrete, onToggleStatus, onEdit, onDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lembrete.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const status = lembrete.status || 'nao_feito';
  const isFeito = status === 'feito';

  // Determine background color based on status
  const bgClass = isFeito 
    ? 'from-green-50/80 to-green-100/30 dark:from-green-950/30 dark:to-green-900/10 border-l-green-500'
    : 'from-red-50/80 to-red-100/30 dark:from-red-950/30 dark:to-red-900/10 border-l-red-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border-l-4 bg-gradient-to-r ${bgClass} border border-border hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Drag Handle */}
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          
          {/* Content - click to toggle status */}
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onToggleStatus(lembrete.id, status)}
          >
            <h3 className={`font-semibold text-sm ${isFeito ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {lembrete.descricao}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Criado em {new Date(lembrete.criado_em).toLocaleDateString("pt-BR")}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isFeito ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'}`}>
                {isFeito ? '✓ Feito' : '✗ Não feito'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onEdit(lembrete); }} 
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onDelete(lembrete.id); }} 
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AgendaTab = () => {
  const now = new Date();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({ from: now, to: now });
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const sessionId = getSession()?.sessionId ?? "";
  const queryClient = useQueryClient();
  const { data: lembretes = [] } = useQuery({
    queryKey: ["lembretes", sessionId, year, month],
    queryFn: () => getLembretesByMonth(sessionId, year, month),
    enabled: !!sessionId,
  });
  const { data: lembretesSemData = [], isLoading: loadingLembretes, error: errorLembretes } = useQuery({
    queryKey: ["lembretes_sem_data", sessionId],
    queryFn: () => getLembretesSemData(sessionId),
    enabled: !!sessionId,
  });

  // Local state for lembretes sem data (for drag-and-drop)
  const [localLembretes, setLocalLembretes] = useState<any[]>([]);
  
  // Sort lembretes: not done first (by ordem), then done (by ordem)
  const sortLembretes = (lembretes: any[]) => {
    const naoFeitos = lembretes.filter(l => (l.status || 'nao_feito') === 'nao_feito').sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const feitos = lembretes.filter(l => (l.status || 'nao_feito') === 'feito').sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    return [...naoFeitos, ...feitos];
  };
  
  useEffect(() => {
    setLocalLembretes(sortLembretes(lembretesSemData));
  }, [lembretesSemData]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (sessionId) {
      // tenta limpeza via RPC global; se não existir a função, faz fallback por sessão
      cleanupLembretesSemDataRpc()
        .catch(async (e) => {
          if (!String(e?.message).includes('Could not find the function')) return;
          await cleanupOldLembretesSemData(sessionId);
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: ["lembretes_sem_data", sessionId] });
        });
    }
  }, [sessionId]);



  const initialAppointments: Appointment[] = useMemo(() => {
    return (lembretes || []).map(l => {
      const d = new Date(l.data_lembrete);
      const dd = d.toLocaleDateString("pt-BR");
      const hh = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return { id: l.id, title: l.descricao || "Compromisso", date: dd, time: hh, location: "-", type: "work", value: 0 };
    });
  }, [lembretes]);

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  
  // Estados para lembretes sem data
  const [lembreteDialogOpen, setLembreteDialogOpen] = useState(false);
  const [editingLembrete, setEditingLembrete] = useState<{ id: string; descricao: string } | undefined>();
  const [deleteLembreteDialogOpen, setDeleteLembreteDialogOpen] = useState(false);
  const [lembreteToDelete, setLembreteToDelete] = useState<string | null>(null);

  const appointmentsInRange = useMemo(() => {
    if (!selectedRange?.from && !selectedRange?.to) return [];
    const from = selectedRange?.from ?? selectedRange?.to!;
    const to = selectedRange?.to ?? selectedRange?.from!;
    const fromTime = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0).getTime();
    const toTime = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime();
    const parse = (ddmmyyyy: string, hhmm: string) => {
      const [dd, mm, yyyy] = ddmmyyyy.split('/');
      const [hh, mi] = (hhmm || "00:00").split(':');
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi)).getTime();
    };
    return appointments
      .filter(a => {
        const t = parse(a.date, a.time);
        return t >= fromTime && t <= toTime;
      })
      .sort((a, b) => {
        const ta = parse(a.date, a.time);
        const tb = parse(b.date, b.time);
        return ta - tb;
      });
  }, [appointments, selectedRange]);

  const handleSave = async (appointment: any) => {
    // compose ISO datetime from dd/MM/yyyy and time HH:mm
    const [dd, mm, yyyy] = appointment.date.split('/');
    const time = appointment.time || "00:00";
    const startTimeIso = new Date(`${yyyy}-${mm}-${dd}T${time}:00`).toISOString();
    
    // Calculate end time (default to 1 hour later)
    const endDate = new Date(`${yyyy}-${mm}-${dd}T${time}:00`);
    endDate.setHours(endDate.getHours() + 1);
    const endTimeIso = endDate.toISOString();

    try {
      if (appointment.id && appointments.some(a => a.id === appointment.id)) {
        await updateLembrete(appointment.id, { title: appointment.title, dateIso: startTimeIso, antecedencia: null });
        setAppointments(appointments.map(a => a.id === appointment.id ? appointment : a));
        toast.success("Compromisso atualizado");
        queryClient.invalidateQueries({ queryKey: ["lembretes", sessionId, year, month] });
      } else {
        await addLembrete({ sessionId, title: appointment.title, dateIso: startTimeIso, antecedencia: null });
        setAppointments([...appointments, { ...appointment, id: String(Date.now()) }]);
        toast.success("Compromisso criado");
        
        // Try to sync to Google Calendar
        try {
          await createCalendarEvent({
            title: appointment.title,
            description: `Tipo: ${getTypeLabel(appointment.type)}`,
            startTime: startTimeIso,
            endTime: endTimeIso,
            location: appointment.location
          });
          toast.success("Sincronizado com Google Agenda!");
        } catch (calendarError) {
          console.error("Erro ao sincronizar com Google Calendar:", calendarError);
          // Don't block the user flow, just log/notify purely about calendar
        }

        queryClient.invalidateQueries({ queryKey: ["lembretes", sessionId, year, month] });
      }
    } catch (e) {
      toast.error("Falha ao salvar compromisso");
    }
    setEditingAppointment(undefined);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAppointmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      try { await deleteLembrete(appointmentToDelete); toast.success("Compromisso excluído"); } catch { toast.error("Falha ao excluir"); }
      setAppointments(appointments.filter(a => a.id !== appointmentToDelete));
      queryClient.invalidateQueries({ queryKey: ["lembretes", sessionId, year, month] });
      setAppointmentToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Handlers para lembretes sem data
  const handleSaveLembrete = async (title: string) => {
    try {
      if (editingLembrete) {
        await updateLembreteSemData(editingLembrete.id, title);
        toast.success("Lembrete atualizado");
      } else {
        // New reminder should appear at the top (ordem = 0)
        // Increment ordem of all other non-done reminders
        const naoFeitos = localLembretes.filter(l => (l.status || 'nao_feito') === 'nao_feito');
        const updates = naoFeitos.map((l, idx) => ({ id: l.id, ordem: idx + 1 }));
        
        await addLembreteSemData({ sessionId, title });
        
        // Update ordem for existing non-done reminders
        if (updates.length > 0) {
          await updateLembretesOrdem(updates).catch(() => {}); // Silent fail
        }
        
        toast.success("Lembrete criado");
      }
      setEditingLembrete(undefined);
      setLembreteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["lembretes_sem_data", sessionId] });
    } catch (e) {
      toast.error("Falha ao salvar lembrete");
    }
  };

  const handleEditLembrete = (lembrete: any) => {
    setEditingLembrete({ id: lembrete.id, descricao: lembrete.descricao });
    setLembreteDialogOpen(true);
  };

  const handleDeleteLembrete = (id: string) => {
    setLembreteToDelete(id);
    setDeleteLembreteDialogOpen(true);
  };

  const confirmDeleteLembrete = async () => {
    if (lembreteToDelete) {
      try {
        await deleteLembrete(lembreteToDelete);
        toast.success("Lembrete excluído");
        queryClient.invalidateQueries({ queryKey: ["lembretes_sem_data", sessionId] });
      } catch {
        toast.error("Falha ao excluir");
      }
      setLembreteToDelete(null);
      setDeleteLembreteDialogOpen(false);
    }
  };

  // Handler para toggle de status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = await toggleLembreteStatus(id, currentStatus);
      
      // Auto-sort: move to bottom if marked as done, to top if marked as not done
      const updatedLembretes = localLembretes.map(l => 
        l.id === id ? { ...l, status: newStatus } : l
      );
      
      const sorted = sortLembretes(updatedLembretes);
      setLocalLembretes(sorted);
      
      // Update ordem in database
      const updates = sorted.map((lembrete, index) => ({
        id: lembrete.id,
        ordem: index,
      }));
      
      await updateLembretesOrdem(updates);
      
      toast.success(newStatus === 'feito' ? 'Marcado como feito! ✓' : 'Marcado como não feito ✗');
      queryClient.invalidateQueries({ queryKey: ["lembretes_sem_data", sessionId] });
    } catch {
      toast.error("Falha ao atualizar status");
    }
  };

  // Handler para drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localLembretes.findIndex((l) => l.id === active.id);
    const newIndex = localLembretes.findIndex((l) => l.id === over.id);

    const newOrder = arrayMove(localLembretes, oldIndex, newIndex);
    setLocalLembretes(newOrder);

    // Update ordem in database
    try {
      const updates = newOrder.map((lembrete, index) => ({
        id: lembrete.id,
        ordem: index,
      }));
      await updateLembretesOrdem(updates);
      queryClient.invalidateQueries({ queryKey: ["lembretes_sem_data", sessionId] });
    } catch {
      toast.error("Falha ao reordenar lembretes");
      // Revert on error
      setLocalLembretes(lembretesSemData);
    }
  };

  const exportCsv = () => {
    const header = "tipo,id,titulo,data,hora,local\n";
    const lines1 = appointmentsInRange.map(a => `compromisso,${a.id},${a.title.replace(/,/g,' ')},${a.date},${a.time},${(a.location||'').replace(/,/g,' ')}`);
    const lines2 = lembretesSemData.map((l:any) => `lembrete,${l.id},${String(l.descricao||'').replace(/,/g,' ')},${new Date(l.criado_em).toLocaleDateString('pt-BR')},,`);
    const blob = new Blob([header + [...lines1, ...lines2].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda_${year}-${String(month).padStart(2,'0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-3 mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Minha Agenda</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">Verifique seus compromissos e afazeres. Você pode integrar sua agenda do Google na aba "minha conta".</p>
      </div>

      {/* Banner de Novidade - Google Calendar */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg mb-6">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold flex items-center gap-2 justify-center sm:justify-start">
                Novidade! Integração com Google Agenda
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/40">Novo</span>
              </h3>
              <p className="text-blue-100 max-w-xl">
                Conecte sua conta agora e sincronize seus compromissos automaticamente. Nunca mais perca um evento!
              </p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/settings'}
            variant="secondary" 
            className="whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-sm"
          >
            Conectar Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-xl lg:col-span-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent capitalize">
              {format(new Date(year, month - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="range"
              selected={selectedRange}
              onDayClick={(day) => {
                if (!selectedRange?.from || (selectedRange?.from && selectedRange?.to)) {
                  // Inicia nova seleção a partir do clique
                  setSelectedRange({ from: day, to: undefined });
                } else if (selectedRange.from && !selectedRange.to) {
                  // Finaliza seleção garantindo ordem cronológica
                  const from = selectedRange.from;
                  const [start, end] = day < from ? [day, from] : [from, day];
                  setSelectedRange({ from: start, to: end });
                }
              }}
              month={new Date(year, month - 1, 1)}
              onMonthChange={(d) => { setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }}
              locale={ptBR}
              showOutsideDays
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-semibold text-foreground capitalize">
              {selectedRange?.from && selectedRange?.to
                ? `${format(selectedRange.from, "d 'de' MMMM", { locale: ptBR })} — ${format(selectedRange.to, "d 'de' MMMM", { locale: ptBR })}`
                : selectedRange?.from
                  ? `${format(selectedRange.from, "d 'de' MMMM", { locale: ptBR })}`
                  : "Selecione um período"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-2 mb-3">
              <Button size="sm" onClick={() => { setEditingAppointment(undefined); setDialogOpen(true); }} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>Exportar CSV</Button>
            </div>
            {appointmentsInRange.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-4xl">📅</div>
                <p className="text-sm text-muted-foreground font-medium">Nenhum compromisso no período selecionado</p>
                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>Converse com seu assessor para criar eventos</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentsInRange.map((appointment) => (
                  <div key={appointment.id} className="p-4 rounded-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent border border-border hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{appointment.title}</h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(appointment)} className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(appointment.id)} className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gradient-to-br from-card to-card/50 border-border shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              📝 Lembretes (sem data) — {lembretesSemData.length}
            </CardTitle>
            <Button 
              onClick={() => { setEditingLembrete(undefined); setLembreteDialogOpen(true); }} 
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLembretes ? (
            <p className="text-sm text-muted-foreground">Carregando lembretes...</p>
          ) : errorLembretes ? (
            <div className="text-sm text-red-500">
              <p>Erro ao carregar lembretes:</p>
              <pre className="text-xs mt-2 p-2 bg-red-50 rounded">{JSON.stringify(errorLembretes, null, 2)}</pre>
            </div>
          ) : lembretesSemData.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">📝</div>
              <p className="text-sm text-muted-foreground font-medium">Nenhum lembrete sem data</p>
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span>Clique em "Adicionar" para criar lembretes</span>
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localLembretes.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* Grid layout: 2 columns on medium+ screens, 1 column on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {localLembretes.map((l: any) => (
                    <SortableLembreteItem
                      key={l.id}
                      lembrete={l}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditLembrete}
                      onDelete={handleDeleteLembrete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

    <AgendaDialog 
      open={dialogOpen} 
      onOpenChange={setDialogOpen} 
      appointment={editingAppointment} 
      onSave={handleSave} 
    />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Diálogo para lembretes sem data */}
    <AlertDialog open={lembreteDialogOpen} onOpenChange={setLembreteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{editingLembrete ? "Editar Lembrete" : "Novo Lembrete"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editingLembrete ? "Edite a descrição do lembrete abaixo." : "Digite a descrição do lembrete sem data."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <input
            id="lembrete-input"
            type="text"
            defaultValue={editingLembrete?.descricao || ""}
            placeholder="Ex: Comprar leite"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            const input = document.getElementById('lembrete-input') as HTMLInputElement;
            if (input?.value.trim()) {
              handleSaveLembrete(input.value.trim());
            }
          }}>
            Salvar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Diálogo de confirmação de exclusão de lembrete */}
    <AlertDialog open={deleteLembreteDialogOpen} onOpenChange={setDeleteLembreteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDeleteLembrete}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
