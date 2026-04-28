import { useState, useEffect } from "react";
import { API, useAuth } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, FileText, Droplets, Flame, Wind, ShieldAlert, Ruler, Bookmark, BookmarkCheck, Star, X } from "lucide-react";

const chapterIcons = {
  2: BookOpen, 3: Ruler, 4: Droplets, 5: Flame, 6: Droplets,
  7: Droplets, 9: Wind, 10: Droplets, 11: Droplets, 12: Flame,
  15: Droplets, 16: Droplets, 0: FileText,
};

const chapterColors = {
  2: "bg-blue-700", 3: "bg-blue-600", 4: "bg-cyan-600", 5: "bg-red-600",
  6: "bg-sky-600", 7: "bg-emerald-600", 9: "bg-violet-600", 10: "bg-teal-600",
  11: "bg-indigo-600", 12: "bg-orange-600", 15: "bg-lime-700", 16: "bg-green-700",
  0: "bg-amber-600",
};

const CODE_TYPES = [
  { value: "upc", label: "UPC", full: "Uniform Plumbing Code", publisher: "IAPMO" },
  { value: "ipc", label: "IPC", full: "International Plumbing Code", publisher: "ICC" },
];

const EDITIONS = ["2015", "2018", "2021", "2024"];

export default function PlumbingCodePage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [codeType, setCodeType] = useState("upc");
  const [edition, setEdition] = useState("2024");
  const [activeChapter, setActiveChapter] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { token } = useAuth();

  const headers = { Authorization: `Bearer ${token}` };
  const currentCode = CODE_TYPES.find(c => c.value === codeType);

  const fetchChapters = async (search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ code_type: codeType, edition });
      if (search) params.set("search", search);
      const response = await axios.get(`${API}/plumbing-code?${params}`);
      setChapters(response.data);
    } catch (error) {
      toast.error("Failed to load plumbing code");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API}/plumbing-code/bookmarks`, { headers });
      setBookmarks(res.data);
    } catch (err) {
      console.error("Bookmarks load failed (non-critical)", err);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [codeType, edition]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchChapters(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isBookmarked = (sectionCode) => {
    return bookmarks.some(b => b.section_code === sectionCode && b.code_type === codeType && b.edition === edition);
  };

  const getBookmarkId = (sectionCode) => {
    const b = bookmarks.find(bk => bk.section_code === sectionCode && bk.code_type === codeType && bk.edition === edition);
    return b?.id;
  };

  const toggleBookmark = async (section, chapter) => {
    const existing = getBookmarkId(section.code);
    if (existing) {
      try {
        await axios.delete(`${API}/plumbing-code/bookmarks/${existing}`, { headers });
        setBookmarks(prev => prev.filter(b => b.id !== existing));
        toast.success("Bookmark removed");
      } catch {
        toast.error("Failed to remove bookmark");
      }
    } else {
      try {
        const res = await axios.post(`${API}/plumbing-code/bookmarks`, {
          code_type: codeType,
          edition,
          section_code: section.code,
          section_title: section.title,
          chapter_title: chapter.title,
          chapter_id: chapter.id,
        }, { headers });
        setBookmarks(prev => [res.data, ...prev]);
        toast.success("Section bookmarked!");
      } catch (err) {
        if (err.response?.status === 409) {
          toast.info("Already bookmarked");
        } else {
          toast.error("Failed to bookmark");
        }
      }
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`${API}/plumbing-code/bookmarks/${bookmarkId}`, { headers });
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  const jumpToBookmark = (bm) => {
    setCodeType(bm.code_type);
    setEdition(bm.edition);
    setShowBookmarks(false);
    setTimeout(() => {
      document.getElementById(`chapter-${bm.chapter_id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  const getIcon = (chapterNum) => chapterIcons[chapterNum] || BookOpen;

  const bookmarkCount = bookmarks.length;

  return (
    <div className="space-y-6" data-testid="plumbing-code-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#FF5F00]" />
            Plumbing Code
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentCode?.full} - Quick Field Reference
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            variant={showBookmarks ? "default" : "outline"}
            size="sm"
            className={showBookmarks ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : ""}
            onClick={() => setShowBookmarks(!showBookmarks)}
            data-testid="bookmarks-toggle"
          >
            <Star className={`w-4 h-4 mr-1.5 ${showBookmarks ? "fill-white" : ""}`} />
            Bookmarks
            {bookmarkCount > 0 && (
              <Badge className="ml-1.5 bg-white/20 text-inherit text-xs px-1.5 py-0" data-testid="bookmark-count">
                {bookmarkCount}
              </Badge>
            )}
          </Button>
          <Badge className="bg-[#003366] text-white text-xs px-3 py-1" data-testid="code-edition-badge">
            {currentCode?.label} {edition} ({currentCode?.publisher})
          </Badge>
        </div>
      </div>

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10" data-testid="bookmarks-panel">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading uppercase text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Saved Bookmarks ({bookmarkCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkCount === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center" data-testid="no-bookmarks-msg">
                No bookmarks yet. Tap the bookmark icon on any code section to save it for quick access.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-md px-3 py-2 border border-slate-200 dark:border-slate-700 group"
                    data-testid={`bookmark-item-${bm.id}`}
                  >
                    <button
                      className="flex-1 text-left flex items-center gap-2 min-w-0"
                      onClick={() => jumpToBookmark(bm)}
                      data-testid={`bookmark-jump-${bm.id}`}
                    >
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                        {bm.section_code}
                      </span>
                      <span className="text-sm font-medium truncate">{bm.section_title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 ml-auto flex-shrink-0">
                        {bm.code_type.toUpperCase()} {bm.edition}
                      </Badge>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2 opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeBookmark(bm.id)}
                      data-testid={`bookmark-remove-${bm.id}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Code Type & Edition Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {CODE_TYPES.map((ct) => (
            <Button
              key={ct.value}
              variant={codeType === ct.value ? "default" : "outline"}
              className={codeType === ct.value ? "bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white border-[#FF5F00]" : ""}
              onClick={() => setCodeType(ct.value)}
              data-testid={`code-type-${ct.value}`}
            >
              {ct.label}
            </Button>
          ))}
        </div>
        <Select value={edition} onValueChange={setEdition}>
          <SelectTrigger className="w-[140px]" data-testid="edition-selector">
            <SelectValue placeholder="Edition" />
          </SelectTrigger>
          <SelectContent>
            {EDITIONS.map((ed) => (
              <SelectItem key={ed} value={ed}>{ed} Edition</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Disclaimer */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-500 border-2">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700 dark:text-amber-400">Reference Only</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              This is a field reference summary. Always refer to the official published code for complete requirements. Local amendments may apply. Visit{" "}
              {codeType === "upc" ? (
                <a href="https://www.iapmo.org" target="_blank" rel="noopener noreferrer" className="underline font-bold">iapmo.org</a>
              ) : (
                <a href="https://www.iccsafe.org" target="_blank" rel="noopener noreferrer" className="underline font-bold">iccsafe.org</a>
              )}{" "}for the official code.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search code sections (e.g., 'trap', 'slope', 'vent sizing')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
          data-testid="plumbing-code-search"
        />
      </div>

      {/* Quick Jump Chips */}
      {!searchTerm && !showBookmarks && (
        <div className="flex flex-wrap gap-2" data-testid="quick-jump-chips">
          {chapters.map((ch) => {
            const Icon = getIcon(ch.chapter);
            return (
              <Button
                key={ch.id}
                variant={activeChapter === ch.id ? "default" : "outline"}
                size="sm"
                className={`text-xs ${activeChapter === ch.id ? "bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white border-[#FF5F00]" : ""}`}
                onClick={() => {
                  setActiveChapter(activeChapter === ch.id ? null : ch.id);
                  if (activeChapter !== ch.id) {
                    document.getElementById(`chapter-${ch.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                data-testid={`chip-${ch.id}`}
              >
                <Icon className="w-3.5 h-3.5 mr-1" />
                {ch.chapter === 0 ? "Tables" : `Ch. ${ch.chapter}`}
              </Button>
            );
          })}
        </div>
      )}

      {/* Chapters */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : chapters.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No matching code sections found</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchTerm("")} data-testid="clear-search-btn">
            Clear Search
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => {
            const Icon = getIcon(chapter.chapter);
            const colorClass = chapterColors[chapter.chapter] || "bg-slate-600";
            return (
              <Card key={chapter.id} id={`chapter-${chapter.id}`} className="overflow-hidden border border-border" data-testid={`chapter-${chapter.id}`}>
                <CardHeader className={`${colorClass} text-white py-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-sm flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading uppercase text-lg tracking-tight">
                        {chapter.chapter === 0 ? "" : `Chapter ${chapter.chapter}: `}{chapter.title}
                      </CardTitle>
                      <p className="text-sm text-white/80 mt-0.5">{chapter.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    {chapter.sections.map((section) => (
                      <AccordionItem key={section.code} value={section.code} className="border-b border-border last:border-b-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50" data-testid={`section-${section.code}`}>
                          <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-sm font-bold whitespace-nowrap">
                              {section.code}
                            </span>
                            <span className="font-bold text-sm truncate">{section.title}</span>
                            <button
                              className="ml-auto flex-shrink-0 p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(section, chapter); }}
                              data-testid={`bookmark-btn-${section.code}`}
                            >
                              {isBookmarked(section.code) ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Bookmark className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                              )}
                            </button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Reference Footer Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#003366] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading uppercase text-sm">Drain Pipe Slopes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/80">{codeType === "upc" ? '2-1/2"' : '3"'} or less:</span><span className="font-bold font-mono">1/4" per ft</span></div>
            <div className="flex justify-between"><span className="text-white/80">{codeType === "upc" ? '3"' : '4"'} or larger:</span><span className="font-bold font-mono">1/8" per ft</span></div>
            <div className="flex justify-between"><span className="text-white/80">Maximum all:</span><span className="font-bold font-mono">1/2" per ft</span></div>
          </CardContent>
        </Card>
        <Card className="bg-[#003366] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading uppercase text-sm">Common DFU Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/80">Lavatory:</span><span className="font-bold font-mono">1 DFU</span></div>
            <div className="flex justify-between"><span className="text-white/80">Water Closet:</span><span className="font-bold font-mono">{edition >= "2024" ? "4" : "3"} DFU</span></div>
            <div className="flex justify-between"><span className="text-white/80">Shower/Tub:</span><span className="font-bold font-mono">2 DFU</span></div>
            <div className="flex justify-between"><span className="text-white/80">Kitchen Sink:</span><span className="font-bold font-mono">2 DFU</span></div>
          </CardContent>
        </Card>
        <Card className="bg-[#003366] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading uppercase text-sm">Min. Vent Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/80">General min:</span><span className="font-bold font-mono">1-1/4"</span></div>
            <div className="flex justify-between"><span className="text-white/80">Water Closet:</span><span className="font-bold font-mono">{codeType === "upc" ? '2"' : '1-1/2"'}</span></div>
            <div className="flex justify-between"><span className="text-white/80">Above Roof:</span><span className="font-bold font-mono">6" min</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
