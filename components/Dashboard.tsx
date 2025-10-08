import React, { useMemo, useState } from 'react';
import { Quote, User } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { ChartConfiguration } from 'chart.js';

interface DashboardProps {
  quotes: Quote[];
  users: User[];
  currentUser: User;
  onNewQuote: () => void;
  onLoadQuote: (id: string) => void;
  onManageService: (id: string) => void;
}

const calculateQuoteTotal = (quote: Quote) => {
    let total = 0;
    Object.values(quote.damagedParts).forEach(part => {
        part.services.forEach(s => total += s.laborHours * s.costPerHour);
        part.replacementParts.forEach(p => total += p.quantity * p.unitCost);
        part.materials.forEach(m => total += m.quantity * m.unitCost);
    });
    return total;
};

const statusMap = {
  pending: { text: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  approved: { text: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  denied: { text: 'Recusado', color: 'bg-red-500/20 text-red-400' },
  'os-generated': { text: 'OS Gerada', color: 'bg-indigo-500/20 text-indigo-400' },
  'em-andamento': { text: 'Em Andamento', color: 'bg-blue-500/20 text-blue-400' },
  concluido: { text: 'Concluído', color: 'bg-gray-500/20 text-gray-400' },
};

const RestrictedContent: React.FC = () => (
    <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg">
        <div className="text-center p-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-400">Acesso Restrito</h3>
            <p className="mt-1 text-sm text-gray-500">Você não tem permissão para ver estes dados.</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ quotes, users, currentUser, onNewQuote, onLoadQuote, onManageService }) => {
  const [selectedUserId, setSelectedUserId] = useState('all');
  const isAdmin = currentUser.role === 'admin';

  const filteredQuotes = useMemo(() => {
    if (selectedUserId === 'all') return quotes;
    return quotes.filter(q => q.createdById === selectedUserId);
  }, [quotes, selectedUserId]);

  const { kpis, monthlyRevenueData, monthLabels, statusDistributionData, estimatorPerformanceData } = useMemo(() => {
    const revenueQuotes = filteredQuotes.filter(q => q.status === 'approved' || q.status === 'os-generated' || q.status === 'em-andamento' || q.status === 'concluido');
    const totalRevenue = revenueQuotes.reduce((acc, q) => acc + calculateQuoteTotal(q), 0);
    
    const inProgressServices = filteredQuotes.filter(q => q.status === 'em-andamento');
    const pendingQuotes = filteredQuotes.filter(q => q.status === 'pending');
    
    const resolvedQuotes = filteredQuotes.filter(q => q.status !== 'pending');
    const convertedQuotes = filteredQuotes.filter(q => q.status !== 'pending' && q.status !== 'denied');
    const approvalRate = resolvedQuotes.length > 0 ? (convertedQuotes.length / resolvedQuotes.length) * 100 : 0;
    
    // Monthly Revenue
    const monthlyRevenue: { [key: string]: number } = {};
    const monthLabels: string[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit'});
        monthlyRevenue[monthKey] = 0;
        monthLabels.push(monthLabel);
    }

    revenueQuotes.forEach(q => {
        const date = new Date(q.approvedAt || q.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (monthKey in monthlyRevenue) {
            monthlyRevenue[monthKey] += calculateQuoteTotal(q);
        }
    });

    const statusCounts = {
        pending: filteredQuotes.filter(q => q.status === 'pending').length,
        approved: filteredQuotes.filter(q => q.status === 'approved').length,
        denied: filteredQuotes.filter(q => q.status === 'denied').length,
        in_progress: filteredQuotes.filter(q => ['os-generated', 'em-andamento'].includes(q.status)).length,
        completed: filteredQuotes.filter(q => q.status === 'concluido').length
    };
    
    const estimatorPerformance: { [key: string]: { name: string, total: number } } = {};
    users.forEach(u => { estimatorPerformance[u.id] = { name: u.name, total: 0 } });
    revenueQuotes.forEach(q => {
        if (q.createdById && estimatorPerformance[q.createdById]) {
            estimatorPerformance[q.createdById].total += calculateQuoteTotal(q);
        }
    });
    
    const validEstimators = users.filter(u => u.role === 'admin' || u.role === 'estimator');
    const estimatorPerformanceData = {
        labels: validEstimators.map(u => u.name.split(' ')[0]),
        data: validEstimators.map(u => estimatorPerformance[u.id]?.total || 0)
    };

    return {
        kpis: { totalRevenue, inProgressServices: inProgressServices.length, pendingCount: pendingQuotes.length, approvalRate },
        monthlyRevenueData: Object.values(monthlyRevenue),
        monthLabels,
        statusDistributionData: [statusCounts.approved, statusCounts.pending, statusCounts.denied, statusCounts.in_progress, statusCounts.completed],
        estimatorPerformanceData
    };
  }, [filteredQuotes, users]);

  const barChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
        labels: monthLabels,
        datasets: [{
            label: 'Faturamento Mensal',
            data: monthlyRevenueData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#9ca3af' } },
            x: { ticks: { color: '#9ca3af' } }
        }
    }
  };
  
  const estimatorPerformanceConfig: ChartConfiguration = {
    type: 'bar',
    data: {
        labels: estimatorPerformanceData.labels,
        datasets: [{
            label: 'Faturamento Aprovado',
            data: estimatorPerformanceData.data,
            backgroundColor: 'rgba(22, 163, 74, 0.5)',
            borderColor: 'rgba(22, 163, 74, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#9ca3af' } },
            x: { ticks: { color: '#9ca3af' } }
        }
    }
  };

  const doughnutChartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
        labels: ['Aprovados', 'Pendentes', 'Recusados', 'Em Andamento', 'Concluídos'],
        datasets: [{
            data: statusDistributionData,
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6B7280'],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#9ca3af' } }
        }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Painel de Controle</h1>
            <p className="text-gray-400">Visão geral do desempenho da oficina.</p>
        </div>
        <div className="flex items-center gap-4">
             {isAdmin && (
                <select 
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                >
                    <option value="all">Todos os Orçamentistas</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
             )}
            {currentUser.role !== 'viewer' && <Button onClick={onNewQuote}>+ Novo Orçamento</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <Card className="!p-4">
              <h3 className="text-sm font-medium text-gray-400">Faturamento Total (Aprovados)</h3>
              <p className="text-3xl font-bold text-white">{kpis.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </Card>
        ) : (
          <Card className="!p-4 bg-gray-800/50">
             <h3 className="text-sm font-medium text-gray-500">Faturamento Total</h3>
             <p className="text-2xl font-bold text-gray-600">Restrito</p>
          </Card>
        )}
        <Card className="!p-4">
            <h3 className="text-sm font-medium text-gray-400">Serviços em Andamento</h3>
            <p className="text-3xl font-bold text-white">{kpis.inProgressServices}</p>
        </Card>
        <Card className="!p-4">
            <h3 className="text-sm font-medium text-gray-400">Orçamentos Pendentes</h3>
            <p className="text-3xl font-bold text-white">{kpis.pendingCount}</p>
        </Card>
        <Card className="!p-4">
            <h3 className="text-sm font-medium text-gray-400">Taxa de Conversão</h3>
            <p className="text-3xl font-bold text-white">{kpis.approvalRate.toFixed(1)}%</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Faturamento nos Últimos 12 Meses</h2>
            {isAdmin ? <BarChart config={barChartConfig} /> : <RestrictedContent />}
        </Card>
        <Card>
            <h2 className="text-xl font-bold mb-4">Distribuição de Status</h2>
            <DoughnutChart config={doughnutChartConfig} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Performance por Orçamentista (Faturamento Aprovado)</h2>
             {isAdmin ? <BarChart config={estimatorPerformanceConfig} /> : <RestrictedContent />}
        </Card>
        <Card>
          <h2 className="text-xl font-bold mb-4">Serviços Recentes</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredQuotes.slice(0, 10).map(quote => {
                const statusInfo = statusMap[quote.status] || statusMap.pending;
                const isService = ['os-generated', 'em-andamento', 'concluido'].includes(quote.status);
                return (
                  <div key={quote.id} className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-center">
                      <div>
                          <p className="font-semibold text-blue-400">{quote.customer.name}</p>
                          <p className="text-sm text-gray-300">{quote.vehicle.make} {quote.vehicle.model} - <span className="font-mono bg-gray-600 px-1 rounded">{quote.vehicle.plate || 'S/ Placa'}</span></p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.text}
                          </span>
                          <Button 
                            onClick={() => isService ? onManageService(quote.id) : onLoadQuote(quote.id)} 
                            variant="secondary" 
                            className="!py-1 !px-3 !text-sm"
                          >
                            {isService ? 'Gerenciar' : 'Ver'}
                          </Button>
                      </div>
                  </div>
              )})}
              {filteredQuotes.length === 0 && <p className="text-gray-400">Nenhum registro encontrado.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;