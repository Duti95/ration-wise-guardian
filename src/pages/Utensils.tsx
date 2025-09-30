import { useState, useEffect } from "react";
import { Plus, Utensils as UtensilsIcon, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Utensil {
  id: string;
  name: string;
  capacity: string | null;
  current_quantity: number;
  damaged_quantity: number;
  replacement_needed: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export default function Utensils() {
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<Utensil | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    current_quantity: "",
    damaged_quantity: "0",
    replacement_needed: "0",
    unit: "pcs"
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUtensils();
  }, []);

  const fetchUtensils = async () => {
    const { data, error } = await supabase
      .from('utensils')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching utensils:', error);
      toast({
        title: "Error",
        description: "Failed to fetch utensils from database",
        variant: "destructive"
      });
    } else if (data) {
      setUtensils(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const utensilData = {
      name: formData.name,
      capacity: formData.capacity || null,
      current_quantity: parseInt(formData.current_quantity),
      damaged_quantity: parseInt(formData.damaged_quantity),
      replacement_needed: parseInt(formData.replacement_needed),
      unit: formData.unit
    };

    try {
      if (editingUtensil) {
        // Update existing utensil
        const { error } = await supabase
          .from('utensils')
          .update(utensilData)
          .eq('id', editingUtensil.id);

        if (error) throw error;

        toast({
          title: "Utensil Updated",
          description: `${formData.name} has been successfully updated.`,
        });
      } else {
        // Add new utensil
        const { error } = await supabase
          .from('utensils')
          .insert(utensilData);

        if (error) throw error;

        toast({
          title: "Utensil Added",
          description: `${formData.name} has been successfully added to inventory.`,
        });
      }

      // Reset form and close dialog
      setFormData({ 
        name: "", 
        capacity: "", 
        current_quantity: "", 
        damaged_quantity: "0", 
        replacement_needed: "0",
        unit: "pcs" 
      });
      setEditingUtensil(null);
      setIsDialogOpen(false);
      fetchUtensils();

    } catch (error) {
      console.error('Error saving utensil:', error);
      toast({
        title: "Error",
        description: "Failed to save utensil. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (utensil: Utensil) => {
    setEditingUtensil(utensil);
    setFormData({
      name: utensil.name,
      capacity: utensil.capacity || "",
      current_quantity: utensil.current_quantity.toString(),
      damaged_quantity: utensil.damaged_quantity?.toString() || "0",
      replacement_needed: utensil.replacement_needed?.toString() || "0",
      unit: utensil.unit
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('utensils')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Utensil Removed",
        description: "Utensil has been removed from inventory.",
      });
      fetchUtensils();

    } catch (error) {
      console.error('Error deleting utensil:', error);
      toast({
        title: "Error",
        description: "Failed to delete utensil. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalItems = utensils.reduce((sum, utensil) => sum + utensil.current_quantity, 0);
  const totalDamaged = utensils.reduce((sum, utensil) => sum + (utensil.damaged_quantity || 0), 0);
  const needsReplacement = utensils.reduce((sum, utensil) => sum + (utensil.replacement_needed || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Utensils Stock Register</h1>
          <p className="text-muted-foreground">Manage kitchen utensils and equipment inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingUtensil(null);
                setFormData({ 
                  name: "", 
                  capacity: "", 
                  current_quantity: "", 
                  damaged_quantity: "0", 
                  replacement_needed: "0",
                  unit: "pcs" 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Utensil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUtensil ? 'Edit Utensil' : 'Add New Utensil'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Utensil Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter utensil name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Enter capacity (e.g., 10 litres, 500ml)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_quantity">Current Quantity</Label>
                  <Input
                    id="current_quantity"
                    type="number"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_quantity: e.target.value }))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="pcs"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="damaged_quantity">Damaged</Label>
                  <Input
                    id="damaged_quantity"
                    type="number"
                    value={formData.damaged_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, damaged_quantity: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replacement_needed">Replacement Needed</Label>
                  <Input
                    id="replacement_needed"
                    type="number"
                    value={formData.replacement_needed}
                    onChange={(e) => setFormData(prev => ({ ...prev, replacement_needed: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingUtensil ? 'Update Utensil' : 'Add Utensil'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{utensils.length}</div>
            <p className="text-xs text-muted-foreground">Different types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalDamaged}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replacement</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{needsReplacement}</div>
            <p className="text-xs text-muted-foreground">To be replaced</p>
          </CardContent>
        </Card>
      </div>

      {/* Utensils Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {utensils.map((utensil) => (
          <Card key={utensil.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{utensil.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(utensil)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(utensil.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {utensil.capacity && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{utensil.capacity}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Quantity:</span>
                <Badge variant="secondary">{utensil.current_quantity} {utensil.unit}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Damaged:</span>
                <Badge variant="destructive">{utensil.damaged_quantity || 0}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Replacement Needed:</span>
                <Badge variant="outline">{utensil.replacement_needed || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
