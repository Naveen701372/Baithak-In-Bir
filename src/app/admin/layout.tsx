import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Baithak In Bir",
  description: "Restaurant management admin panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}