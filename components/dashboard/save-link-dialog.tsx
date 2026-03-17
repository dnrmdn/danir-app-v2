"use client";

import { useEffect, useState } from "react";
import { Folder, Image as ImageIcon, Link2, Plus, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/link-utils";

interface SaveLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onSuccess?: () => void;
}

export function SaveLinkDialog({ open, onOpenChange, initialUrl = "", onSuccess }: SaveLinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [showDetails, setShowDetails] = useState(!!initialUrl);
  const [linkData, setLinkData] = useState({
    title: "",
    labels: "",
    previewImage: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingLabels, setExistingLabels] = useState<string[]>(["Work", "Education", "Personal", "Entertainment"]);
  const [newLabel, setNewLabel] = useState("");
  const router = useRouter();

  const selectedLabels = linkData.labels
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch("/api/labels");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const defaultLabels = ["Work", "Education", "Personal", "Entertainment"];
          const userLabels = data.data as string[];
          const combined = Array.from(new Set([...defaultLabels, ...userLabels])).sort();
          setExistingLabels(combined);
        }
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    if (open) {
      fetchLabels();
      setError(null);
    }
  }, [open]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsFetching(true);
    setError(null);
    try {
      const preview = getThumbnailUrl(url);
      
      setLinkData((prev) => ({ ...prev, previewImage: preview }));
      setShowDetails(true);
    } catch {
      console.error("Invalid URL");
    } finally {
      setIsFetching(false);
    }
  };

  const toggleLabel = (label: string) => {
    const currentLabels = selectedLabels;
    let updatedLabels;
    if (currentLabels.includes(label)) {
      updatedLabels = currentLabels.filter(l => l !== label);
    } else {
      updatedLabels = [...currentLabels, label];
    }
    setLinkData({ ...linkData, labels: updatedLabels.join(", ") });
  };

  const addNewLabel = () => {
    const trimmed = newLabel.trim();
    if (trimmed && !existingLabels.includes(trimmed)) {
      setExistingLabels([...existingLabels, trimmed]);
      toggleLabel(trimmed);
      setNewLabel("");
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          ...linkData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onOpenChange(false);
        setUrl("");
        setLinkData({ title: "", labels: "", previewImage: "" });
        setShowDetails(false);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setError(data.error || "Gagal menyimpan link");
      }
    } catch (error) {
      console.error("Failed to save link:", error);
      setError("Terjadi kesalahan sistem. Coba lagi nanti.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-primary/20 bg-background/80 backdrop-blur-xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black flex items-center gap-2">
            <Link2 className="text-primary" />
            {showDetails ? "Link Preview & Details" : "Save New Link"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {showDetails 
              ? "Complete the details below to organize your link." 
              : "Paste the URL you want to save to SnapKeep."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!showDetails ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="font-bold">URL / Link</Label>
              <Input 
                id="url"
                type="url"
                placeholder="https://instagram.com/p/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 rounded-2xl border-primary/20 bg-background/50 text-lg"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel className="rounded-xl h-12 px-6">Cancel</AlertDialogCancel>
              <Button 
                type="submit" 
                disabled={isFetching || !url}
                className="rounded-xl h-12 px-8 bg-gradient-to-r from-primary to-secondary font-bold"
              >
                {isFetching ? "Fetching..." : "Next Step"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div className="aspect-video w-full md:w-48 rounded-xl overflow-hidden border-2 border-primary/10 bg-muted shrink-0 shadow-sm relative group">
                <Image
                  src={linkData.previewImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop"}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Source Link</Label>
                <p className="text-sm font-medium text-foreground/70 break-all line-clamp-2 italic">
                  {url}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)} className="text-xs h-7 px-2 text-primary hover:text-primary/80">
                  Change URL
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold flex items-center gap-2 text-sm">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="title" 
                  value={linkData.title} 
                  onChange={(e) => setLinkData({...linkData, title: e.target.value})}
                  className="rounded-xl border-primary/20 focus-visible:ring-primary h-12 bg-background/50"
                  placeholder="Enter a title for this link"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2 text-sm">
                  <Folder size={16} className="text-primary" />
                  Labels / Folders
                </Label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-background/30 rounded-xl border border-primary/5 min-h-[50px]">
                  {existingLabels.map((label) => (
                    <Badge 
                      key={label}
                      variant={selectedLabels.includes(label) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-all py-1.5 px-3 rounded-lg"
                      onClick={() => toggleLabel(label)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Create new label..." 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="rounded-xl border-primary/10 h-10 bg-background/50"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewLabel())}
                  />
                  <Button type="button" onClick={addNewLabel} variant="outline" size="icon" className="shrink-0 rounded-xl">
                    <Plus size={18} />
                  </Button>
                </div>
                {selectedLabels.length === 0 && (
                  <p className="text-[10px] text-destructive font-bold animate-pulse">
                    Silakan pilih minimal satu label/folder!
                  </p>
                )}
              </div>
            </div>
            
            <AlertDialogFooter className="gap-3 pt-4">
              <AlertDialogCancel className="rounded-xl border-2 h-12 px-6">Cancel</AlertDialogCancel>
              <Button 
                disabled={!linkData.title.trim() || selectedLabels.length === 0 || isSaving}
                onClick={handleFinalSave}
                className="rounded-xl bg-gradient-to-r from-primary to-secondary font-bold px-8 h-12 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
              >
                {isSaving ? "Saving..." : <><Save className="mr-2" size={18} /> Save to SnapKeep</>}
              </Button>
            </AlertDialogFooter>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
