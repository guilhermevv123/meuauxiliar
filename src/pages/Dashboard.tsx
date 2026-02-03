import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { TransactionsTab } from "@/components/dashboard/tabs/TransactionsTab";
import { CategoriesTab } from "@/components/dashboard/tabs/CategoriesTab";
import { AgendaTab } from "@/components/dashboard/tabs/AgendaTab";
import OnlyDebtsTab from "@/components/dashboard/tabs/OnlyDebtsTab";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, FolderKanban, Calendar, CreditCard, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isNavigatingToAI, setIsNavigatingToAI] = useState(false);

  // Transition Handler
  const handleAiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigatingToAI(true);
    // Sequence: Fade Black (0.5s) -> Orb appears (0.5s) -> Wait (0.5s) -> Navigate
    // Total approx 1.5s - 2s
    setTimeout(() => {
        navigate('/ai');
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      
      {/* CINEMATIC TRANSITION OVERLAY */}
      <AnimatePresence>
        {isNavigatingToAI && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
            >
                {/* Purple Orb Pulse Animation - Matches AI Page */}
                <motion.div
                    layoutId="ai-orb-hero"
                    initial={{ scale: 0, opacity: 0, backgroundColor: "#7c3aed" }} // Start as Violet
                    animate={{ 
                        scale: [0, 1.2, 1], 
                        opacity: [0, 1, 1],
                    }}
                    transition={{ 
                        duration: 0.8, 
                        delay: 0.5, 
                        ease: "anticipate"
                    }}
                    className="relative w-32 h-32 rounded-full blur-xl opacity-80 shadow-[0_0_60px_rgba(139,92,246,0.6)]"
                />
            </motion.div>
        )}
      </AnimatePresence>

      <DashboardHeader />

      <motion.div 
        className="container mx-auto px-2 sm:px-4 py-4 sm:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Tabs 
          defaultValue="overview" 
          className="w-full"
          onValueChange={(val) => {
            if (val === 'overview') {
              queryClient.invalidateQueries({
                predicate: (q) => {
                  const key0 = q.queryKey?.[0];
                  return typeof key0 === 'string' && key0.startsWith('financeiro');
                }
              });
            }
          }}
        >
          <motion.div 
            className="relative mb-6 sm:mb-10"
            variants={containerVariants}
          >
            <TabsList className="flex items-center gap-2 p-3 overflow-x-auto overflow-y-hidden rounded-2xl bg-gradient-to-r from-amber-50/90 via-purple-50/80 to-amber-50/90 dark:from-slate-900/50 dark:via-purple-900/30 dark:to-slate-900/50 backdrop-blur-2xl border border-purple-300/40 dark:border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.12)] dark:shadow-[0_8px_32px_0_rgba(168,85,247,0.15)] scrollbar-hide scroll-smooth">
              
              {/* AI BUTTON WITH SPECIAL INTERACTION */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a 
                    onClick={handleAiClick}
                    className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center cursor-pointer mr-2"
                    title="Sofia IA"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl opacity-0 hover:opacity-10 transition-opacity" />
                    <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400 animate-pulse" />
                </a>
              </motion.div>

              <TabsTrigger 
                value="overview" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <LayoutDashboard className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <ArrowLeftRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <FolderKanban className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </TabsTrigger>
              <TabsTrigger 
                value="agenda" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <Calendar className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              </TabsTrigger>
              <TabsTrigger 
                value="debts" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <CreditCard className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* TAB CONTENTS WITH ANIMATIONS */}
          <TabsContent value="overview">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <OverviewTab />
             </motion.div>
          </TabsContent>

          <TabsContent value="transactions">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <TransactionsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="categories">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <CategoriesTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="agenda">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <AgendaTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="debts">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <OnlyDebtsTab />
            </motion.div>
          </TabsContent>
          
          
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Dashboard;
