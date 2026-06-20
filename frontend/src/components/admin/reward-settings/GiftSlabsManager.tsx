'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Edit2, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const giftSlabSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  maxGiftValue: z.number().min(1),
  priority: z.number().min(1),
  description: z.string().optional(),
});

type GiftSlab = z.infer<typeof giftSlabSchema> & { id: string; isActive: boolean };

export function GiftSlabsManager() {
  const [slabs, setSlabs] = useState<GiftSlab[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(giftSlabSchema),
    defaultValues: {
      minAmount: 0,
      maxAmount: 0,
      maxGiftValue: 0,
      priority: 1,
      description: '',
    },
  });

  useEffect(() => {
    fetchSlabs();
  }, []);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/rewards/slabs');
      setSlabs(response.data);
    } catch (error) {
      toast.error('Failed to fetch gift slabs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (data.minAmount >= data.maxAmount) {
      toast.error('Min amount must be less than Max amount');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/rewards/slabs/${editingId}`, data);
        toast.success('Gift slab updated');
      } else {
        await api.post('/admin/rewards/slabs', data);
        toast.success('Gift slab created');
      }
      setIsDialogOpen(false);
      reset();
      setEditingId(null);
      fetchSlabs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save gift slab');
    }
  };

  const handleEdit = (slab: GiftSlab) => {
    reset(slab);
    setEditingId(slab.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slab?')) return;

    try {
      await api.delete(`/admin/rewards/slabs/${id}`);
      toast.success('Gift slab deleted');
      fetchSlabs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete slab');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Gift Slabs</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              reset();
              setEditingId(null);
            }} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Slab
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create'} Gift Slab</DialogTitle>
              <DialogDescription>
                Define amount ranges and maximum gift values for each tier
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Amount (₹)</Label>
                  <Controller
                    name="minAmount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                  {errors.minAmount && <p className="text-red-500 text-sm">{errors.minAmount.message}</p>}
                </div>

                <div>
                  <Label>Max Amount (₹)</Label>
                  <Controller
                    name="maxAmount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                  {errors.maxAmount && <p className="text-red-500 text-sm">{errors.maxAmount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Gift Value (₹)</Label>
                  <Controller
                    name="maxGiftValue"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                  {errors.maxGiftValue && <p className="text-red-500 text-sm">{errors.maxGiftValue.message}</p>}
                </div>

                <div>
                  <Label>Priority</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="e.g., Silver tier gifts" {...field} />
                  )}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : slabs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No gift slabs configured yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slabs.map((slab) => (
            <div key={slab.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    ₹{slab.minAmount.toLocaleString()} - ₹{slab.maxAmount.toLocaleString()}
                  </span>
                  {!slab.isActive && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <p className="text-sm text-gray-600">
                  Max Gift Value: ₹{slab.maxGiftValue} | Priority: {slab.priority}
                  {slab.description && ` | ${slab.description}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(slab)}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(slab.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
