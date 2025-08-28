'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to formula validation which is the new fee management system
    router.replace('/admin/formula-validation');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-muted-foreground">Redirecting to Formula Engine...</h2>
      </div>
    </div>
  );
}