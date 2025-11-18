import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { TransactionsTab } from "@/components/dashboard/tabs/TransactionsTab";
import { CategoriesTab } from "@/components/dashboard/tabs/CategoriesTab";
import { AgendaTab } from "@/components/dashboard/tabs/AgendaTab";
import OnlyDebtsTab from "@/components/dashboard/tabs/OnlyDebtsTab";
import FinancingTab from "@/components/dashboard/tabs/FinancingTab";
import { LayoutDashboard, ArrowLeftRight, FolderKanban, Calendar, CreditCard, Building2 } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="w-full">
          <div className="relative mb-6 sm:mb-10">
            <TabsList className="flex items-center gap-2 p-3 overflow-x-auto overflow-y-hidden rounded-2xl bg-gradient-to-r from-amber-50/90 via-purple-50/80 to-amber-50/90 dark:from-slate-900/50 dark:via-purple-900/30 dark:to-slate-900/50 backdrop-blur-2xl border border-purple-300/40 dark:border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.12)] dark:shadow-[0_8px_32px_0_rgba(168,85,247,0.15)] scrollbar-hide scroll-smooth">
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
              <TabsTrigger 
                value="financing" 
                className="group relative p-4 rounded-xl transition-all duration-500 text-purple-700 dark:text-purple-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:via-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.6)] data-[state=active]:scale-110 hover:bg-purple-100/60 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              >
                <Building2 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaTab />
          </TabsContent>

          <TabsContent value="debts">
            <OnlyDebtsTab />
          </TabsContent>
          
          <TabsContent value="financing">
            <FinancingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
