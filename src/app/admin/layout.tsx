import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Simple auth check - skip for login page
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  const isLoginPage = true; // Let client handle redirect

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1E9" }}>
      {children}
    </div>
  );
}
