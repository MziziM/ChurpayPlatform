import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, DollarSignIcon, CheckCircleIcon, Clock, Gift, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Church {
  id: string;
  name: string;
  status: string;
}

interface CashbackRecord {
  id: string;
  churchId: string;
  year: number;
  totalPlatformFees: string;
  cashbackAmount: string;
  cashbackRate: string;
  status: string;
  calculatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  paidBy?: string;
}

interface CashbackManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  churches: Church[];
}

export function CashbackManagementModal({ 
  isOpen, 
  onClose, 
  churches 
}: CashbackManagementModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch cashback records
  const { data: cashbackRecords, isLoading } = useQuery({
    queryKey: ["/api/super-admin/cashback-records", selectedChurch, selectedYear],
    enabled: isOpen,
  });

  // Calculate cashback mutation
  const calculateCashbackMutation = useMutation({
    mutationFn: async ({ churchId, year }: { churchId: string; year: number }) =>
      apiRequest(`/api/super-admin/calculate-cashback/${churchId}/${year}`, {
        method: "POST",
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cashback calculated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/cashback-records"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate cashback",
        variant: "destructive",
      });
    },
  });

  // Process cashback mutation (approve/pay)
  const processCashbackMutation = useMutation({
    mutationFn: async ({ recordId, action }: { recordId: string; action: string }) =>
      apiRequest(`/api/super-admin/process-cashback/${recordId}/${action}`, {
        method: "POST",
      }),
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Cashback ${variables.action}ed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/cashback-records"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process cashback",
        variant: "destructive",
      });
    },
  });

  // Generate annual reports mutation
  const generateAnnualReportsMutation = useMutation({
    mutationFn: async (year: number) =>
      apiRequest(`/api/super-admin/generate-annual-cashback/${year}`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      toast({
        title: "Annual Reports Generated",
        description: `Generated ${data.recordsGenerated} cashback records totaling R${data.totalCashbackAmount.toFixed(2)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/cashback-records"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate annual reports",
        variant: "destructive",
      });
    },
  });

  const handleCalculateCashback = (churchId: string) => {
    calculateCashbackMutation.mutate({ churchId, year: selectedYear });
  };

  const handleProcessCashback = (recordId: string, action: 'approve' | 'pay') => {
    processCashbackMutation.mutate({ recordId, action });
  };

  const handleGenerateAnnualReports = () => {
    generateAnnualReportsMutation.mutate(selectedYear);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'calculated':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Calculated</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircleIcon className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'paid':
        return <Badge variant="destructive"><Gift className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChurchName = (churchId: string) => {
    return churches.find(c => c.id === churchId)?.name || "Unknown Church";
  };

  const filteredRecords = cashbackRecords?.filter((record: CashbackRecord) => {
    const yearMatch = record.year === selectedYear;
    const churchMatch = !selectedChurch || record.churchId === selectedChurch;
    return yearMatch && churchMatch;
  }) || [];

  const totalCashbackAmount = filteredRecords.reduce((sum: number, record: CashbackRecord) => 
    sum + parseFloat(record.cashbackAmount || '0'), 0
  );

  const approvedChurches = churches.filter(church => church.status === 'approved');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            Church Cashback Management - Annual 10% Revenue Sharing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Churches</option>
                {approvedChurches.map(church => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleGenerateAnnualReports}
              disabled={generateAnnualReportsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateAnnualReportsMutation.isPending ? "Generating..." : `Generate ${selectedYear} Reports`}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cashback ({selectedYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R{totalCashbackAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  10% of platform fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Churches Eligible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvedChurches.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved churches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Records Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredRecords.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cashback calculations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cashback Records */}
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No cashback records found</p>
                  {approvedChurches.length > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      Use "Generate {selectedYear} Reports" to calculate cashback for all churches
                    </p>
                  )}
                </div>
              ) : (
                filteredRecords.map((record: CashbackRecord) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{getChurchName(record.churchId)}</h3>
                            {getStatusBadge(record.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Year</p>
                              <p className="font-medium">{record.year}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Platform Fees</p>
                              <p className="font-medium">R{parseFloat(record.totalPlatformFees).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cashback (10%)</p>
                              <p className="font-medium text-green-600">R{parseFloat(record.cashbackAmount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Calculated</p>
                              <p className="font-medium">{format(new Date(record.calculatedAt), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>

                          {record.approvedAt && (
                            <p className="text-xs text-muted-foreground">
                              Approved on {format(new Date(record.approvedAt), 'MMM dd, yyyy')}
                            </p>
                          )}

                          {record.paidAt && (
                            <p className="text-xs text-green-600">
                              Paid on {format(new Date(record.paidAt), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {record.status === 'calculated' && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessCashback(record.id, 'approve')}
                              disabled={processCashbackMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}

                          {record.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                              onClick={() => handleProcessCashback(record.id, 'pay')}
                              disabled={processCashbackMutation.isPending}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Individual Church Calculation */}
          {approvedChurches.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Calculate Individual Church Cashback</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedChurches.map(church => (
                    <Card key={church.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{church.name}</h4>
                            <p className="text-sm text-muted-foreground">Year: {selectedYear}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCalculateCashback(church.id)}
                            disabled={calculateCashbackMutation.isPending}
                          >
                            <DollarSignIcon className="h-4 w-4 mr-1" />
                            Calculate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}