import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
};

interface DocumentsLayoutProps {
  children: React.ReactNode;
}

export default function DocumentsLayout({ children }: DocumentsLayoutProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {children}
    </div>
  );
}