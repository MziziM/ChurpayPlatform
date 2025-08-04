import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Calendar, 
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Image,
  FileText
} from "lucide-react";

interface ChurchProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChurchProjectModal({
  isOpen,
  onClose
}: ChurchProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    priority: "",
    beneficiaries: "",
    expectedOutcome: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span>Create New Project</span>
          </DialogTitle>
          <DialogDescription>
            Launch a new fundraising project for your church community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Basics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Project Details</h3>
            
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., New Sanctuary Building Fund"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your project goals, purpose, and impact..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building">Building & Infrastructure</SelectItem>
                    <SelectItem value="equipment">Equipment & Technology</SelectItem>
                    <SelectItem value="ministry">Ministry Programs</SelectItem>
                    <SelectItem value="missions">Missions & Outreach</SelectItem>
                    <SelectItem value="youth">Youth Programs</SelectItem>
                    <SelectItem value="community">Community Service</SelectItem>
                    <SelectItem value="education">Education & Training</SelectItem>
                    <SelectItem value="emergency">Emergency Relief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Financial Target</h3>
            
            <div>
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Set a realistic funding goal for your project
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Impact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Project Impact</h3>
            
            <div>
              <Label htmlFor="beneficiaries">Who Will Benefit?</Label>
              <Input
                id="beneficiaries"
                value={formData.beneficiaries}
                onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                placeholder="e.g., Church members, local community, youth groups"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expectedOutcome">Expected Outcome</Label>
              <Textarea
                id="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                placeholder="Describe the expected impact and outcomes of this project..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Project Image */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Project Image (Optional)</h3>
            
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="relative mt-1">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/project-image.jpg"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Add a compelling image to help donors connect with your project
              </p>
            </div>
          </div>

          {/* Project Preview */}
          {formData.title && formData.targetAmount && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Project Preview</h4>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{formData.title}</p>
                <p className="text-sm text-gray-600">{formData.description.substring(0, 100)}...</p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Target: R{parseFloat(formData.targetAmount || '0').toLocaleString()}
                  </Badge>
                  {formData.category && (
                    <Badge variant="secondary">
                      {formData.category.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.targetAmount}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  Create Project
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}