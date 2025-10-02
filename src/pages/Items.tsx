import { useState, useEffect } from "react";
import { Plus, Pencil, Save, X, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { itemSchema } from "@/lib/validations";

interface Item {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  rate_per_unit: number;
  danger_threshold: number;
  medium_threshold: number;
  is_active: boolean;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: "",
    unit: "kg",
    danger_threshold: "30",
    medium_threshold: "60",
    current_stock: "0",
    rate_per_unit: "0"
  });

  const [editForm, setEditForm] = useState<Item | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      // Validate input
      const validatedData = itemSchema.parse({
        name: newItem.name.trim(),
        unit: newItem.unit.trim(),
        danger_threshold: parseFloat(newItem.danger_threshold),
        medium_threshold: parseFloat(newItem.medium_threshold),
        current_stock: parseFloat(newItem.current_stock),
        rate_per_unit: parseFloat(newItem.rate_per_unit),
      });

      const { error } = await supabase
        .from('items')
        .insert({
          name: validatedData.name,
          unit: validatedData.unit,
          danger_threshold: validatedData.danger_threshold,
          medium_threshold: validatedData.medium_threshold,
          current_stock: validatedData.current_stock,
          rate_per_unit: validatedData.rate_per_unit,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully"
      });

      setNewItem({
        name: "",
        unit: "kg",
        danger_threshold: "30",
        medium_threshold: "60",
        current_stock: "0",
        rate_per_unit: "0"
      });
      setIsAddDialogOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (item: Item) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: editForm.name,
          unit: editForm.unit,
          danger_threshold: editForm.danger_threshold,
          medium_threshold: editForm.medium_threshold,
          rate_per_unit: editForm.rate_per_unit
        })
        .eq('id', editForm.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item updated successfully"
      });

      setEditingId(null);
      setEditForm(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const getStockBadgeVariant = (stock: number, danger: number, medium: number) => {
    if (stock < danger) return "destructive";
    if (stock < medium) return "secondary";
    return "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items Management</h1>
          <p className="text-muted-foreground">Manage inventory items, stock levels, and pricing</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Rice, Dal, Oil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., kg, litres, pieces"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="danger">Danger Threshold</Label>
                  <Input
                    id="danger"
                    type="number"
                    value={newItem.danger_threshold}
                    onChange={(e) => setNewItem(prev => ({ ...prev, danger_threshold: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium">Medium Threshold</Label>
                  <Input
                    id="medium"
                    type="number"
                    value={newItem.medium_threshold}
                    onChange={(e) => setNewItem(prev => ({ ...prev, medium_threshold: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.current_stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, current_stock: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Unit</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={newItem.rate_per_unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, rate_per_unit: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAddItem} className="w-full">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            All Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                {editingId === item.id && editForm ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                          value={editForm.unit}
                          onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rate per Unit (₹)</Label>
                        <Input
                          type="number"
                          value={editForm.rate_per_unit}
                          onChange={(e) => setEditForm({ ...editForm, rate_per_unit: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Danger Threshold</Label>
                        <Input
                          type="number"
                          value={editForm.danger_threshold}
                          onChange={(e) => setEditForm({ ...editForm, danger_threshold: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Medium Threshold</Label>
                        <Input
                          type="number"
                          value={editForm.medium_threshold}
                          onChange={(e) => setEditForm({ ...editForm, medium_threshold: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Stock</p>
                        <Badge variant={getStockBadgeVariant(item.current_stock, item.danger_threshold, item.medium_threshold)}>
                          {item.current_stock} {item.unit}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rate</p>
                        <p className="text-sm font-medium">₹{item.rate_per_unit}/{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Danger / Medium</p>
                        <p className="text-sm">{item.danger_threshold} / {item.medium_threshold}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No items found. Add your first item to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
