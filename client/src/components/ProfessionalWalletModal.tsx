import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Send, 
  History, 
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Star,
  Building2,
  Heart,
  TrendingUp,
  Shield,
  Settings,
  RefreshCw,
  ArrowRight,
  ArrowLeftRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { WalletTransaction } from "@shared/schema";

interface ProfessionalWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  rewardPoints: number;
  transactions: WalletTransaction[];
  onTopUp: () => void;
  onSend: () => void;
}

export function ProfessionalWalletModal({
  isOpen,
  onClose,
  walletBalance,
  rewardPoints,
  transactions,
  onTopUp,
  onSend
}: ProfessionalWalletModalProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transfer_received':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'donation':
      case 'reward':
        return <Heart className="h-4 w-4 text-purple-600" />;
      case 'transfer_sent':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transfer_received':
        return 'bg-green-50 border-green-200';
      case 'donation':
      case 'reward':
        return 'bg-purple-50 border-purple-200';
      case 'transfer_sent':
        return 'bg-blue-50 border-blue-200';
      case 'withdrawal':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] mx-2 p-0 overflow-hidden rounded-3xl border-0 shadow-2xl max-h-[90vh]">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center space-x-4 text-3xl font-bold mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <span>ChurPay Wallet</span>
                <p className="text-lg font-normal text-purple-100 mt-1">
                  Your digital giving account
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage your ChurPay wallet and view transaction history
            </DialogDescription>
          </DialogHeader>
          
          {/* Balance Display */}
          <div className="mt-6 bg-white/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-white">Available Balance</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/10 rounded-lg p-2"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-300 font-medium">Secured</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-bold text-white">
                  {showBalance ? `R ${walletBalance.toLocaleString()}` : 'R ••••••'}
                </span>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-purple-100">{rewardPoints} points</span>
                  </div>
                  <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                  <span className="text-purple-100">Active member</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={onTopUp}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-xl px-4 py-2 backdrop-blur-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-8 bg-white overflow-y-auto max-h-[60vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 rounded-2xl p-1">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <History className="h-5 w-5 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={onTopUp}
                  className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-1" />
                    <span className="font-semibold">Add Funds</span>
                  </div>
                </Button>
                
                <Button
                  onClick={onSend}
                  variant="outline"
                  className="h-20 border-2 border-blue-200 hover:border-blue-300 bg-white hover:bg-blue-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <Send className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <span className="font-semibold text-blue-600">Send Money</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 border-2 border-purple-200 hover:border-purple-300 bg-white hover:bg-purple-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <ArrowUp className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <span className="font-semibold text-purple-600">Withdraw</span>
                  </div>
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-6 w-6" />
                      <span>This Month</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Given</span>
                        <span className="font-bold text-xl">R 2,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transactions</span>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Amount</span>
                        <span className="font-semibold">R 200</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-6 w-6" />
                      <span>Rewards</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Points</span>
                        <span className="font-bold text-xl">{rewardPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">+240</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Streak</span>
                        <span className="font-semibold">12 weeks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Recent Transactions</h3>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${getTransactionBgColor(transaction.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                            ? 'text-green-600' 
                            : 'text-gray-900'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'transfer_received' ? '+' : '-'}
                          R {Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                        </p>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-2">No transactions yet</p>
                    <p className="text-sm text-gray-500 mb-6">Your transaction history will appear here</p>
                    <Button onClick={onTopUp} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Funds
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-8">
              <h3 className="text-2xl font-bold text-gray-900">Wallet Settings</h3>
              
              <div className="space-y-6">
                {/* Security Settings */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div>
                        <p className="font-semibold text-gray-900">Wallet PIN</p>
                        <p className="text-sm text-gray-600">Secure your transactions</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add extra security layer</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Limits */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-6 w-6" />
                      <span>Transaction Limits</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                      <span className="font-medium text-gray-900">Daily Limit</span>
                      <span className="font-bold text-blue-600">R 10,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                      <span className="font-medium text-gray-900">Monthly Limit</span>
                      <span className="font-bold text-blue-600">R 50,000</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}