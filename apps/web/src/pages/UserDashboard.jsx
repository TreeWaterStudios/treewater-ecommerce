import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Package, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const UserDashboard = () => {
  const [leases, setLeases] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leasesData, ordersData] = await Promise.all([
          pb.collection('beat_leases').getFullList({
            filter: `userId = "${pb.authStore.model.id}"`,
            sort: '-created',
            $autoCancel: false,
          }),
          pb.collection('merchandise_orders').getFullList({
            filter: `userId = "${pb.authStore.model.id}"`,
            sort: '-created',
            $autoCancel: false,
          }),
        ]);

        setLeases(leasesData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = (record, fileField) => {
    if (!record[fileField]) {
      toast.error('File not available');
      return;
    }

    const url = pb.files.getUrl(record, record[fileField]);
    window.open(url, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - TREEWATER STUDIOS</title>
        <meta name="description" content="Manage your purchases and account settings" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Dashboard</h1>

          <Tabs defaultValue="leases" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="leases">Leases</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="leases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Beat Leases</CardTitle>
                  <CardDescription>Your purchased beat licenses and downloads</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : leases.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No leases yet</p>
                      <Button onClick={() => window.location.href = '/beat-leasing'}>
                        Browse Beat Leasing
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leases.map((lease) => (
                        <div
                          key={lease.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                        >
                          <div>
                            <p className="font-semibold">{lease.tier} Lease</p>
                            <p className="text-sm text-muted-foreground">
                              Purchased: {new Date(lease.purchaseDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-primary font-semibold">${lease.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(lease, 'contractFile')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Contract
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(lease, 'beatFile')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Beat Files
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Merchandise Orders</CardTitle>
                  <CardDescription>Your order history and tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button onClick={() => window.location.href = '/merchandise'}>
                        Shop Merchandise
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                        >
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-primary font-semibold">${order.totalPrice}</p>
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                order.status === 'Delivered'
                                  ? 'bg-accent/20 text-accent'
                                  : order.status === 'Shipped'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted-foreground/20 text-muted-foreground'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} item(s)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">{pb.authStore.model?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Name</p>
                    <p className="text-sm text-muted-foreground">{pb.authStore.model?.name || 'Not set'}</p>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default UserDashboard;