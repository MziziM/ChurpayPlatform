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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Choose Your Registration Type
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Select the option that best describes you
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group cursor-pointer"
                onClick={() => {
                  window.location.href = '/church-registration';
                  onClose();
                }}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-churpay-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Church className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">Church Registration</CardTitle>
              <p className="text-gray-600 text-sm">For church administrators and leaders</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Register your church on the platform</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Set up donation campaigns and projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Manage church finances and payouts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Access admin dashboard and analytics</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/church-registration';
                  onClose();
                }}
              >
                Register Your Church
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group cursor-pointer"
                onClick={() => {
                  window.location.href = '/member-registration';
                  onClose();
                }}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">Member Registration</CardTitle>
              <p className="text-gray-600 text-sm">For church members and donors</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Join your church's community</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Make secure digital donations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Support church projects and campaigns</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Track your giving history</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-all mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/member-registration';
                  onClose();
                }}
              >
                Join as Member
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}