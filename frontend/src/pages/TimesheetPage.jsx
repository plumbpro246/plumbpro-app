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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, Trash2, CalendarDays, Download, FileText, MapPin, Play, Square } from "lucide-react";
import { exportTimesheetPDF } from "@/services/pdfExportService";
import geofenceService from "@/services/geofenceService";

export default function TimesheetPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [gpsDialogOpen, setGpsDialogOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [gpsJobName, setGpsJobName] = useState("");
  const [exportRange, setExportRange] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0]
  });
  const [formData, setFormData] = useState({
    job_name: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "17:00",
    break_minutes: 30,
    notes: ""
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API}/timesheets`, { headers });
      setEntries(response.data);
    } catch (error) {
      toast.error("Failed to load timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    
    // Initialize geofence service
    const initGPS = async () => {
      try {
        await geofenceService.init({
          onJobEnter: (job) => {
            setActiveJob(job);
            toast.success(`Started tracking: ${job.name}`);
          },
          onJobExit: async (completedJob) => {
            setActiveJob(null);
            // Auto-create timesheet entry
            const entry = {
              job_name: completedJob.name,
              date: new Date(completedJob.startTime).toISOString().split("T")[0],
              start_time: new Date(completedJob.startTime).toTimeString().slice(0, 5),
              end_time: new Date(completedJob.endTime).toTimeString().slice(0, 5),
              break_minutes: 0,
              notes: "Auto-tracked via GPS"
            };
            try {
              await axios.post(`${API}/timesheets`, entry, { headers });
              toast.success(`Time logged: ${completedJob.hoursWorked.toFixed(2)} hours`);
              fetchEntries();
            } catch (e) {
              toast.error("Failed to auto-log time");
            }
          }
        });
        setActiveJob(geofenceService.getActiveJob());
      } catch (e) {
        console.log("GPS init error:", e);
      }
    };
    initGPS();
  }, []);

  const handleGPSClockIn = async () => {
    if (!gpsJobName.trim()) {
      toast.error("Enter a job name");
      return;
    }
    try {
      const job = await geofenceService.clockInAtCurrentLocation(gpsJobName);
      setActiveJob(job);
      setGpsDialogOpen(false);
      setGpsJobName("");
      toast.success(`Clocked in at ${job.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to clock in. Check GPS permissions.");
    }
  };

  const handleGPSClockOut = async () => {
    try {
      const completedJob = await geofenceService.clockOut();
      if (completedJob) {
        // Create timesheet entry
        const entry = {
          job_name: completedJob.name,
          date: new Date(completedJob.startTime).toISOString().split("T")[0],
          start_time: new Date(completedJob.startTime).toTimeString().slice(0, 5),
          end_time: new Date(completedJob.endTime).toTimeString().slice(0, 5),
          break_minutes: 0,
          notes: "GPS tracked"
        };
        await axios.post(`${API}/timesheets`, entry, { headers });
        toast.success(`Clocked out: ${completedJob.hoursWorked.toFixed(2)} hours logged`);
        fetchEntries();
      }
      setActiveJob(null);
    } catch (error) {
      toast.error("Failed to clock out");
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(
        `${API}/export/timesheets?start_date=${exportRange.start_date}&end_date=${exportRange.end_date}`,
        { headers }
      );
      exportTimesheetPDF(response.data);
      toast.success("PDF exported successfully");
      setExportDialogOpen(false);
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/timesheets`, formData, { headers });
      toast.success("Time entry added");
      setDialogOpen(false);
      setFormData({
        job_name: "",
        date: new Date().toISOString().split("T")[0],
        start_time: "08:00",
        end_time: "17:00",
        break_minutes: 30,
        notes: ""
      });
      fetchEntries();
    } catch (error) {
      toast.error("Failed to save time entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${API}/timesheets/${id}`, { headers });
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + e.hours_worked, 0);
  const thisWeekEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return entryDate >= weekStart;
  });
  const weeklyHours = thisWeekEntries.reduce((sum, e) => sum + e.hours_worked, 0);

  return (
    <div className="space-y-6" data-testid="timesheet-page">
      {/* GPS Clock In/Out Banner */}
      {activeJob ? (
        <Card className="bg-green-500 text-white border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div>
                <p className="font-bold">Currently Tracking: {activeJob.name}</p>
                <p className="text-sm text-green-100">Started at {activeJob.startTimeFormatted}</p>
              </div>
            </div>
            <Button 
              onClick={handleGPSClockOut}
              variant="secondary"
              className="font-bold"
              data-testid="gps-clock-out"
            >
              <Square className="w-4 h-4 mr-2" /> Clock Out
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#003366] text-white border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#FF5F00]" />
              <div>
                <p className="font-bold">GPS Time Tracking</p>
                <p className="text-sm text-slate-300">Auto-track time when you arrive at job sites</p>
              </div>
            </div>
            <Dialog open={gpsDialogOpen} onOpenChange={setGpsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold"
                  data-testid="gps-clock-in-btn"
                >
                  <Play className="w-4 h-4 mr-2" /> Clock In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl uppercase">GPS Clock In</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will record your current location and start tracking time. 
                    Time will be logged automatically when you clock out or leave the area.
                  </p>
                  <div>
                    <Label className="text-sm font-bold uppercase tracking-wide">Job Name</Label>
                    <Input
                      value={gpsJobName}
                      onChange={(e) => setGpsJobName(e.target.value)}
                      placeholder="e.g., 123 Main St - Kitchen"
                      className="h-12"
                      data-testid="gps-job-name"
                    />
                  </div>
                  <Button 
                    onClick={handleGPSClockIn}
                    className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                    data-testid="confirm-gps-clock-in"
                  >
                    <MapPin className="w-4 h-4 mr-2" /> Start Tracking
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Timesheet</h1>
          <p className="text-muted-foreground text-sm">Track your work hours by job</p>
        </div>
        <div className="flex gap-2">
          {/* Export Dialog */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="font-bold uppercase"
                data-testid="export-timesheet-btn"
              >
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl uppercase">Export Timesheet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">Start Date</Label>
                  <Input
                    type="date"
                    value={exportRange.start_date}
                    onChange={(e) => setExportRange({ ...exportRange, start_date: e.target.value })}
                    className="h-12"
                    data-testid="export-start-date"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">End Date</Label>
                  <Input
                    type="date"
                    value={exportRange.end_date}
                    onChange={(e) => setExportRange({ ...exportRange, end_date: e.target.value })}
                    className="h-12"
                    data-testid="export-end-date"
                  />
                </div>
                <Button 
                  onClick={handleExportPDF}
                  className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                  data-testid="confirm-export-btn"
                >
                  <FileText className="w-4 h-4 mr-2" /> Generate PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
                data-testid="new-timesheet-btn"
              >
                <Plus className="w-4 h-4 mr-2" /> Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">Log Time Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Job Name</Label>
                <Input
                  value={formData.job_name}
                  onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                  placeholder="e.g., 123 Main St - Kitchen Remodel"
                  className="h-12"
                  required
                  data-testid="timesheet-job-input"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-12"
                  required
                  data-testid="timesheet-date-input"
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
                    required
                    data-testid="timesheet-start-input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wide">End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="h-12"
                    required
                    data-testid="timesheet-end-input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Break (minutes)</Label>
                <Input
                  type="number"
                  value={formData.break_minutes}
                  onChange={(e) => setFormData({ ...formData, break_minutes: parseInt(e.target.value) || 0 })}
                  className="h-12"
                  data-testid="timesheet-break-input"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wide">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about the work done"
                  rows={3}
                  data-testid="timesheet-notes-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="save-timesheet-btn"
              >
                Save Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#003366] text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-[#FF5F00]" />
              <div>
                <p className="text-sm text-slate-300 uppercase font-bold">This Week</p>
                <p className="text-2xl font-bold">{weeklyHours.toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground uppercase font-bold">Total Logged</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No time entries yet. Start logging your hours!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading uppercase">Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold uppercase">Date</TableHead>
                    <TableHead className="font-bold uppercase">Job</TableHead>
                    <TableHead className="font-bold uppercase">Start</TableHead>
                    <TableHead className="font-bold uppercase">End</TableHead>
                    <TableHead className="font-bold uppercase">Break</TableHead>
                    <TableHead className="font-bold uppercase">Hours</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{entry.job_name}</TableCell>
                      <TableCell>{entry.start_time}</TableCell>
                      <TableCell>{entry.end_time}</TableCell>
                      <TableCell>{entry.break_minutes}m</TableCell>
                      <TableCell className="font-bold">{entry.hours_worked}h</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(entry.id)}
                          data-testid={`delete-timesheet-${entry.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
