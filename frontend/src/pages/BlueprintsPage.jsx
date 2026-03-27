import { useState, useEffect, useRef } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Trash2, Download, Eye, X } from "lucide-react";

export default function BlueprintsPage() {
  const { token } = useAuth();
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchBlueprints = async () => {
    try {
      const response = await axios.get(`${API}/blueprints`, { headers });
      setBlueprints(response.data);
    } catch (error) {
      toast.error("Failed to load blueprints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }
      setSelectedFile(file);
      if (!formData.name) {
        setFormData({ ...formData, name: file.name.replace('.pdf', '') });
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("name", formData.name);
      uploadData.append("description", formData.description);

      await axios.post(
        `${API}/blueprints?name=${encodeURIComponent(formData.name)}&description=${encodeURIComponent(formData.description)}`,
        uploadData,
        { 
          headers: { 
            ...headers,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Blueprint uploaded");
      setDialogOpen(false);
      setFormData({ name: "", description: "" });
      setSelectedFile(null);
      fetchBlueprints();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blueprint?")) return;
    try {
      await axios.delete(`${API}/blueprints/${id}`, { headers });
      toast.success("Blueprint deleted");
      setSelectedBlueprint(null);
      fetchBlueprints();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleView = async (blueprint) => {
    try {
      const response = await axios.get(`${API}/blueprints/${blueprint.id}`, { headers });
      const { file_data, file_name } = response.data;
      
      // Create blob from base64
      const byteCharacters = atob(file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Failed to load blueprint");
    }
  };

  const handleDownload = async (blueprint) => {
    try {
      const response = await axios.get(`${API}/blueprints/${blueprint.id}`, { headers });
      const { file_data, file_name } = response.data;
      
      // Create download link
      const byteCharacters = atob(file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6" data-testid="blueprints-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-[#FF5F00]" />
            Blueprints
          </h1>
          <p className="text-muted-foreground text-sm">Upload and manage PDF blueprints</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="upload-blueprint-btn"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Blueprint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">Upload Blueprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Blueprint Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 123 Main St - Floor Plan"
                  className="h-12"
                  required
                  data-testid="blueprint-name"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={2}
                  data-testid="blueprint-description"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">PDF File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="blueprint-file-input"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-input rounded-sm p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-6 h-6 text-[#FF5F00]" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to select PDF file (max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                disabled={uploading || !selectedFile}
                data-testid="submit-blueprint-btn"
              >
                {uploading ? "Uploading..." : "Upload Blueprint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero Image */}
      <Card className="overflow-hidden">
        <div 
          className="h-32 md:h-48 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1754780960162-839cda44d736?crop=entropy&cs=srgb&fm=jpg&q=85')"
          }}
        />
      </Card>

      {/* Blueprints Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : blueprints.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No blueprints uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">Upload PDF blueprints to access them in the field</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((blueprint) => (
            <Card 
              key={blueprint.id}
              className="hover:border-primary/50 transition-colors"
              data-testid={`blueprint-card-${blueprint.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-sm flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-heading text-base truncate">{blueprint.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{blueprint.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(blueprint.file_size)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {blueprint.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{blueprint.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(blueprint)}
                    data-testid={`view-blueprint-${blueprint.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(blueprint)}
                    data-testid={`download-blueprint-${blueprint.id}`}
                  >
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(blueprint.id)}
                    data-testid={`delete-blueprint-${blueprint.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Uploaded {new Date(blueprint.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
