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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
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

const freeGiftSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  giftValue: z.number().min(1),
  stockLimit: z.number().min(0),
  priority: z.number().min(1),
});

interface Product {
  id: string;
  name: string;
}

interface FreeGift {
  id: string;
  productId: string;
  product: Product;
  giftValue: number;
  stockLimit: number;
  priority: number;
  status: string;
}

export function FreeGiftsManager() {
  const [gifts, setGifts] = useState<FreeGift[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(freeGiftSchema),
    defaultValues: {
      productId: '',
      giftValue: 0,
      stockLimit: 0,
      priority: 1,
    },
  });

  useEffect(() => {
    fetchGifts();
    fetchProducts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/rewards/gifts');
      setGifts(response.data);
    } catch (error) {
      toast.error('Failed to fetch free gifts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await api.put(`/admin/rewards/gifts/${editingId}`, data);
        toast.success('Free gift updated');
      } else {
        await api.post('/admin/rewards/gifts', data);
        toast.success('Free gift created');
      }
      setIsDialogOpen(false);
      reset();
      setEditingId(null);
      fetchGifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save free gift');
    }
  };

  const handleEdit = (gift: FreeGift) => {
    reset({
      productId: gift.productId,
      giftValue: gift.giftValue,
      stockLimit: gift.stockLimit,
      priority: gift.priority,
    });
    setEditingId(gift.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) return;

    try {
      await api.delete(`/admin/rewards/gifts/${id}`);
      toast.success('Free gift deleted');
      fetchGifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete gift');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'DISCONTINUED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Free Gifts</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              reset();
              setEditingId(null);
            }} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Gift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Free Gift</DialogTitle>
              <DialogDescription>
                Configure products to be offered as free gifts to customers
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Product</Label>
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productId && <p className="text-red-500 text-sm">{errors.productId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gift Value (₹)</Label>
                  <Controller
                    name="giftValue"
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
                  {errors.giftValue && <p className="text-red-500 text-sm">{errors.giftValue.message}</p>}
                </div>

                <div>
                  <Label>Stock Limit (0 = unlimited)</Label>
                  <Controller
                    name="stockLimit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <Label>Priority (Lower = Higher Priority)</Label>
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
      ) : gifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No free gifts configured yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gifts.map((gift) => (
            <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{gift.product.name}</span>
                  <Badge className={getStatusBadgeColor(gift.status)}>{gift.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Value: ₹{gift.giftValue} | 
                  Stock: {gift.stockLimit === 0 ? 'Unlimited' : gift.stockLimit} | 
                  Priority: {gift.priority}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(gift)}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(gift.id)}
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
