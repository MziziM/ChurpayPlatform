import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, Plus } from "lucide-react";
import { PaymentMethod } from "@shared/schema";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string;
  onMethodSelect: (methodId: string, type: 'wallet' | 'card') => void;
  walletBalance: number;
  showAddCard?: boolean;
  onAddCard?: () => void;
}

export function PaymentMethodSelector({
  paymentMethods,
  selectedMethod,
  onMethodSelect,
  walletBalance,
  showAddCard = false,
  onAddCard
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Payment Method</div>
      
      {/* Wallet Option */}
      <Card 
        className={`cursor-pointer transition-all border-2 ${
          selectedMethod === 'wallet' 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-200 hover:border-purple-300'
        }`}
        onClick={() => onMethodSelect('wallet', 'wallet')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">ChurPay Wallet</div>
                <div className="text-sm text-gray-500">
                  Available: R{walletBalance.toFixed(2)}
                </div>
              </div>
            </div>
            {selectedMethod === 'wallet' && (
              <Badge className="bg-purple-500">Selected</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Cards */}
      {paymentMethods.map((method) => (
        <Card 
          key={method.id}
          className={`cursor-pointer transition-all border-2 ${
            selectedMethod === method.id 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-purple-300'
          }`}
          onClick={() => onMethodSelect(method.id, 'card')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {method.cardType?.toUpperCase()} ****{method.maskedNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {method.nickname || `${method.cardType} card`}
                    {method.isDefault && (
                      <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedMethod === method.id && (
                <Badge className="bg-purple-500">Selected</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Card */}
      {showAddCard && (
        <Card 
          className="cursor-pointer transition-all border-2 border-dashed border-gray-300 hover:border-purple-400"
          onClick={onAddCard}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Plus className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-700">Add New Card</div>
                <div className="text-sm text-gray-500">
                  Save a card for faster payments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}