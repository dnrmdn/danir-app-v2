import LayoutClient from "./layout-client";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
