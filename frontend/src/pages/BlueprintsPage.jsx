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
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Trash2, Download, Eye, X, Loader2, ClipboardList } from "lucide-react";

export default function BlueprintsPage() {
  const { token } = useAuth();
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [takeoff, setTakeoff] = useState(null);
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

  const handleTakeoff = async (blueprint) => {
    setAnalyzing(blueprint.id);
    setTakeoff(null);
    try {
      const res = await axios.post(`${API}/blueprints/${blueprint.id}/takeoff`, {}, { headers, timeout: 120000 });
      setTakeoff(res.data);
      toast.success("Takeoff analysis complete!");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Blueprint not found");
      } else {
        toast.error(err.response?.data?.detail || "Analysis failed. Try again.");
      }
    } finally {
      setAnalyzing(null);
    }
  };

  const loadExistingTakeoff = async (blueprint) => {
    try {
      const res = await axios.get(`${API}/blueprints/${blueprint.id}/takeoff`, { headers });
      setTakeoff(res.data);
    } catch {
      setTakeoff(null);
    }
  };

  const deleteTakeoff = async (blueprintId) => {
    try {
      await axios.delete(`${API}/blueprints/${blueprintId}/takeoff`, { headers });
      setTakeoff(null);
      toast.success("Takeoff deleted — you can re-analyze");
    } catch {
      toast.error("Failed to delete takeoff");
    }
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
                {/* Takeoff Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-[#FF5F00] text-[#FF5F00] hover:bg-[#FF5F00] hover:text-white font-bold uppercase"
                  onClick={() => { loadExistingTakeoff(blueprint); handleTakeoff(blueprint); }}
                  disabled={analyzing === blueprint.id}
                  data-testid={`takeoff-blueprint-${blueprint.id}`}
                >
                  {analyzing === blueprint.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><ClipboardList className="w-4 h-4 mr-2" /> Pipe &amp; Fitting Takeoff</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Uploaded {new Date(blueprint.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Takeoff Results Panel */}
      {takeoff && takeoff.takeoff && (
        <Card className="border-2 border-[#003366]" data-testid="takeoff-results">
          <CardHeader className="bg-[#003366] text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading uppercase">Pipe & Fitting Takeoff</CardTitle>
                <p className="text-sm text-slate-300 mt-1">{takeoff.blueprint_name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-red-300"
                  onClick={() => deleteTakeoff(takeoff.blueprint_id)}
                  data-testid="delete-takeoff-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Re-analyze
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={() => setTakeoff(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {takeoff.takeoff.parse_error ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 p-4 rounded-sm">
                <p className="text-sm font-bold">AI Response (could not parse into structured format):</p>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{takeoff.takeoff.raw_response}</pre>
              </div>
            ) : (
              <>
                {takeoff.takeoff.project_name && (
                  <p className="text-sm font-bold uppercase">Project: {takeoff.takeoff.project_name}</p>
                )}

                {/* Sections */}
                {Object.entries(takeoff.takeoff.sections || {}).map(([key, section]) => (
                  <div key={key} className="border border-border rounded-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2">
                      <h3 className="font-bold text-sm uppercase">{section.label || key}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Pipes */}
                      {section.pipes && section.pipes.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Piping</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 px-2 text-xs font-bold uppercase">Size</th>
                                <th className="text-left py-1 px-2 text-xs font-bold uppercase">Material</th>
                                <th className="text-right py-1 px-2 text-xs font-bold uppercase">Length (ft)</th>
                                <th className="text-left py-1 px-2 text-xs font-bold uppercase">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.pipes.filter(p => p.length_ft > 0).map((pipe, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="py-1 px-2 font-mono font-bold">{pipe.size}</td>
                                  <td className="py-1 px-2">{pipe.material}</td>
                                  <td className="py-1 px-2 text-right font-mono">{pipe.length_ft}</td>
                                  <td className="py-1 px-2 text-muted-foreground text-xs">{pipe.notes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Fittings */}
                      {section.fittings && section.fittings.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Fittings</p>
                          <div className="flex flex-wrap gap-2">
                            {section.fittings.filter(f => f.qty > 0).map((fitting, i) => (
                              <Badge key={i} variant="outline" className="text-xs py-1 px-2 font-mono">
                                {fitting.qty}x {fitting.size} {fitting.type} ({fitting.material})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fixtures */}
                      {section.items && section.items.length > 0 && (
                        <div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 px-2 text-xs font-bold uppercase">Fixture Type</th>
                                <th className="text-right py-1 px-2 text-xs font-bold uppercase">Count</th>
                                <th className="text-right py-1 px-2 text-xs font-bold uppercase">DFU (each)</th>
                                <th className="text-right py-1 px-2 text-xs font-bold uppercase">Total DFU</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.items.filter(f => f.count > 0).map((item, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="py-1 px-2 font-bold">{item.type}</td>
                                  <td className="py-1 px-2 text-right font-mono">{item.count}</td>
                                  <td className="py-1 px-2 text-right font-mono">{item.dfu}</td>
                                  <td className="py-1 px-2 text-right font-mono font-bold">{item.count * item.dfu}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total DFU */}
                {takeoff.takeoff.total_dfu > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-sm p-4 text-center">
                    <p className="text-sm font-bold uppercase text-muted-foreground">Total Drainage Fixture Units</p>
                    <p className="text-3xl font-bold font-mono text-green-600">{takeoff.takeoff.total_dfu} DFU</p>
                  </div>
                )}

                {/* Notes */}
                {takeoff.takeoff.notes && takeoff.takeoff.notes.length > 0 && (
                  <div className="bg-muted p-4 rounded-sm">
                    <p className="text-xs font-bold uppercase mb-2">AI Notes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {takeoff.takeoff.notes.map((n, i) => <li key={i}>- {n}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
