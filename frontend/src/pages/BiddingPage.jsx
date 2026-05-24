import { useState, useEffect, useCallback } from "react";
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
import { Plus, DollarSign, Trash2, Send, Check, X, Download, Share2, Star, ListPlus } from "lucide-react";
import { exportBidPDF } from "@/services/pdfExportService";
import { shareBid } from "@/services/shareService";

const blankMaterial = () => ({ name: "", quantity: 1, unit_price: 0 });

const blankForm = () => ({
  job_name: "",
  client_name: "",
  client_contact: "",
  description: "",
  labor_hours: 0,
  hourly_rate: 85,
  materials: [blankMaterial()],
  markup_percent: 15,
  notes: ""
});

export default function BiddingPage() {
  const { token } = useAuth();
  const [bids, setBids] = useState([]);
  const [commonMaterials, setCommonMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commonPickerOpen, setCommonPickerOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [formData, setFormData] = useState(blankForm());

  const headers = { Authorization: `Bearer ${token}` };

  const fetchBids = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/bids`, { headers });
      setBids(response.data);
    } catch {
      toast.error("Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCommonMaterials = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/common-materials`, { headers });
      setCommonMaterials(response.data);
    } catch {
      // silent — non-critical
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBids();
    fetchCommonMaterials();
  }, [fetchBids, fetchCommonMaterials]);

  // ---------- Material line item handlers ----------
  const updateMaterial = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.materials];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, materials: next };
    });
  };

  const addMaterialRow = () => {
    setFormData((prev) => ({ ...prev, materials: [...prev.materials, blankMaterial()] }));
  };

  const removeMaterialRow = (index) => {
    setFormData((prev) => {
      const next = prev.materials.filter((_, i) => i !== index);
      return { ...prev, materials: next.length ? next : [blankMaterial()] };
    });
  };

  const saveToCommon = async (mat) => {
    if (!mat.name.trim()) {
      toast.error("Add a material name first");
      return;
    }
    try {
      await axios.post(
        `${API}/common-materials`,
        { name: mat.name.trim(), unit_price: parseFloat(mat.unit_price) || 0 },
        { headers }
      );
      toast.success(`Saved "${mat.name}" to favorites`);
      fetchCommonMaterials();
    } catch {
      toast.error("Failed to save");
    }
  };

  const addFromCommon = (item) => {
    setFormData((prev) => {
      const lastEmptyIdx = prev.materials.findIndex((m) => !m.name.trim());
      const newItem = { name: item.name, quantity: 1, unit_price: item.unit_price };
      const next = [...prev.materials];
      if (lastEmptyIdx >= 0) {
        next[lastEmptyIdx] = newItem;
      } else {
        next.push(newItem);
      }
      return { ...prev, materials: next };
    });
    setCommonPickerOpen(false);
  };

  const deleteCommon = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/common-materials/${id}`, { headers });
      fetchCommonMaterials();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ---------- Bid submit / status / delete ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMaterials = formData.materials
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        quantity: parseFloat(m.quantity) || 0,
        unit_price: parseFloat(m.unit_price) || 0
      }));
    const materialTotal = cleanMaterials.reduce((s, m) => s + m.quantity * m.unit_price, 0);
    try {
      await axios.post(
        `${API}/bids`,
        {
          job_name: formData.job_name,
          client_name: formData.client_name,
          client_contact: formData.client_contact,
          description: formData.description,
          labor_hours: parseFloat(formData.labor_hours) || 0,
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          material_cost: materialTotal,
          materials: cleanMaterials,
          markup_percent: parseFloat(formData.markup_percent) || 0,
          notes: formData.notes
        },
        { headers }
      );
      toast.success("Bid created");
      setDialogOpen(false);
      setFormData(blankForm());
      fetchBids();
    } catch {
      toast.error("Failed to save bid");
    }
  };

  const handleStatusChange = async (bidId, status) => {
    try {
      await axios.put(`${API}/bids/${bidId}/status?status=${status}`, {}, { headers });
      toast.success(`Bid marked as ${status}`);
      fetchBids();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bid?")) return;
    try {
      await axios.delete(`${API}/bids/${id}`, { headers });
      toast.success("Bid deleted");
      setSelectedBid(null);
      fetchBids();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleExportBidPDF = async (bidId) => {
    try {
      const response = await axios.get(`${API}/export/bids/${bidId}`, { headers });
      exportBidPDF(response.data);
      toast.success("Bid PDF exported");
    } catch {
      toast.error("Failed to export bid");
    }
  };

  const handleShareBid = async (bid) => {
    try {
      const result = await shareBid(bid);
      if (result.success) {
        toast.success(result.method === "mailto" ? "Email client opened" : "Shared successfully");
      }
    } catch {
      toast.error("Failed to share bid");
    }
  };

  // ---------- Live totals ----------
  const laborCost = (parseFloat(formData.labor_hours) || 0) * (parseFloat(formData.hourly_rate) || 0);
  const materialTotal = formData.materials.reduce(
    (s, m) => s + (parseFloat(m.quantity) || 0) * (parseFloat(m.unit_price) || 0),
    0
  );
  const subtotal = laborCost + materialTotal;
  const markup = subtotal * ((parseFloat(formData.markup_percent) || 0) / 100);
  const total = subtotal + markup;

  const statusColors = {
    draft: "bg-slate-500",
    sent: "bg-blue-500",
    accepted: "bg-green-500",
    rejected: "bg-red-500"
  };

  return (
    <div className="space-y-6" data-testid="bidding-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Job Bidding</h1>
          <p className="text-muted-foreground text-sm">Create and manage job bids</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="new-bid-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> New Bid
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">Create Job Bid</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">Job Name</Label>
                  <Input
                    value={formData.job_name}
                    onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                    placeholder="e.g., Bathroom Renovation"
                    className="h-12"
                    required
                    data-testid="bid-job-name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">Client Name</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Client name"
                    className="h-12"
                    required
                    data-testid="bid-client-name"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Client Contact</Label>
                <Input
                  value={formData.client_contact}
                  onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })}
                  placeholder="Phone or email"
                  className="h-12"
                  data-testid="bid-client-contact"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Job Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scope of work..."
                  rows={3}
                  required
                  data-testid="bid-description"
                />
              </div>

              {/* LABOR */}
              <div className="bg-muted p-4 rounded-sm space-y-4">
                <h3 className="font-bold uppercase text-sm">Labor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold uppercase tracking-wide">Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.labor_hours}
                      onChange={(e) => setFormData({ ...formData, labor_hours: e.target.value })}
                      className="h-12"
                      data-testid="bid-labor-hours"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold uppercase tracking-wide">Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      className="h-12"
                      data-testid="bid-hourly-rate"
                    />
                  </div>
                </div>
                <div className="text-right text-sm">
                  Labor Cost: <span className="font-bold">${laborCost.toFixed(2)}</span>
                </div>
              </div>

              {/* MATERIALS (line items) */}
              <div className="bg-muted p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-bold uppercase text-sm">Materials</h3>
                  <div className="flex gap-2">
                    <Dialog open={commonPickerOpen} onOpenChange={setCommonPickerOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          disabled={commonMaterials.length === 0}
                          data-testid="quick-add-common-btn"
                        >
                          <ListPlus className="w-4 h-4 mr-1" /> Quick Add
                          {commonMaterials.length > 0 && (
                            <span className="ml-1 text-xs opacity-70">({commonMaterials.length})</span>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-heading uppercase">Common Materials</DialogTitle>
                        </DialogHeader>
                        {commonMaterials.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No saved materials yet. Tap the ⭐ on a line item to save it.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {commonMaterials.map((cm) => (
                              <div
                                key={cm.id}
                                className="flex items-center justify-between p-3 border rounded-sm hover:border-[#FF5F00] cursor-pointer"
                                onClick={() => addFromCommon(cm)}
                                data-testid={`common-mat-${cm.id}`}
                              >
                                <div>
                                  <p className="font-medium text-sm">{cm.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ${cm.unit_price.toFixed(2)} / unit
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={(e) => deleteCommon(cm.id, e)}
                                  data-testid={`delete-common-${cm.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={addMaterialRow}
                      data-testid="add-material-row-btn"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.materials.map((m, idx) => {
                    const lineTotal = (parseFloat(m.quantity) || 0) * (parseFloat(m.unit_price) || 0);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-end p-2 bg-background rounded-sm border"
                        data-testid={`material-row-${idx}`}
                      >
                        <div className="col-span-12 md:col-span-5">
                          <Label className="text-[10px] uppercase text-muted-foreground">Item</Label>
                          <Input
                            value={m.name}
                            onChange={(e) => updateMaterial(idx, "name", e.target.value)}
                            placeholder='e.g., 3" PVC pipe'
                            className="h-10"
                            data-testid={`material-name-${idx}`}
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Qty</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={m.quantity}
                            onChange={(e) => updateMaterial(idx, "quantity", e.target.value)}
                            className="h-10"
                            data-testid={`material-qty-${idx}`}
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Unit $</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={m.unit_price}
                            onChange={(e) => updateMaterial(idx, "unit_price", e.target.value)}
                            className="h-10"
                            data-testid={`material-unit-${idx}`}
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                          <Label className="text-[10px] uppercase text-muted-foreground">Total</Label>
                          <p className="h-10 flex items-center justify-end font-bold text-sm">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex gap-1 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-amber-500 hover:text-amber-600"
                            onClick={() => saveToCommon(m)}
                            title="Save to favorites"
                            data-testid={`save-common-${idx}`}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-700"
                            onClick={() => removeMaterialRow(idx)}
                            title="Remove row"
                            data-testid={`remove-material-${idx}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-bold uppercase">Materials Total</span>
                  <span className="text-lg font-bold text-[#003366]" data-testid="materials-total">
                    ${materialTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* MARKUP */}
              <div className="bg-muted p-4 rounded-sm">
                <Label className="text-sm font-bold uppercase tracking-wide">Markup (%)</Label>
                <Input
                  type="number"
                  step="1"
                  value={formData.markup_percent}
                  onChange={(e) => setFormData({ ...formData, markup_percent: e.target.value })}
                  className="h-12"
                  data-testid="bid-markup"
                />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  data-testid="bid-notes"
                />
              </div>

              <div className="bg-[#003366] text-white p-4 rounded-sm">
                <div className="flex justify-between text-sm mb-1">
                  <span>Labor:</span><span>${laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Materials:</span><span>${materialTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Markup ({formData.markup_percent}%):</span><span>${markup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-slate-600 pt-2">
                  <span>TOTAL BID:</span><span className="text-[#FF5F00]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="save-bid-btn"
              >
                Create Bid
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{bids.length}</p>
            <p className="text-xs text-muted-foreground uppercase">Total Bids</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{bids.filter((b) => b.status === "sent").length}</p>
            <p className="text-xs text-muted-foreground uppercase">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{bids.filter((b) => b.status === "accepted").length}</p>
            <p className="text-xs text-muted-foreground uppercase">Won</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#FF5F00]">
              ${bids.filter((b) => b.status === "accepted").reduce((s, b) => s + b.total_bid, 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground uppercase">Won Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Bids Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : bids.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bids yet. Create your first bid!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bids.map((bid) => (
            <Card
              key={bid.id}
              className={`cursor-pointer transition-all ${
                selectedBid?.id === bid.id ? "border-[#FF5F00]" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedBid(selectedBid?.id === bid.id ? null : bid)}
              data-testid={`bid-card-${bid.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">{bid.job_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{bid.client_name}</p>
                  </div>
                  <Badge className={`${statusColors[bid.status]} text-white uppercase text-xs`}>
                    {bid.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#FF5F00]">${bid.total_bid.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(bid.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Bid Detail */}
      {selectedBid && (
        <Card className="border-2 border-[#003366]">
          <CardHeader className="bg-[#003366] text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading uppercase">{selectedBid.job_name}</CardTitle>
                <p className="text-slate-300">{selectedBid.client_name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-red-400"
                  onClick={() => handleDelete(selectedBid.id)}
                  data-testid="delete-bid"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">{selectedBid.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Labor ({selectedBid.labor_hours}h × ${selectedBid.hourly_rate})</p>
                <p className="font-bold">${selectedBid.labor_cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Materials</p>
                <p className="font-bold">${selectedBid.material_cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Markup ({selectedBid.markup_percent}%)</p>
                <p className="font-bold">${selectedBid.markup_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Bid</p>
                <p className="font-bold text-xl text-[#FF5F00]">${selectedBid.total_bid.toFixed(2)}</p>
              </div>
            </div>

            {selectedBid.materials && selectedBid.materials.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs uppercase font-bold mb-2 text-muted-foreground">Material Breakdown</p>
                <div className="space-y-1 text-sm">
                  {selectedBid.materials.map((m, i) => (
                    <div key={i} className="flex justify-between" data-testid={`detail-material-${i}`}>
                      <span>
                        {m.name}{" "}
                        <span className="text-muted-foreground">
                          ({m.quantity} × ${m.unit_price.toFixed(2)})
                        </span>
                      </span>
                      <span className="font-medium">${(m.quantity * m.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleExportBidPDF(selectedBid.id)}
                data-testid="export-bid"
              >
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShareBid(selectedBid)}
                data-testid="share-bid"
              >
                <Share2 className="w-4 h-4 mr-2" /> Email to Client
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange(selectedBid.id, "sent")}
                disabled={selectedBid.status !== "draft"}
                data-testid="send-bid"
              >
                <Send className="w-4 h-4 mr-2" /> Mark Sent
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => handleStatusChange(selectedBid.id, "accepted")}
                data-testid="accept-bid"
              >
                <Check className="w-4 h-4 mr-2" /> Won
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange(selectedBid.id, "rejected")}
                data-testid="reject-bid"
              >
                <X className="w-4 h-4 mr-2" /> Lost
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
