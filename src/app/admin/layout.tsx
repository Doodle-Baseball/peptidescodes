import type { Metadata } from "next";
import { AdminShell } from "./_lib/AdminShell";

export const metadata: Metadata = {
  title: { absolute: "Admin · PeptidesCodes" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
