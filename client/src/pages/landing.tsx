import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Church, 
  Users, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Play,
  Menu,
  X,
  Heart,
  UserPlus,
  Clock,
  Bell,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-churpay-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-gray-900">Chur</span>
                <span className="text-churpay-yellow">Pay</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-600 hover:text-churpay-purple transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-600 hover:text-churpay-purple transition-colors font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('security')} 
                className="text-gray-600 hover:text-churpay-purple transition-colors font-medium"
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('support')} 
                className="text-gray-600 hover:text-churpay-purple transition-colors font-medium"
              >
                Support
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/church-registration'}
                className="text-gray-600 hover:text-churpay-purple"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/church-registration'}
                className="bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left text-gray-600 hover:text-churpay-purple font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="block w-full text-left text-gray-600 hover:text-churpay-purple font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('security')} 
                className="block w-full text-left text-gray-600 hover:text-churpay-purple font-medium"
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('support')} 
                className="block w-full text-left text-gray-600 hover:text-churpay-purple font-medium"
              >
                Support
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-yellow-200/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Trusted by 500+ Churches</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Secure Digital</span><br />
                <span className="text-gradient">Giving Platform</span><br />
                <span className="text-gray-900">for Churches</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Empower your church with world-class fintech infrastructure. Accept donations, manage funds, and grow your ministry with enterprise-grade security and compliance.
              </p>
              
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-700">Choose your registration type:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/church-registration'}
                    className="bg-churpay-gradient text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <Church className="mr-2 h-5 w-5" />
                    <span>Register Church</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/member-registration'}
                    className="bg-white text-churpay-purple border-2 border-churpay-purple hover:bg-churpay-purple hover:text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    <span>Join as Member</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 w-fit"
                >
                  <Play className="mr-2 h-4 w-4" />
                  <span>Watch Demo</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Bank-Grade Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">24/7 Support</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-up">
              <div className="relative z-10">
                <Card className="shadow-2xl border border-gray-200/50 overflow-hidden">
                  <CardHeader className="bg-churpay-gradient text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Church className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">Grace Community Church</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/80 text-sm">Live</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">This Month</p>
                            <p className="text-2xl font-bold text-green-700">R45,680</p>
                          </div>
                          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Total Members</p>
                            <p className="text-2xl font-bold text-blue-700">342</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Heart className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">Sarah donated R500</p>
                            <p className="text-xs text-gray-500">Building Fund • 2 min ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <UserPlus className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">New member joined</p>
                            <p className="text-xs text-gray-500">John Smith • 1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-80 animate-float" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-400 rounded-xl opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Options Section */}
      <section className="py-16 bg-gradient-to-br from-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join ChurPay Today</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the registration option that's right for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-churpay-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Church className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Church Registration</CardTitle>
                <p className="text-gray-600">For church administrators and leaders</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Register your church on the platform</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Set up donation campaigns and projects</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Manage church finances and payouts</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Access admin dashboard and analytics</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all mt-6"
                  size="lg"
                  onClick={() => window.location.href = '/church-registration'}
                >
                  Register Your Church
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Member Registration</CardTitle>
                <p className="text-gray-600">For church members and donors</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Join your church's community</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Make secure digital donations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Support church projects and campaigns</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Track your giving history</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-all mt-6"
                  size="lg"
                  onClick={() => window.location.href = '/member-registration'}
                >
                  Join as Member
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revenue Sharing Highlight */}
      <section className="py-16 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-lg">10%</span>
              </div>
              <span className="font-semibold">Annual Revenue Sharing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Church Grows, We All Grow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Churches receive 10% of the annual revenue generated from their transactions. The more your church grows digitally, the more you earn back to reinvest in your ministry.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">R10,000</div>
                <div className="text-gray-600 text-sm">Monthly donations</div>
                <div className="text-yellow-600 font-semibold mt-2">R468 annual bonus</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">R50,000</div>
                <div className="text-gray-600 text-sm">Monthly donations</div>
                <div className="text-yellow-600 font-semibold mt-2">R2,340 annual bonus</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">R100,000</div>
                <div className="text-gray-600 text-sm">Monthly donations</div>
                <div className="text-yellow-600 font-semibold mt-2">R4,680 annual bonus</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Whether you're a church leader looking to modernize giving or a member wanting to support your community, ChurPay has the perfect solution for you.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 relative overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-churpay-gradient opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-churpay-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Church className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Church Registration</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Transform your church's giving experience with our comprehensive digital platform. Accept donations, manage funds, and grow your ministry.</p>
                
                <div className="space-y-3 mb-8">
                  {[
                    'Multi-channel donation acceptance',
                    'Real-time financial analytics',
                    'Secure payout management',
                    '10% annual revenue sharing for churches',
                    'Member engagement tools'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                  onClick={() => window.location.href = '/church-registration'}
                >
                  <span>Register Your Church</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500">10% annual revenue sharing • No setup fees</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/50 relative overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Member Registration</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Join your church community and support causes you care about. Make secure donations and track your giving history with ease.</p>
                
                <div className="space-y-3 mb-8">
                  {[
                    'Secure digital wallet',
                    'Donation tracking & receipts',
                    'Support community projects',
                    'Recurring giving options'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                  onClick={() => window.location.href = '/member-registration'}
                >
                  <span>Join as Member</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Platform Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Built with the same security standards as major banks, ChurPay delivers the tools your church needs to thrive in the digital age.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Bank-Grade Security',
                description: 'PCI DSS Level 1 compliance, end-to-end encryption, and multi-factor authentication protect your church\'s financial data.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: Users,
                title: 'Role-Based Access',
                description: 'Granular permissions for pastors, staff, treasurers, and members ensure the right people have the right access.',
                color: 'bg-purple-100 text-churpay-purple'
              },
              {
                icon: TrendingUp,
                title: 'Real-time Analytics',
                description: 'Track giving trends, member engagement, and financial health with powerful dashboards and insights.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: CreditCard,
                title: 'Multi-Payment Options',
                description: 'Accept card payments, EFT transfers, mobile money, and cryptocurrency with competitive processing rates.',
                color: 'bg-emerald-100 text-emerald-600'
              },
              {
                icon: Church,
                title: 'Project Fundraising',
                description: 'Create targeted campaigns for building funds, mission trips, and community projects with progress tracking.',
                color: 'bg-orange-100 text-orange-600'
              },
              {
                icon: CheckCircle,
                title: 'Automated Compliance',
                description: 'Automatic tax receipts, financial reporting, and regulatory compliance take the burden off your admin team.',
                color: 'bg-indigo-100 text-indigo-600'
              }
            ].map((feature, index) => (
              <Card key={index} className="shadow-lg border border-gray-200/50 card-hover">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Admin Dashboard Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Management Suite</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to manage your church's digital presence, from member management to financial oversight.</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-churpay-gradient rounded-xl flex items-center justify-center">
                  <Church className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">ChurPay Admin</h3>
                  <p className="text-gray-300">Super Administrator Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">System Healthy</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Churches', value: '524', change: '+12% this month', icon: Church, color: 'text-purple-400' },
                { title: 'Platform Revenue', value: 'R2.4M', change: '+18% this month', icon: TrendingUp, color: 'text-yellow-400' },
                { title: 'Active Users', value: '15.4K', change: '+8% this month', icon: Users, color: 'text-blue-400' },
                { title: 'Success Rate', value: '99.2%', change: 'Above target', icon: CheckCircle, color: 'text-green-400' }
              ].map((stat, index) => (
                <div key={index} className="glass-morphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white/80 text-sm font-medium">{stat.title}</h4>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 text-sm">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-morphism rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white font-semibold text-lg">Pending Approvals</h4>
                  <Badge className="bg-orange-500/20 text-orange-400">8 Pending</Badge>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'New Life Methodist', location: 'Johannesburg', time: '2 days ago' },
                    { name: 'Hope Community Center', location: 'Cape Town', time: '1 day ago' }
                  ].map((church, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Church className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{church.name}</h5>
                        <p className="text-gray-400 text-sm">{church.location} • Submitted {church.time}</p>
                      </div>
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white font-semibold text-lg">Payout Requests</h4>
                  <Badge className="bg-green-500/20 text-green-400">3 Active</Badge>
                </div>
                <div className="space-y-4">
                  {[
                    { amount: 'R8,500', church: 'Grace Baptist', type: 'Building Fund', status: 'approve' },
                    { amount: 'R3,200', church: 'Faith Community', type: 'Offerings', status: 'review' }
                  ].map((payout, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl">
                      <div className={`w-10 h-10 ${payout.status === 'approve' ? 'bg-green-500' : 'bg-orange-500'} rounded-xl flex items-center justify-center`}>
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{payout.amount}</h5>
                        <p className="text-gray-400 text-sm">{payout.church} • {payout.type}</p>
                      </div>
                      <Button 
                        size="sm" 
                        className={payout.status === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}
                      >
                        {payout.status === 'approve' ? 'Approve' : 'Review'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Security & Compliance */}
      <section id="security" className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Security & Compliance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Built to meet the highest financial security standards, ensuring your church's data and funds are always protected.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: Shield,
                  title: 'PCI DSS Level 1 Compliance',
                  description: 'The highest level of security certification for handling payment card data, ensuring your transactions are always secure.',
                  color: 'bg-green-100 text-green-600'
                },
                {
                  icon: CheckCircle,
                  title: 'End-to-End Encryption',
                  description: 'All data is encrypted in transit and at rest using AES-256 encryption, the same standard used by major banks.',
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  icon: Users,
                  title: 'Multi-Factor Authentication',
                  description: 'Advanced authentication protocols protect access to sensitive church financial data and admin functions.',
                  color: 'bg-purple-100 text-churpay-purple'
                },
                {
                  icon: CheckCircle,
                  title: 'Regulatory Compliance',
                  description: 'Automated compliance with SARB, FICA, and tax regulations, with complete audit trails for all transactions.',
                  color: 'bg-orange-100 text-orange-600'
                }
              ].map((security, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${security.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <security.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{security.title}</h3>
                    <p className="text-gray-600">{security.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <Card className="shadow-2xl border border-gray-200/50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-churpay-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-ring">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Security Score</h3>
                    <div className="text-5xl font-bold text-gradient mt-2">98.7%</div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Encryption Active', status: '100%', color: 'bg-green-50 text-green-500' },
                      { label: 'Access Control', status: '100%', color: 'bg-blue-50 text-blue-500' },
                      { label: 'Monitoring', status: '24/7', color: 'bg-purple-50 text-churpay-purple' }
                    ].map((metric, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 ${metric.color} rounded-xl`}>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium text-gray-800">{metric.label}</span>
                        </div>
                        <span className="font-semibold">{metric.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-80 animate-float">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center opacity-60 animate-float" style={{animationDelay: '1s'}}>
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">No subscriptions, no monthly fees. Pay only when you receive donations.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 transition-all duration-300 card-hover relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-churpay-gradient text-white">Pay As You Go</Badge>
              </div>
              
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple Pricing</h3>
                  <p className="text-gray-600 mb-8">One transparent rate for all churches, regardless of size</p>
                  <div className="text-5xl font-bold text-gray-900 mb-2">3.9%</div>
                  <p className="text-xl text-gray-500 mb-2">per transaction + R3</p>
                  <p className="text-sm text-gray-400">No monthly fees • No setup costs • No hidden charges</p>
                </div>
                
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">10%</span>
                    </div>
                    <span className="font-semibold text-gray-800">Annual Revenue Sharing</span>
                  </div>
                  <p className="text-gray-600 text-sm">Churches receive 10% of annual revenue generated from their transactions - growing your ministry while growing with us.</p>
                </div>
                
                <div className="space-y-4 mb-8 text-left">
                  {[
                    'Unlimited donation volume',
                    'Advanced donation forms',
                    'Recurring donations',
                    'Project fundraising campaigns',
                    'Real-time analytics & reporting',
                    'Member wallet system',
                    'Instant bank transfers',
                    'Email & SMS receipts',
                    'Multi-user church accounts',
                    '24/7 customer support',
                    'Bank-level security',
                    'Mobile-optimized platform'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-200"
                    onClick={() => window.location.href = '/church-registration'}
                  >
                    Register Your Church
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/church-registration'}
                  >
                    Join as Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Example: On a R100 donation, you keep R93 (R100 - 3.9% - R3 = R93)
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-churpay-purple" />
                <span>South African Based</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-churpay-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Church's Giving?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join hundreds of churches already using ChurPay to increase donations, streamline operations, and grow their ministry in the digital age.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/church-registration'}
                className="bg-white text-churpay-purple hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <span>Register Your Church</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                onClick={() => window.location.href = '/church-registration'}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Join as Member</span>
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>3.9% + R3 per transaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>10% annual revenue sharing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No monthly charges</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer id="support" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-churpay-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-2xl font-bold">ChurPay</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering churches with secure digital giving solutions. Built in South Africa, for the global church community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-churpay-purple transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-churpay-purple transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-churpay-purple transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Product</h3>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'Security', 'API Documentation', 'Integrations'].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Resources</h3>
              <ul className="space-y-4">
                {['Help Center', 'Getting Started', 'Best Practices', 'Case Studies', 'Blog'].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-churpay-purple mt-1" />
                  <div>
                    <p className="text-gray-400">Email</p>
                    <a href="mailto:support@churpay.com" className="text-white hover:text-churpay-purple transition-colors">support@churpay.com</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-churpay-purple mt-1" />
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <a href="tel:+27123456789" className="text-white hover:text-churpay-purple transition-colors">+27 12 345 6789</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-churpay-purple mt-1" />
                  <div>
                    <p className="text-gray-400">Address</p>
                    <p className="text-white">Cape Town, South Africa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 ChurPay. All rights reserved. Built with ❤️ for the church community.
              </p>
              <div className="flex space-x-6 text-sm">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="bg-churpay-gradient text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse-ring"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

    </div>
  );
}
