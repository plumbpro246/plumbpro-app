import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Edit2, Search, Tag } from "lucide-react";

export default function NotesPage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API}/notes`, { headers });
      setNotes(response.data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
      };

      if (editingNote) {
        await axios.put(`${API}/notes/${editingNote.id}`, data, { headers });
        toast.success("Note updated");
      } else {
        await axios.post(`${API}/notes`, data, { headers });
        toast.success("Note created");
      }
      
      setDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: "", content: "", tags: "" });
      fetchNotes();
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API}/notes/${id}`, { headers });
      toast.success("Note deleted");
      fetchNotes();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", ")
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingNote(null);
    setFormData({ title: "", content: "", tags: "" });
    setDialogOpen(true);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6" data-testid="notes-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Notes</h1>
          <p className="text-muted-foreground text-sm">Keep track of job details and reminders</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openNew}
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="new-note-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">
                {editingNote ? "Edit Note" : "New Note"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                  className="h-12"
                  required
                  data-testid="note-title-input"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note here..."
                  rows={6}
                  required
                  data-testid="note-content-input"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="job, inspection, reminder"
                  className="h-12"
                  data-testid="note-tags-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="save-note-btn"
              >
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
          data-testid="notes-search"
        />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No notes found matching your search" : "No notes yet. Create your first note!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="border border-border rounded-sm hover:border-[#FF5F00] transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-heading text-lg line-clamp-1">{note.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEdit(note)}
                      data-testid={`edit-note-${note.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(note.id)}
                      data-testid={`delete-note-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-xs rounded-sm"
                      >
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
