import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Target,
  Users,
  TrendingUp,
  Church
} from "lucide-react";
import { GetStartedModal } from "@/components/GetStartedModal";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const { data: sponsoredProjects, isLoading } = useQuery({
    queryKey: ["/api/projects/sponsored", { limit: 50 }],
    enabled: true,
  });

  const { data: allProjects } = useQuery({
    queryKey: ["/api/projects/all"],
    enabled: true,
  });

  // Combine sponsored and regular projects
  const projects = sponsoredProjects || [];
  
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.churchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const categories = [
    { id: "all", name: "All Projects", count: projects.length },
    { id: "building", name: "Building & Infrastructure", count: 8 },
    { id: "community", name: "Community Outreach", count: 12 },
    { id: "education", name: "Education & Youth", count: 6 },
    { id: "missions", name: "Missions & Evangelism", count: 4 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-pink-200 mr-3" />
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                Community Impact Projects
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Make a Difference Today
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Support meaningful initiatives that are transforming communities across South Africa. 
              Every contribution brings hope and positive change.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">{projects.length}+</div>
                <p className="text-purple-100">Active Projects</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">R2.4M+</div>
                <p className="text-purple-100">Funds Raised</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">150+</div>
                <p className="text-purple-100">Churches Participating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, churches, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const progressPercentage = Math.min(
              (parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100, 
              100
            );
            
            return (
              <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Church className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-purple-600 font-medium">Project Image</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-700 shadow-sm">
                      {progressPercentage.toFixed(0)}% Funded
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600/90 text-white">
                      Sponsored
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                      {project.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Church className="h-4 w-4 mr-1" />
                    <span className="font-medium">{project.churchName}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        R{parseFloat(project.currentAmount).toLocaleString()} / 
                        R{parseFloat(project.targetAmount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {project.donorCount || 0} supporters
                      </span>
                      {project.endDate && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Ends {new Date(project.endDate).toLocaleDateString('en-ZA', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      onClick={() => setRegistrationModalOpen(true)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Support
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filters.</p>
          </div>
        )}
      </div>

      <GetStartedModal 
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
      />
    </div>
  );
}