"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/hooks/useUserSession";
import { 
  Link2, 
  Search, 
  ExternalLink, 
  Trash2, 
  Folder, 
  MoreVertical, 
  ChevronRight,
  Plus,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveLinkDialog } from "@/components/dashboard/save-link-dialog";
import { getThumbnailUrl } from "@/lib/link-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedLink {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
  createdAt: string;
}

export default function SavedLinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { session } = useUserSession();

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  // Extract unique folders (labels)
  const folders = Array.from(new Set(
    links.flatMap(link => link.label ? link.label.split(',').map(l => l.trim()) : [])
  )).sort();

  // Filter links based on current folder and search
  const filteredLinks = links.filter((link) => {
    const matchesSearch = 
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      (link.label && link.label.toLowerCase().includes(search.toLowerCase()));
    
    if (currentFolder) {
      const linkLabels = link.label ? link.label.split(',').map(l => l.trim()) : [];
      return linkLabels.includes(currentFolder) && matchesSearch;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
      <SaveLinkDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onSuccess={fetchLinks}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest">
            <Link2 size={16} />
            SnapKeep Explorer
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            {currentFolder ? (
              <span className="flex items-center gap-3">
                <Folder className="text-primary h-12 w-12" />
                {currentFolder}
              </span>
            ) : "My Library"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input
              placeholder="Search links..."
              className="pl-10 w-64 h-12 rounded-2xl border-2 border-primary/5 bg-background shadow-sm focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus className="mr-2" size={20} />
            New Link
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={`hover:text-primary transition-colors ${!currentFolder ? 'text-primary font-bold' : 'text-muted-foreground'}`}
          >
            All Links
          </button>
          {currentFolder && (
            <>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="text-primary font-bold">{currentFolder}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-primary/5">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("grid")}
            className="rounded-lg h-8 w-8 p-0"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className="rounded-lg h-8 w-8 p-0"
          >
            <ListIcon size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Folders</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setCurrentFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${!currentFolder ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={18} className={!currentFolder ? "fill-primary/20" : ""} />
                  <span className="font-bold text-sm">All Links</span>
                </div>
                <Badge variant="secondary" className="bg-background/50 text-[10px]">{links.length}</Badge>
              </button>
              
              {folders.map(folder => (
                <button 
                  key={folder}
                  onClick={() => setCurrentFolder(folder)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${currentFolder === folder ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={18} className={currentFolder === folder ? "fill-primary/20" : ""} />
                    <span className="font-bold text-sm truncate max-w-[120px]">{folder}</span>
                  </div>
                  <Badge variant="secondary" className="bg-background/50 text-[10px]">
                    {links.filter(l => l.label?.includes(folder)).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          {filteredLinks.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-3"}>
              {filteredLinks.map((link) => (
                <Card 
                  key={link.id} 
                  className={`group relative overflow-hidden transition-all border-2 border-primary/5 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 ${viewMode === "list" ? "flex flex-row h-24" : "flex flex-col"}`}
                >
                  <div className={`${viewMode === "list" ? "w-40 h-full" : "aspect-video w-full"} bg-muted relative overflow-hidden shrink-0`}>
                    <img 
                      src={link.previewImage || getThumbnailUrl(link.url)} 
                      alt={link.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-lg" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={18} />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-sm truncate group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="text-destructive font-bold cursor-pointer" onClick={() => handleDelete(link.id)}>
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate italic">{new URL(link.url).hostname}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {link.label && link.label.split(',').slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] bg-primary/5 text-primary/80 border-none px-1.5 py-0 h-4">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-primary/5 rounded-[40px] border-4 border-dashed border-primary/10">
              <div className="relative inline-block mb-6">
                <Folder className="h-24 w-24 text-primary/20" />
                <Plus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Empty Space</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                No links found here. Start building your library by clicking New Link.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                variant="outline" 
                className="mt-8 rounded-2xl border-2 border-primary/20 font-bold hover:bg-primary/10"
              >
                Add Your First Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
