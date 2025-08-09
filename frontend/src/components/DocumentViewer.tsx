import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType: 'image' | 'pdf' | 'unknown';
}

export function DocumentViewer({ 
  isOpen, 
  onClose, 
  documentUrl, 
  documentName, 
  documentType 
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      // Check if this is a placeholder URL (for demo purposes)
      if (documentUrl.includes('via.placeholder.com') || documentUrl.includes('placeholder')) {
        toast({
          title: "Demo Document",
          description: "This is a sample document. In production, this would download the actual file.",
          variant: "default",
        });
        return;
      }

      // Check if URL is accessible
      const response = await fetch(documentUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`Document not accessible (${response.status})`);
      }

      // Proceed with download
      const fullResponse = await fetch(documentUrl);
      const blob = await fullResponse.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName || 'document';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "Download Started",
        description: `Downloading ${documentName}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unable to download the document",
        variant: "destructive",
      });
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const getDocumentIcon = () => {
    switch (documentType) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case 'image':
        return 'Image Document';
      case 'pdf':
        return 'PDF Document';
      default:
        return 'Document';
    }
  };

  if (!documentUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDocumentIcon()}
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {documentName}
                </DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  {getDocumentTypeLabel()}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {documentType === 'image' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(300, zoom + 25))}
                    disabled={zoom >= 300}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((rotation + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetView}
                  >
                    Reset
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {documentType === 'image' && (
            <div className="h-full flex items-center justify-center bg-gray-50 relative overflow-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">Loading document...</span>
                </div>
              )}
              
              {error && (
                <Card className="w-full max-w-md">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Unable to Load Document
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The document could not be loaded. This might be due to:
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-4">
                      <li>• Document not uploaded</li>
                      <li>• File format not supported</li>
                      <li>• Network connectivity issues</li>
                    </ul>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Try Download
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {!isLoading && !error && (
                <img
                  src={documentUrl}
                  alt={documentName}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </div>
          )}

          {documentType === 'pdf' && (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    PDF Document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    PDF viewing is not supported in this preview. Download the document to view it.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(documentUrl, '_blank')}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {documentType === 'unknown' && (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unknown Document Type
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This document type is not supported for preview. Download to view the content.
                  </p>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}