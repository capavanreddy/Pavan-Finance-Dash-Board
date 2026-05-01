import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardWrapper from "@/components/DashboardWrapper";

export default async function Dashboard() {
  try {
    const session = await getSession();

    if (!session) {
      redirect("/login");
    }

    return <DashboardWrapper user={session.user} />;
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return (
      <div style={{ padding: '40px', background: '#fee2e2', color: '#b91c1c', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h1>Critical SSR Error Caught</h1>
        <p><strong>Message:</strong> {error?.message || "Unknown error"}</p>
        <pre style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
          {error?.stack}
        </pre>
      </div>
    );
  }
}

