import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Target, Heart, Calendar, Users, 
  Search, Filter, Building2, 
  TrendingUp, Clock, CheckCircle,
  ArrowRight, Star
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  church: string;
  churchLogo?: string;
  target: number;
  current: number;
  supporters: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'urgent';
  image?: string;
  featured?: boolean;
}

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsorProject: (projectId: string) => void;
}

// Mock projects data - in real app this would come from API
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'New Sanctuary Building',
    description: 'Expanding our worship space to accommodate our growing congregation and enhance our community gatherings.',
    church: 'Grace Baptist Church',
    churchLogo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    target: 350000,
    current: 185000,
    supporters: 89,
    deadline: '2025-06-30',
    category: 'Infrastructure',
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Kenya Mission Trip',
    description: 'Supporting orphanages and building wells in rural Kenya to bring hope and clean water to communities.',
    church: 'Grace Baptist Church',
    target: 75000,
    current: 45000,
    supporters: 34,
    deadline: '2025-03-15',
    category: 'Mission',
    status: 'urgent',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Youth Ministry Equipment',
    description: 'Sound system and multimedia equipment for engaging youth programs and worship experiences.',
    church: 'Grace Baptist Church',
    target: 25000,
    current: 18500,
    supporters: 22,
    deadline: '2025-02-28',
    category: 'Equipment',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Community Food Bank',
    description: 'Establishing a food bank to serve families in need within our community and surrounding areas.',
    church: 'Hope Community Church',
    target: 50000,
    current: 35000,
    supporters: 67,
    deadline: '2025-04-20',
    category: 'Community',
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1593113616828-6f22bde41143?w=300&h=200&fit=crop'
  },
  {
    id: '5',
    name: 'Children\'s Playground',
    description: 'Creating a safe and fun playground for children during church events and community programs.',
    church: 'New Life Chapel',
    target: 40000,
    current: 40000,
    supporters: 58,
    deadline: '2024-12-31',
    category: 'Community',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
  }
];

export function ProjectsModal({ isOpen, onClose, onSponsorProject }: ProjectsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = ['all', 'Infrastructure', 'Mission', 'Equipment', 'Community'];
  const statuses = ['all', 'active', 'urgent', 'completed'];

  const filteredProjects = MOCK_PROJECTS.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.church.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-2xl font-bold">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <span>Church Projects</span>
                <p className="text-sm font-normal text-purple-100 mt-1">
                  Support meaningful projects in your community
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, churches, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : 
                     status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Projects */}
          {selectedCategory === 'all' && selectedStatus === 'all' && !searchQuery && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Featured Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.filter(p => p.featured).map((project) => (
                  <Card key={project.id} className="border-0 shadow-lg rounded-2xl overflow-hidden">
                    {project.image && (
                      <div className="h-32 bg-cover bg-center" style={{backgroundImage: `url(${project.image})`}}>
                        <div className="h-full bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                          <Badge className={`${getStatusColor(project.status)} border`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status}</span>
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>{project.church}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">R {project.current.toLocaleString()} raised</span>
                            <span className="font-medium">R {project.target.toLocaleString()}</span>
                          </div>
                          <Progress value={getProgressPercentage(project.current, project.target)} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{project.supporters}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onSponsorProject(project.id)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Sponsor
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? `Filtered Projects (${filteredProjects.length})` 
                : 'All Projects'}
            </h3>
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {project.image && (
                        <div className="w-24 h-20 flex-shrink-0 rounded-xl bg-cover bg-center" 
                             style={{backgroundImage: `url(${project.image})`}}>
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                              <Building2 className="h-4 w-4" />
                              <span>{project.church}</span>
                              <Badge variant="outline" className="ml-2">
                                {project.category}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} border`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">R {project.current.toLocaleString()} raised</span>
                            <span className="font-medium">R {project.target.toLocaleString()} goal</span>
                          </div>
                          <Progress value={getProgressPercentage(project.current, project.target)} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{project.supporters} supporters</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => onSponsorProject(project.id)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Sponsor Project
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}