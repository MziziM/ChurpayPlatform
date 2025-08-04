import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Church, Users, ArrowRight, CheckCircle } from "lucide-react";

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
  const [, setLocation] = useLocation();

  const handleChurchRegistration = () => {
    onClose();
    setLocation('/church-registration');
  };

  const handleMemberRegistration = () => {
    onClose();
    setLocation('/member-registration');
  };


  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Choose Your Path with ChurPay
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 text-center mt-4">
            Select how you'd like to get started with our secure digital giving platform
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Church Registration Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={handleChurchRegistration}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-churpay-gradient opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-8 relative z-10">
              <div className="w-16 h-16 bg-churpay-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Church className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Register Your Church</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Transform your church's giving experience with our comprehensive digital platform. Accept donations, manage funds, and grow your ministry.
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  'Multi-channel donation acceptance',
                  'Real-time financial analytics',
                  'Secure payout management',
                  '10% annual revenue sharing',
                  'Member engagement tools'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 group">
                <span>Register Your Church</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">10% annual revenue sharing • No setup fees</span>
              </div>
            </CardContent>
          </Card>

          {/* Member Registration Card */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/50 relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={handleMemberRegistration}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-8 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Join as Member</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join your church community and support causes you care about. Make secure donations and track your giving history with ease.
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  'Secure digital wallet',
                  'Donation tracking & receipts',
                  'Support community projects',
                  'Recurring giving options',
                  'Church community access'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 group">
                <span>Join as Member</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">Free to join • Secure & trusted</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Button variant="link" className="text-churpay-purple p-0 h-auto" onClick={() => { onClose(); setLocation('/sign-in'); }}>Sign in here</Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}