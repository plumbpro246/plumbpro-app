import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Crown, Wrench, Clock, Mail, Trash2, Shield } from "lucide-react";

const ROLES = [
  { value: "foreman", label: "Foreman", icon: Shield },
  { value: "plumber", label: "Plumber", icon: Wrench },
];

export default function TeamPage() {
  const { user, token } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("plumber");
  const [teamTimesheets, setTeamTimesheets] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${API}/teams`, { headers });
      setTeam(res.data);
      if (res.data?.owner_id === user?.id) {
        fetchTeamTimesheets();
      }
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamTimesheets = async () => {
    try {
      const res = await axios.get(`${API}/teams/timesheets`, { headers });
      setTeamTimesheets(res.data);
    } catch {}
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) { toast.error("Enter a team name"); return; }
    setCreating(true);
    try {
      const res = await axios.post(`${API}/teams`, { name: teamName }, { headers });
      setTeam(res.data);
      toast.success("Team created!");
      setTeamName("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error("Enter an email"); return; }
    setInviting(true);
    try {
      await axios.post(`${API}/teams/invite`, { email: inviteEmail, role: inviteRole }, { headers });
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId, name) => {
    try {
      await axios.delete(`${API}/teams/members/${memberId}`, { headers });
      toast.success(`${name} removed from team`);
      fetchTeam();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await axios.delete(`${API}/teams`, { headers });
      setTeam(null);
      setTeamTimesheets([]);
      toast.success("Team deleted");
    } catch {
      toast.error("Failed to delete team");
    }
  };

  const isOwner = team?.owner_id === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No team yet - show create form
  if (!team) {
    return (
      <div className="space-y-6" data-testid="team-page">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-[#FF5F00]" />
            Team Management
          </h1>
          <p className="text-muted-foreground text-sm">Create a team and manage your crew</p>
        </div>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="font-heading uppercase">Create Your Team</CardTitle>
            <CardDescription>Set up a team to manage your plumbers, view timesheets, and coordinate jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input
                placeholder="e.g. Smith Plumbing Co."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                data-testid="team-name-input"
              />
            </div>
            <Button
              onClick={handleCreateTeam}
              disabled={creating}
              className="w-full bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="create-team-btn"
            >
              {creating ? "Creating..." : "Create Team"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-[#FF5F00]" />
            {team.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isOwner ? "You own this team" : `Member of ${team.name}`} &bull; {(team.members?.length || 0) + 1} member{(team.members?.length || 0) + 1 > 1 ? 's' : ''}
          </p>
        </div>
        {isOwner && (
          <Badge className="bg-[#FF5F00] text-white self-start">
            <Crown className="w-3.5 h-3.5 mr-1" /> Owner
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading uppercase text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF5F00] rounded-full flex items-center justify-center text-white font-bold">
                    {team.owner_name?.charAt(0)?.toUpperCase() || "O"}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{team.owner_name}</p>
                    <p className="text-xs text-muted-foreground">{team.owner_email}</p>
                  </div>
                </div>
                <Badge className="bg-[#FF5F00]/10 text-[#FF5F00] border-[#FF5F00]/30">
                  <Crown className="w-3 h-3 mr-1" /> Owner
                </Badge>
              </div>

              {/* Members */}
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-md p-3 border group" data-testid={`member-${member.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                      {member.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                    {member.status === "pending" && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
                    )}
                    {isOwner && (
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                        onClick={() => handleRemove(member.id, member.name)}
                        data-testid={`remove-${member.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {(!team.members || team.members.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4" data-testid="no-members">
                  No team members yet. Invite your crew below!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team Timesheets */}
          {isOwner && teamTimesheets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading uppercase text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Recent Team Timesheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-bold">Member</th>
                        <th className="pb-2 font-bold">Date</th>
                        <th className="pb-2 font-bold">Clock In</th>
                        <th className="pb-2 font-bold">Clock Out</th>
                        <th className="pb-2 font-bold">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamTimesheets.slice(0, 20).map((ts, i) => (
                        <tr key={i} className="border-b border-dashed last:border-b-0">
                          <td className="py-2 font-medium">{ts.member_name}</td>
                          <td className="py-2 text-muted-foreground">{ts.date}</td>
                          <td className="py-2 font-mono text-xs">{ts.clock_in || "-"}</td>
                          <td className="py-2 font-mono text-xs">{ts.clock_out || "-"}</td>
                          <td className="py-2 font-bold">{ts.total_hours ? `${ts.total_hours}h` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Invite Form */}
          {isOwner && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading uppercase text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Invite Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    placeholder="plumber@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    data-testid="invite-email"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger data-testid="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="w-full bg-[#003366] hover:bg-[#003366]/90 text-white font-bold uppercase text-sm"
                  data-testid="send-invite-btn"
                >
                  {inviting ? "Sending..." : <><Mail className="w-4 h-4 mr-1.5" /> Send Invite</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-heading uppercase text-sm">Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="font-bold">{(team.members?.length || 0) + 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="font-bold text-green-500">
                  {(team.members?.filter(m => m.status === "active").length || 0) + 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Invites</span>
                <span className="font-bold text-amber-500">
                  {team.members?.filter(m => m.status === "pending").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Delete Team */}
          {isOwner && (
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-4">
                <Button
                  variant="outline"
                  className="w-full text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-950 text-sm"
                  onClick={handleDeleteTeam}
                  data-testid="delete-team-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete Team
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
