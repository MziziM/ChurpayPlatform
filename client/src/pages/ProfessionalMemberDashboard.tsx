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
  ArrowUpRight, ArrowDownRight, Clock, Plus
} from 'lucide-react';
import { ProfessionalDonationModal } from '@/components/ProfessionalDonationModal';
import { ProfessionalWalletModal } from '@/components/ProfessionalWalletModal';

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Good afternoon, Nomsa</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <span>Here's your giving overview and church activity</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last active</p>
              <p className="text-sm font-medium text-gray-900">2 minutes ago</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions with Enhanced UX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => {
                  setDonationType('donation');
                  setShowDonationModal(true);
                }}
                className="h-24 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <HandHeart className="h-7 w-7" />
                <div className="text-center">
                  <span className="font-semibold">Give Now</span>
                  <p className="text-xs opacity-90">Make a donation</p>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowWalletModal(true)}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-7 w-7 text-purple-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">My Wallet</span>
                  <p className="text-xs text-gray-600">R {walletBalance.toLocaleString()}</p>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  setDonationType('tithe');
                  setShowDonationModal(true);
                }}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-green-300 bg-white hover:bg-green-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Building2 className="h-7 w-7 text-green-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">Tithe</span>
                  <p className="text-xs text-gray-600">Support your church</p>
                </div>
              </Button>
            </div>

            {/* Financial Overview with Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Activity className="h-6 w-6" />
                    <span>This Month</span>
                  </CardTitle>
                  <p className="text-blue-100 text-sm">Your giving summary</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Total Given</span>
                      </div>
                      <span className="font-bold text-xl text-gray-900">R 2,400</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Tithes</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900">R 1,800</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Donations</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900">R 600</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Wallet Balance</span>
                  </CardTitle>
                  <p className="text-purple-100 text-sm">Your available funds</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">R {walletBalance.toLocaleString()}</span>
                        <p className="text-gray-500 text-sm mt-1">Available balance</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWalletModal(true)}
                        className="text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-medium text-sm">Active & Secured</span>
                      </div>
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={() => {
                          setDonationType('topup');
                          setShowDonationModal(true);
                        }}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity with Enhanced Design */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Clock className="h-6 w-6" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <p className="text-gray-300 text-sm mt-1">Your latest transactions</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-lg">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {donationHistory?.slice(0, 5).map((donation, index) => (
                    <div key={donation.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      index % 2 === 0 ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          donation.type === 'tithe' ? 'bg-green-100 text-green-600' :
                          donation.type === 'donation' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {donation.type === 'tithe' ? <Building2 className="h-6 w-6" /> :
                           donation.type === 'donation' ? <HandHeart className="h-6 w-6" /> :
                           <Receipt className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{donation.churchName}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600 capitalize">{donation.type}</p>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <p className="text-sm text-gray-500">{new Date(donation.createdAt).toLocaleDateString('en-ZA')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900">R {parseFloat(donation.amount).toLocaleString()}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={donation.status === 'completed' ? 'default' : 'secondary'} 
                            className={`text-xs ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {donation.status}
                          </Badge>
                          <ArrowUpRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!donationHistory || donationHistory.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600 mb-2">No recent activity</p>
                      <p className="text-sm text-gray-500 mb-6">Your giving history will appear here</p>
                      <Button
                        onClick={() => {
                          setDonationType('donation');
                          setShowDonationModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <HandHeart className="h-4 w-4 mr-2" />
                        Make Your First Donation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Achievement Card with Animation */}
            <Card className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Faithful Giver</h3>
                  <p className="text-purple-100 mb-4">12 months of consistent giving</p>
                  <div className="bg-white/20 rounded-full py-2 px-4 backdrop-blur-sm">
                    <span className="font-semibold">{rewardPoints} reward points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Church Connection with Enhanced Design */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <span>My Church</span>
                </CardTitle>
                <p className="text-green-100 text-sm">Your spiritual home</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Grace Chapel</p>
                      <p className="text-gray-600">Johannesburg, South Africa</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Active Member</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" size="sm">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    View Church Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Stats */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Banknote className="h-6 w-6" />
                  <span>Quick Stats</span>
                </CardTitle>
                <p className="text-orange-100 text-sm">Your giving journey</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">Member since</span>
                    <span className="font-bold text-gray-900">Jan 2022</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">Total given</span>
                    <span className="font-bold text-xl text-gray-900">R 28,500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">This year</span>
                    <span className="font-bold text-lg text-gray-900">R 18,200</span>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Goal Progress</span>
                      <span className="font-bold text-purple-700">73%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '73%'}}></div>
                    </div>
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
      <ProfessionalDonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        type={donationType}
        walletBalance={walletBalance.toString()}
      />

      <ProfessionalWalletModal
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