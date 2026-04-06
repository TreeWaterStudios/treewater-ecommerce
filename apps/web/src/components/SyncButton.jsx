
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';

const SyncButton = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await apiServerClient.fetch('/printful/sync-products', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to sync products');
      }
      
      const data = await response.json();
      
      toast.success(`Synced ${data.totalProducts || 0} products (${data.newProducts || 0} new, ${data.updatedProducts || 0} updated)`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error.message || 'An error occurred while syncing products');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={isSyncing}
      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98]"
    >
      {isSyncing ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
      ) : (
        <><RefreshCw className="w-4 h-4 mr-2" /> Sync Printful Products</>
      )}
    </Button>
  );
};

export default SyncButton;
