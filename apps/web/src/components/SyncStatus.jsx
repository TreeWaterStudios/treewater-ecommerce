import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const SyncStatus = ({ onSyncComplete }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await apiServerClient.fetch('/printful/sync-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await apiServerClient.fetch('/printful/sync', { method: 'POST' });
      if (!response.ok) throw new Error('Sync failed');
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Sync complete! Synced ${data.syncedCount} products.`);
      } else {
        toast.success('Sync completed.');
      }
      
      await fetchStatus();
      if (onSyncComplete) onSyncComplete();
    } catch (error) {
      toast.error('Failed to sync products');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card/40 backdrop-blur-sm border border-primary/10 rounded-xl p-4 mb-8 animate-pulse flex justify-between items-center">
        <div className="h-5 bg-background/50 rounded w-48"></div>
        <div className="h-9 bg-background/50 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-card/60 backdrop-blur-md border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Last Sync: <span className="text-foreground">{status?.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Products: <span className="text-foreground">{status?.productCount || 0}</span>
          </span>
        </div>
        {status?.status === 'error' && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Sync Error</span>
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleSync} 
        disabled={syncing} 
        variant="outline"
        className="w-full sm:w-auto border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  );
};

export default SyncStatus;