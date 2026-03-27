import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, Trash2, X, DollarSign } from "lucide-react";

export default function MaterialsPage() {
  const { token } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [formData, setFormData] = useState({
    job_name: "",
    items: [{ name: "", quantity: 1, unit: "ea", unit_price: 0, notes: "" }]
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${API}/materials`, { headers });
      setLists(response.data);
    } catch (error) {
      toast.error("Failed to load material lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: 1, unit: "ea", unit_price: 0, notes: "" }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/materials`, formData, { headers });
      toast.success("Material list created");
      setDialogOpen(false);
      setFormData({
        job_name: "",
        items: [{ name: "", quantity: 1, unit: "ea", unit_price: 0, notes: "" }]
      });
      fetchLists();
    } catch (error) {
      toast.error("Failed to save material list");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material list?")) return;
    try {
      await axios.delete(`${API}/materials/${id}`, { headers });
      toast.success("Material list deleted");
      setSelectedList(null);
      fetchLists();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const units = ["ea", "ft", "in", "gal", "lb", "box", "roll", "bag", "set"];

  return (
    <div className="space-y-6" data-testid="materials-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Job Materials</h1>
          <p className="text-muted-foreground text-sm">Track materials needed for each job</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="new-material-list-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">Create Material List</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Job Name</Label>
                <Input
                  value={formData.job_name}
                  onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                  placeholder="e.g., 123 Main St - Bathroom"
                  className="h-12"
                  required
                  data-testid="material-job-input"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wide">Materials</Label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-muted rounded-sm">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        required
                        data-testid={`material-name-${index}`}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                        data-testid={`material-qty-${index}`}
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        className="h-10 rounded-sm border border-input bg-background px-3"
                        data-testid={`material-unit-${index}`}
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Unit $"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                        data-testid={`material-price-${index}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="bg-muted p-3 rounded-sm text-right">
                <span className="text-sm text-muted-foreground">Estimated Total: </span>
                <span className="text-lg font-bold">
                  ${formData.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0).toFixed(2)}
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="save-material-list-btn"
              >
                Save Material List
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lists Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No material lists yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card 
              key={list.id} 
              className={`cursor-pointer transition-all ${
                selectedList?.id === list.id ? "border-[#FF5F00]" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedList(selectedList?.id === list.id ? null : list)}
              data-testid={`material-list-${list.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">{list.job_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {list.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-[#FF5F00]">${list.total_cost.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(list.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected List Detail */}
      {selectedList && (
        <Card className="border-2 border-[#003366]">
          <CardHeader className="bg-[#003366] text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading uppercase">{selectedList.job_name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-red-400"
                onClick={() => handleDelete(selectedList.id)}
                data-testid="delete-material-list"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold uppercase">Item</TableHead>
                  <TableHead className="font-bold uppercase">Qty</TableHead>
                  <TableHead className="font-bold uppercase">Unit</TableHead>
                  <TableHead className="font-bold uppercase text-right">Unit Price</TableHead>
                  <TableHead className="font-bold uppercase text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedList.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted">
                  <TableCell colSpan={4} className="font-bold uppercase text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-[#FF5F00]">
                    ${selectedList.total_cost.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
