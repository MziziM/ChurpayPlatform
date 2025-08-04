import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Church,
  Heart
} from "lucide-react";
import { WalletTransaction } from "@shared/schema";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  rewardPoints: number;
  transactions: WalletTransaction[];
  onTopUp: () => void;
  onSend: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
  walletBalance,
  rewardPoints,
  transactions,
  onTopUp,
  onSend
}: WalletModalProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [sendAmount, setSendAmount] = useState("");
  const [sendRecipient, setSendRecipient] = useState("");

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-2">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-purple-600" />
            <span>ChurPay Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Balance Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Available Balance</p>
                    <p className="text-2xl font-bold">
                      {showBalance ? `R ${walletBalance.toLocaleString()}` : "R ••••••"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">{rewardPoints} points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onTopUp}
              className="bg-green-600 hover:bg-green-700 text-white h-16 rounded-xl flex flex-col items-center justify-center space-y-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Top Up</span>
            </Button>
            <Button
              onClick={onSend}
              className="bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-xl flex flex-col items-center justify-center space-y-1"
            >
              <Send className="h-5 w-5" />
              <span className="text-sm">Send Money</span>
            </Button>
            <Button
              onClick={() => {
                // This would trigger donation modal
                onClose();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white h-16 rounded-xl flex flex-col items-center justify-center space-y-1"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm">Donate</span>
            </Button>
          </div>

          {/* Wallet Features Tabs */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'donation' ? 'bg-purple-100 text-purple-600' :
                          transaction.type === 'tithe' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'topup' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.type === 'donation' ? <Heart className="h-5 w-5" /> :
                           transaction.type === 'tithe' ? <Church className="h-5 w-5" /> :
                           transaction.type === 'topup' ? <ArrowUp className="h-5 w-5" /> :
                           <ArrowDown className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-gray-500 text-xs">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          transaction.type === 'topup' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'topup' ? '+' : '-'}R {parseFloat(transaction.amount).toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-gray-400 text-sm">Start using your wallet to see transaction history</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{rewardPoints} Points</h3>
                <p className="text-gray-500">Earned from faithful giving</p>
              </div>

              <div className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Faithful Giver Badge</p>
                        <p className="text-sm text-gray-500">Achieved through consistent giving</p>
                      </div>
                      <Badge className="bg-yellow-500">Earned</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Consistency</p>
                        <p className="text-sm text-gray-500">Give for 12 consecutive months</p>
                      </div>
                      <Badge variant="outline">11/12</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Wallet Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto Top-up</p>
                        <p className="text-sm text-gray-500">Automatically top up when balance is low</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Transaction Notifications</p>
                        <p className="text-sm text-gray-500">Get notified of wallet activity</p>
                      </div>
                      <Button variant="outline" size="sm">Settings</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security</p>
                        <p className="text-sm text-gray-500">Manage wallet security settings</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
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