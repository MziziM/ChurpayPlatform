import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Church, Users, ArrowRight, CheckCircle } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Choose Your Registration Type
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Select the option that best describes you
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 relative overflow-hidden card-hover cursor-pointer"
                onClick={() => {
                  window.location.href = '/church-registration';
                  onClose();
                }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-churpay-gradient opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="w-16 h-16 bg-churpay-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Church className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Church Registration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Transform your church's giving experience with our comprehensive digital platform. Accept donations, manage funds, and grow your ministry.</p>
              
              <div className="space-y-3 mb-6">
                {[
                  'Multi-channel donation acceptance',
                  'Real-time financial analytics',
                  'Secure payout management',
                  '10% annual revenue sharing for churches',
                  'Member engagement tools'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/church-registration';
                  onClose();
                }}
              >
                <span>Register Your Church</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">10% annual revenue sharing • No setup fees</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/50 relative overflow-hidden card-hover cursor-pointer"
                onClick={() => {
                  window.location.href = '/member-registration';
                  onClose();
                }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Member Registration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Join your church community and support causes you care about. Make secure donations and track your giving history with ease.</p>
              
              <div className="space-y-3 mb-6">
                {[
                  'Secure digital wallet',
                  'Donation tracking & receipts',
                  'Support community projects',
                  'Recurring giving options'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/member-registration';
                  onClose();
                }}
              >
                <span>Join as Member</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}