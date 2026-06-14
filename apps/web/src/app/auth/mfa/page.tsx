import { ShieldCheck } from "lucide-react";

export default function MfaPage() {
  return <main className="empty-state" style={{ minHeight: "calc(100vh - 72px)" }}>
    <ShieldCheck size={32} />
    <h3>Multi-factor authentication required</h3>
    <p>Enroll or verify through the secure MFA API before accessing PropertyVault operations.</p>
  </main>;
}
