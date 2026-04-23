import { useState, useEffect, useRef } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Play, Pause, Trash2, Clock, FileText, Square, Loader2 } from "lucide-react";

export default function VoiceNotesPage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [jobName, setJobName] = useState("");
  const [playingId, setPlayingId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());

  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API}/voice-notes`, { headers });
      setNotes(res.data);
    } catch {
      toast.error("Failed to load voice notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current.pause();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(250);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    });
  };

  const handleSubmit = async () => {
    await stopRecording();
    
    // Small delay to ensure chunks are flushed
    await new Promise((r) => setTimeout(r, 200));

    if (chunksRef.current.length === 0) {
      toast.error("No audio recorded");
      return;
    }

    setUploading(true);
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("job_name", jobName);
    formData.append("duration", String(recordingTime));

    try {
      await axios.post(`${API}/voice-notes`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      toast.success("Voice note saved & transcribed!");
      setJobName("");
      setRecordingTime(0);
      chunksRef.current = [];
      fetchNotes();
    } catch {
      toast.error("Failed to save voice note");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this voice note?")) return;
    try {
      await axios.delete(`${API}/voice-notes/${id}`, { headers });
      toast.success("Voice note deleted");
      if (playingId === id) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      fetchNotes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePlay = (noteId) => {
    if (playingId === noteId) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = `${API}/voice-notes/${noteId}/audio?t=${token}`;
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current.onerror = () => {
      toast.error("Failed to play audio");
      setPlayingId(null);
    };
    audioRef.current.play();
    setPlayingId(noteId);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6" data-testid="voice-notes-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Voice Notes</h1>
        <p className="text-muted-foreground text-sm">Record field observations — auto-transcribed by AI</p>
      </div>

      {/* Recorder Card */}
      <Card className="border-2 border-dashed border-border rounded-sm" data-testid="voice-recorder">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Job Name Input */}
            <div className="w-full max-w-md">
              <Label className="text-sm font-bold uppercase tracking-wide">Job / Site Name (optional)</Label>
              <Input
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g. 123 Main St - Kitchen Remodel"
                className="h-12 mt-1"
                disabled={recording || uploading}
                data-testid="voice-job-name"
              />
            </div>

            {/* Recording UI */}
            {recording && (
              <div className="flex items-center gap-3 text-lg font-mono" data-testid="recording-timer">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-500 font-bold">{formatTime(recordingTime)}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {!recording ? (
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-[#FF5F00] hover:bg-[#FF5F00]/90"
                  onClick={startRecording}
                  disabled={uploading}
                  data-testid="start-recording-btn"
                >
                  <Mic className="w-7 h-7" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full"
                    onClick={() => { stopRecording(); chunksRef.current = []; setRecordingTime(0); }}
                    data-testid="cancel-recording-btn"
                  >
                    <MicOff className="w-7 h-7" />
                  </Button>
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                    data-testid="stop-save-btn"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="uploading-indicator">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transcribing audio...</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              {recording ? "Tap green to save, red to cancel" : "Tap to start recording"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">
          Saved Notes ({notes.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No voice notes yet. Record your first one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="border border-border rounded-sm hover:border-[#FF5F00] transition-colors" data-testid={`voice-note-${note.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Play button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 flex-shrink-0 rounded-full"
                      onClick={() => togglePlay(note.id)}
                      data-testid={`play-voice-${note.id}`}
                    >
                      {playingId === note.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      {note.job_name && (
                        <p className="font-bold text-sm uppercase tracking-wide text-foreground mb-1">
                          {note.job_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <FileText className="w-3.5 h-3.5 inline mr-1 opacity-60" />
                        {note.transcript || "[No transcription]"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(parseInt(note.duration || 0))}
                        </span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => handleDelete(note.id)}
                      data-testid={`delete-voice-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
