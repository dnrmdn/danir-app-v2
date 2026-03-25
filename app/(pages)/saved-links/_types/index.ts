export type SavedLink = {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
  createdAt?: string;
};

export type FilterType = "all" | "labeled" | "unlabeled" | "recent";