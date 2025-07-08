import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@satur/ui';
import {
  BarChart3,
  Users,
  Building2,
  Truck,
  CreditCard,
  TrendingUp,
  Calendar,
  Filter,
  Star,
  Activity,
  Loader2
} from 'lucide-react';
import {
  useDashboardStats,
  useFinancialReport,
  useTopServices,
  useTopSuppliers,
  useUsersCount
} from '../hooks/useDashboard';
import type { ReportsFilters } from '../types/api';

export function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Calcular filtros baseado no período selecionado
  const getFilters = (): ReportsFilters => {
    // Para dados de demonstração, vamos usar um período amplo que inclua os dados existentes
    if (selectedPeriod === 'all') {
      return {}; // Sem filtros = todos os dados
    }

    const now = new Date();
    const daysAgo = parseInt(selectedPeriod);
    const dateFrom = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Inclui dados futuros

    return {
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
    };
  };

  // Buscar dados reais da API
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: financialReport, isLoading: isLoadingFinancial } = useFinancialReport(getFilters());
  const { data: topServices, isLoading: isLoadingServices } = useTopServices(5);
  const { data: topSuppliers, isLoading: isLoadingSuppliers } = useTopSuppliers(5);
  const { data: totalUsers } = useUsersCount();



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Relatórios e Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Visualize relatórios detalhados e estatísticas da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos os dados</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total
              </CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingFinancial ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  `R$ ${(financialReport?.summary?.totalPaidAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                )}
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {selectedPeriod === 'all' ? 'Todos os dados' : `Período de ${selectedPeriod} dias`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Comissões
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingFinancial ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `${financialReport?.summary?.totalPayments || 0}`
                )}
              </div>
              <div className="text-sm text-gray-500">
                Total de transações
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pagamentos Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingFinancial ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `R$ ${(financialReport?.summary?.totalPendingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                )}
              </div>
              <div className="text-sm text-yellow-600">
                {financialReport?.summary?.pendingPayments || 0} pendentes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pagamentos Realizados
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingFinancial ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `R$ ${(financialReport?.summary?.totalPaidAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                )}
              </div>
              <div className="text-sm text-green-600">
                {financialReport?.summary?.paidPayments || 0} pagos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valor Médio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingFinancial ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `R$ ${(financialReport?.summary?.averageTransactionValue || 0).toFixed(2)}`
                )}
              </div>
              <div className="text-sm text-purple-600">
                Por transação
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Estatísticas de Usuários
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  dashboardStats?.users?.total || totalUsers || 0
                )}
              </div>
              <div className="text-sm text-blue-600">
                Total de usuários
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fornecedores Aprovados
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  dashboardStats?.users?.approvedSuppliers || 0
                )}
              </div>
              <div className="text-sm text-green-600">
                Ativos na plataforma
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aprovações Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  dashboardStats?.users?.pendingSuppliers || 0
                )}
              </div>
              <div className="text-sm text-yellow-600">
                Fornecedores aguardando
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Distribuição por Role
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Fornecedores:</span>
                  <span className="font-medium">
                    {isLoadingStats ? '...' : (dashboardStats?.users?.approvedSuppliers || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Agências:</span>
                  <span className="font-medium">
                    {isLoadingStats ? '...' : (dashboardStats?.users?.agencies || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">
                    {isLoadingStats ? '...' : (dashboardStats?.users?.total || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Estatísticas de Serviços
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {isLoadingStats ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : (
                    dashboardStats?.services?.total || 0
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-2">Serviços cadastrados na plataforma</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingServices ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : topServices && topServices.length > 0 ? (
                  topServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">Nenhum serviço encontrado</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Suppliers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingSuppliers ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : topSuppliers && topSuppliers.length > 0 ? (
                topSuppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-medium text-sm">
                          {supplier.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{supplier.name}</div>
                        <div className="text-xs text-gray-500">
                          {supplier.email} • {supplier.isApproved ? 'Aprovado' : 'Pendente'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-sm ${supplier.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                        {supplier.isApproved ? 'Ativo' : 'Pendente'}
                      </div>
                      <div className="text-xs text-gray-500">status</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Nenhum fornecedor encontrado</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resumo do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Período selecionado:</span>
                <span className="font-medium">
                  {selectedPeriod === 'all' ? 'Todos os dados' : `${selectedPeriod} dias`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de pagamentos:</span>
                <span className="font-medium">
                  {isLoadingFinancial ? '...' : (financialReport?.summary?.totalPayments || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valor médio por transação:</span>
                <span className="font-medium">
                  {isLoadingFinancial ? '...' : `R$ ${(financialReport?.summary?.averageTransactionValue || 0).toFixed(2)}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
