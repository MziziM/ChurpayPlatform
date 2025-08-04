import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Upload,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'tithe' | 'offering' | 'donation' | 'expense';
  category: string;
  amount: number;
  description: string;
  member?: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'tithe',
    category: 'Tithes & Offerings',
    amount: 2500,
    description: 'Weekly tithe collection',
    member: 'John Smith',
    status: 'completed',
    reference: 'TXN001'
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'donation',
    category: 'Building Fund',
    amount: 5000,
    description: 'Building fund donation',
    member: 'Anonymous',
    status: 'completed',
    reference: 'TXN002'
  },
  {
    id: '3',
    date: '2024-01-13',
    type: 'expense',
    category: 'Utilities',
    amount: -1200,
    description: 'Monthly electricity bill',
    status: 'completed',
    reference: 'EXP001'
  },
  {
    id: '4',
    date: '2024-01-12',
    type: 'offering',
    category: 'Special Offering',
    amount: 750,
    description: 'Mission support offering',
    member: 'Mary Johnson',
    status: 'pending',
    reference: 'TXN003'
  }
];

export function FinancialManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.member?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const financialStats = {
    totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    netIncome: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    monthlyGrowth: 12.5
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tithe': return 'bg-blue-100 text-blue-800';
      case 'offering': return 'bg-green-100 text-green-800';
      case 'donation': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTransaction = () => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      type: newTransaction.type || 'offering',
      category: newTransaction.category || '',
      amount: newTransaction.amount || 0,
      description: newTransaction.description || '',
      member: newTransaction.member,
      status: 'completed',
      reference: `TXN${Date.now()}`
    };
    setTransactions([transaction, ...transactions]);
    setShowAddModal(false);
    setNewTransaction({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Management
          </h1>
          <p className="text-gray-600">
            Track donations, expenses, and financial reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="bg-churpay-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">R{financialStats.totalIncome.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{financialStats.monthlyGrowth}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">R{financialStats.totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Church operations</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className="text-2xl font-bold text-gray-900">R{financialStats.netIncome.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Healthy surplus</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{financialStats.transactionCount}</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Receipt className="w-6 h-6" />
            <span>Record Tithe</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <DollarSign className="w-6 h-6" />
            <span>Add Offering</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <TrendingDown className="w-6 h-6" />
            <span>Record Expense</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <BarChart3 className="w-6 h-6" />
            <span>View Reports</span>
          </Button>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Types</option>
            <option value="tithe">Tithes</option>
            <option value="offering">Offerings</option>
            <option value="donation">Donations</option>
            <option value="expense">Expenses</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-gray-600">Date</th>
                <th className="text-left p-4 text-gray-600">Description</th>
                <th className="text-left p-4 text-gray-600">Type</th>
                <th className="text-left p-4 text-gray-600">Member</th>
                <th className="text-left p-4 text-gray-600">Amount</th>
                <th className="text-left p-4 text-gray-600">Status</th>
                <th className="text-left p-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{transaction.date}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{transaction.category}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-900">{transaction.member || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}R{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reference</label>
                  <p className="text-gray-900">{selectedTransaction.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900">{selectedTransaction.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <Badge className={getTypeColor(selectedTransaction.type)}>
                    {selectedTransaction.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedTransaction.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{selectedTransaction.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className={`font-bold ${selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.amount >= 0 ? '+' : ''}R{Math.abs(selectedTransaction.amount).toLocaleString()}
                  </p>
                </div>
                {selectedTransaction.member && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Member</label>
                    <p className="text-gray-900">{selectedTransaction.member}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Transaction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newTransaction.date || ''}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
              <select
                value={newTransaction.type || 'offering'}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as Transaction['type']})}
                className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
              >
                <option value="tithe">Tithe</option>
                <option value="offering">Offering</option>
                <option value="donation">Donation</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <Input
              placeholder="Description"
              value={newTransaction.description || ''}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Input
              placeholder="Category (e.g., Building Fund, Utilities)"
              value={newTransaction.category || ''}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Amount"
                type="number"
                value={newTransaction.amount || ''}
                onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                className="bg-gray-50 border-gray-200"
              />
              <Input
                placeholder="Member (optional)"
                value={newTransaction.member || ''}
                onChange={(e) => setNewTransaction({...newTransaction, member: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction} className="bg-churpay-gradient text-white">
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}