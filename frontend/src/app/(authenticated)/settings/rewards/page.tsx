'use client';

import { RewardSettingsForm } from '@/components/admin/reward-settings/RewardSettingsForm';
import { GiftSlabsManager } from '@/components/admin/reward-settings/GiftSlabsManager';
import { FreeGiftsManager } from '@/components/admin/reward-settings/FreeGiftsManager';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Settings, Layers } from 'lucide-react';

export default function RewardSettingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold">Reward Management</h1>
        </div>
        <p className="text-gray-600">
          Configure discount and gift-based rewards for eligible customers
        </p>
      </div>
    <div className='grid md:grid-cols-2 gap-10 grid-cols-1'>
 <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="slabs" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Gift Slabs
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Free Gifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <RewardSettingsForm />
        </TabsContent>

        <TabsContent value="slabs" className="mt-6">
          <GiftSlabsManager />
        </TabsContent>

        <TabsContent value="gifts" className="mt-6">
          <FreeGiftsManager />
        </TabsContent>
      </Tabs>
 <div className="grid grid-cols-1 gap-4 " >
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Discount Mode</h3>
          <p className="text-sm text-blue-800">
            Applies a percentage discount on eligible invoice amounts. Capped at a maximum discount limit.
          </p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Gift Mode</h3>
          <p className="text-sm text-green-800">
            Provides free products based on purchase slabs. Allocates gifts from inventory based on configured rules.
          </p>
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2">Gift Slabs</h3>
          <p className="text-sm text-amber-800">
            Define amount ranges (₹1000-5000, ₹5000-10000, etc.) and the maximum gift value for each tier.
          </p>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Free Gifts</h3>
          <p className="text-sm text-purple-800">
            Configure which products can be offered as free gifts, their value, stock limits, and priority.
          </p>
        </Card>
      </div>
    </div>
      {/* Tabs for different reward sections */}
     

      {/* Info Cards */}
     
    </div>
  );
}
