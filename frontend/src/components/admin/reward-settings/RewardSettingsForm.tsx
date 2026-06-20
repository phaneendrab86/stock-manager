'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const rewardSettingsSchema = z.object({
  mode: z.enum(['NONE', 'DISCOUNT', 'GIFT']),
  enabled: z.boolean(),
  minEligibleAmount: z.number().min(0),
  discountPercent: z.number().min(0).max(100),
  discountCap: z.number().min(0),
  allowedPaymentModes: z.string(),
  allowedBillingTypes: z.string(),
  allocateOnlyByInventory: z.boolean(),
  fallbackMode: z.enum(['NONE', 'DISCOUNT']),
});

type RewardSettings = z.infer<typeof rewardSettingsSchema>;

export function RewardSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mode, setMode] = useState<'NONE' | 'DISCOUNT' | 'GIFT'>('NONE');

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<RewardSettings>({
    resolver: zodResolver(rewardSettingsSchema),
    defaultValues: {
      mode: 'NONE',
      enabled: false,
      minEligibleAmount: 0,
      discountPercent: 1,
      discountCap: 50,
      allowedPaymentModes: 'CASH,UPI,BANK',
      allowedBillingTypes: 'WHOLESALE,DELIVERY',
      allocateOnlyByInventory: true,
      fallbackMode: 'NONE',
    },
  });

  const enabledMode = watch('enabled');
  const selectedMode = watch('mode');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const response = await api.get('/admin/rewards/settings');
        reset({
          mode: response.data.mode || 'NONE',
          enabled: response.data.enabled || false,
          minEligibleAmount: response.data.minEligibleAmount || 0,
          discountPercent: response.data.discountPercent || 1,
          discountCap: response.data.discountCap || 50,
          allowedPaymentModes: response.data.allowedPaymentModes || 'CASH,UPI,BANK',
          allowedBillingTypes: response.data.allowedBillingTypes || 'WHOLESALE,DELIVERY',
          allocateOnlyByInventory: response.data.allocateOnlyByInventory || true,
          fallbackMode: response.data.fallbackMode || 'NONE',
        });
        setMode(response.data.mode || 'NONE');
      } catch (error) {
        toast.error('Failed to fetch reward settings');
        console.error(error);
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: RewardSettings) => {
    try {
      setLoading(true);
      // Validate that only one mode is active
      if (data.enabled && data.mode === 'NONE') {
        toast.error('Please select a reward mode if rewards are enabled');
        return;
      }

      const response = await api.put('/admin/rewards/settings', data);
      toast.success('Reward settings updated successfully');
      setMode(response.data.mode);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update reward settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reward Settings</h2>
        <p className="text-sm text-gray-600 mt-2">
          Configure how rewards are calculated and applied to customer invoices.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-base font-semibold">Enable Rewards</Label>
              <p className="text-sm text-gray-600 mt-1">
                Turn on or off the reward system globally
              </p>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    field.value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                    field.value ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              )}
            />
          </div>
        </div>

        {enabledMode && (
          <>
            {/* Reward Mode Selection */}
            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
              <Label className="text-base font-semibold">Reward Mode</Label>
              <p className="text-sm text-gray-600 mt-1">
                Choose how rewards are applied: discount or free gifts
              </p>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCOUNT">Discount (% off)</SelectItem>
                      <SelectItem value="GIFT">Free Gifts</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mode && (
                <p className="text-red-500 text-sm mt-1">{errors.mode.message}</p>
              )}
            </div>

            {/* Discount Mode Configuration */}
            {selectedMode === 'DISCOUNT' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Discount Configuration
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Percent (%)</Label>
                    <Controller
                      name="discountPercent"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.discountPercent && (
                      <p className="text-red-500 text-sm mt-1">{errors.discountPercent.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Discount Cap (₹)</Label>
                    <Controller
                      name="discountCap"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.discountCap && (
                      <p className="text-red-500 text-sm mt-1">{errors.discountCap.message}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 bg-white p-2 rounded">
                  Example: If set to 1% with cap ₹50, a ₹5000 bill will get min(₹50, 1% of eligible amount) discount
                </p>
              </div>
            )}

            {/* Gift Mode Placeholder */}
            {selectedMode === 'GIFT' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Gift mode setup will be available soon. Configure free gift slabs in the &quot;Free Gift Management&quot; section.
                </p>
              </div>
            )}

            {/* Common Settings */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Eligibility Rules</h3>

              <div>
                <Label>Minimum Eligible Amount (₹)</Label>
                <Controller
                  name="minEligibleAmount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="mt-1"
                      placeholder="Minimum invoice eligible amount"
                    />
                  )}
                />
                {errors.minEligibleAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.minEligibleAmount.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Rewards only apply if eligible amount (total - tobacco) exceeds this
                </p>
              </div>

              <div>
                <Label>Allowed Payment Modes</Label>
                <Controller
                  name="allowedPaymentModes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="mt-1"
                      placeholder="CASH,UPI,BANK (comma-separated)"
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of payment modes eligible for rewards
                </p>
              </div>

              <div>
                <Label>Allowed Customer Types</Label>
                <Controller
                  name="allowedBillingTypes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="mt-1"
                      placeholder="WHOLESALE,DELIVERY (comma-separated)"
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of customer types eligible for rewards
                </p>
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex items-center gap-2"
          >
            {isSubmitting || loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Save Settings
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Rewards are calculated on the eligible amount (total - tobacco category items).
          Rewards are only applied for CASH, UPI, and BANK payment modes (not CREDIT).
        </p>
      </div>
    </Card>
  );
}
