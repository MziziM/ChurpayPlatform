import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Building2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PlatformStats {
  totalRevenue: string;
  totalTransactions: number;
  activeChurches: number;
  totalChurches: number;
  totalMembers: number;
  pendingPayouts: string;
  completedPayouts: string;
  platformFees: string;
  monthlyRevenue: string;
  revenueGrowth: number;
  transactionGrowth: number;
  churchGrowth: number;
  payoutGrowth: number;
}

interface PlatformFinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformFinancialsModal({ isOpen, onClose }: PlatformFinancialsModalProps) {
  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/super-admin/stats'],
    enabled: isOpen,
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `R ${num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(growth)}%
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] mx-2 p-0 overflow-hidden rounded-3xl border-0 shadow-2xl max-h-[90vh]">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center space-x-4 text-3xl font-bold mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <span>Platform Financials</span>
                <p className="text-lg font-normal text-purple-100 mt-1">
                  Comprehensive financial overview
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed platform financial statistics and payout information
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {statsLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Wallet className="w-5 h-5 mr-2 text-green-600" />
                      Total Platform Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(platformStats?.totalRevenue || '0')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Growth this month</span>
                        {formatGrowth(platformStats?.revenueGrowth || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(platformStats?.monthlyRevenue || '0')}
                      </p>
                      <div className="text-sm text-gray-600">
                        Last 30 days performance
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Fees & Payouts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-purple-700 dark:text-purple-300">
                      Platform Fees Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      {formatCurrency(platformStats?.platformFees || '0')}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      3.9% + R3 per transaction
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-orange-700 dark:text-orange-300">
                      Pending Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                      {formatCurrency(platformStats?.pendingPayouts || '0')}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Awaiting processing
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-green-700 dark:text-green-300">
                      Completed Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(platformStats?.completedPayouts || '0')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Successfully processed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Statistics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold">{platformStats?.activeChurches || 0}</p>
                      <p className="text-sm text-gray-600">Active Churches</p>
                      <div className="mt-1">{formatGrowth(platformStats?.churchGrowth || 0)}</div>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold">{(platformStats?.totalMembers || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Members</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold">{(platformStats?.totalTransactions || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <div className="mt-1">{formatGrowth(platformStats?.transactionGrowth || 0)}</div>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Building2 className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold">{platformStats?.totalChurches || 0}</p>
                      <p className="text-sm text-gray-600">Total Churches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Generate Report
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}