"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary Caught:", error);
  }, [error]);

  return (
    <div style={{ padding: '40px', background: '#fee2e2', color: '#b91c1c', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Something went wrong!</h1>
      <p><strong>Error Message:</strong> {error.message}</p>
      {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
      <pre style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', overflowX: 'auto', marginTop: '20px' }}>
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
