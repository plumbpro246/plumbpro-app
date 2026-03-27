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
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

export default function CalendarPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "10:00",
    event_type: "job"
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/calendar`, { headers });
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/calendar`, formData, { headers });
      toast.success("Event created");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        start_time: "09:00",
        end_time: "10:00",
        event_type: "job"
      });
      fetchEvents();
    } catch (error) {
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API}/calendar/${id}`, { headers });
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateEvents = events.filter(e => e.date === selectedDateStr);
  
  const eventDates = events.map(e => e.date);

  const eventTypeColors = {
    job: "bg-blue-500",
    inspection: "bg-amber-500",
    meeting: "bg-purple-500",
    personal: "bg-green-500",
    general: "bg-slate-500"
  };

  return (
    <div className="space-y-6" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">Schedule jobs and appointments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="new-event-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                  className="h-12"
                  required
                  data-testid="event-title"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger className="h-12" data-testid="event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-12"
                  required
                  data-testid="event-date"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="h-12"
                    data-testid="event-start"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="h-12"
                    data-testid="event-end"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details..."
                  rows={3}
                  data-testid="event-description"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="save-event-btn"
              >
                Save Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDateSelect(date)}
              className="rounded-sm border-0 w-full"
              modifiers={{
                hasEvent: (date) => eventDates.includes(format(date, "yyyy-MM-dd"))
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  borderRadius: "4px"
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Day Events */}
        <Card>
          <CardHeader className="bg-[#003366] text-white rounded-t-sm">
            <CardTitle className="font-heading uppercase flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 border border-border rounded-sm hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${eventTypeColors[event.event_type]} text-white text-xs`}>
                            {event.event_type}
                          </Badge>
                        </div>
                        <h4 className="font-bold">{event.title}</h4>
                        {event.start_time && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {event.start_time} - {event.end_time}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(event.id)}
                        data-testid={`delete-event-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : events.filter(e => e.date >= format(new Date(), "yyyy-MM-dd")).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {events
                .filter(e => e.date >= format(new Date(), "yyyy-MM-dd"))
                .slice(0, 10)
                .map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-sm"
                  >
                    <div className={`w-2 h-10 ${eventTypeColors[event.event_type]} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="font-bold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), "EEE, MMM d")}
                        {event.start_time && ` at ${event.start_time}`}
                      </p>
                    </div>
                    <Badge className={`${eventTypeColors[event.event_type]} text-white text-xs`}>
                      {event.event_type}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
