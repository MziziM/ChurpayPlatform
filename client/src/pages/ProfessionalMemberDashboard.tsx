import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wallet, HandHeart, Building2, Receipt, 
  Activity, CreditCard, Banknote, Shield,
  Search, Bell, User, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { EnhancedDonationModal } from '@/components/EnhancedDonationModal';
import { WalletModal } from '@/components/WalletModal';

interface WalletData {
  id: string;
  userId: string;
  availableBalance: string;
  pendingBalance: string;
  rewardPoints: string;
  dailyTransferLimit: string;
  monthlyTransferLimit: string;
  isActive: boolean;
  isPinSet: boolean;
  autoTopUpEnabled: boolean;
}

interface DonationHistory {
  id: string;
  amount: string;
  type: 'tithe' | 'donation' | 'project';
  churchName: string;
  projectTitle?: string;
  createdAt: string;
  status: string;
}

export default function ProfessionalMemberDashboard() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [donationType, setDonationType] = useState<'donation' | 'tithe' | 'project' | 'topup'>('donation');
  const [searchQuery, setSearchQuery] = useState('');

  // Data queries
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ['/api/wallet']
  });

  const { data: donationHistory } = useQuery<DonationHistory[]>({
    queryKey: ['/api/donations/history']
  });

  const walletBalance = parseFloat(walletData?.availableBalance || '0');
  const rewardPoints = parseInt(walletData?.rewardPoints || '0');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">ChurPay</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-purple-600 font-medium">Dashboard</Button>
              <Button variant="ghost" className="text-gray-600">Giving</Button>
              <Button variant="ghost" className="text-gray-600">Churches</Button>
              <Button variant="ghost" className="text-gray-600">Projects</Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b152547b?w=100&h=100&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Nomsa Mthembu</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Nomsa</h1>
          <p className="text-gray-600">Here's your giving overview and church activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => {
                  setDonationType('donation');
                  setShowDonationModal(true);
                }}
                className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center space-y-2"
              >
                <HandHeart className="h-6 w-6" />
                <span className="font-medium">Give Now</span>
              </Button>
              
              <Button
                onClick={() => setShowWalletModal(true)}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Wallet className="h-6 w-6" />
                <span className="font-medium">My Wallet</span>
              </Button>
              
              <Button
                onClick={() => {
                  setDonationType('tithe');
                  setShowDonationModal(true);
                }}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Building2 className="h-6 w-6" />
                <span className="font-medium">Tithe</span>
              </Button>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Given</span>
                      <span className="font-semibold">R 2,400</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tithes</span>
                      <span className="font-semibold">R 1,800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Donations</span>
                      <span className="font-semibold">R 600</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">R {walletBalance.toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWalletModal(true)}
                        className="text-purple-600"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Active</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>Secured</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donationHistory?.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {donation.type === 'tithe' ? <Building2 className="h-5 w-5 text-purple-600" /> :
                           donation.type === 'donation' ? <HandHeart className="h-5 w-5 text-purple-600" /> :
                           <Receipt className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{donation.churchName}</p>
                          <p className="text-sm text-gray-600 capitalize">{donation.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">R {parseFloat(donation.amount).toLocaleString()}</p>
                        <div className="flex items-center space-x-1">
                          <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {donation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!donationHistory || donationHistory.length === 0) && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No recent activity</p>
                      <p className="text-sm text-gray-500">Your giving history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Faithful Giver</h3>
                  <p className="text-sm opacity-90 mb-4">12 months of consistent giving</p>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span>{rewardPoints} points earned</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Church Connection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">My Church</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Grace Chapel</p>
                      <p className="text-sm text-gray-600">Johannesburg, SA</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    View Church Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">Jan 2022</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total given</span>
                    <span className="font-medium">R 28,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This year</span>
                    <span className="font-medium">R 18,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 text-purple-600">
            <Activity className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Wallet</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <HandHeart className="h-5 w-5" />
            <span className="text-xs">Give</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <Receipt className="h-5 w-5" />
            <span className="text-xs">History</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <EnhancedDonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        initialType={donationType}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        walletBalance={walletBalance}
        rewardPoints={rewardPoints}
        transactions={[]}
        onTopUp={() => {
          setShowWalletModal(false);
          setDonationType('topup');
          setShowDonationModal(true);
        }}
        onSend={() => {
          setShowWalletModal(false);
        }}
      />
    </div>
  );
}