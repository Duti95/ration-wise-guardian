import { useState } from "react";
import { Plus, Utensils as UtensilsIcon, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Dummy data
const utensilsData = [
  {
    id: 1,
    name: "Large Cooking Pot",
    capacity: "50 litres",
    quantity: 8,
    condition: "Good",
    lastMaintenance: "2024-01-10"
  },
  {
    id: 2,
    name: "Serving Bowls",
    capacity: "500ml each",
    quantity: 150,
    condition: "Good",
    lastMaintenance: "2024-01-05"
  },
  {
    id: 3,
    name: "Ladles",
    capacity: "200ml",
    quantity: 12,
    condition: "Fair",
    lastMaintenance: "2023-12-20"
  },
  {
    id: 4,
    name: "Water Storage Tank",
    capacity: "1000 litres",
    quantity: 2,
    condition: "Excellent",
    lastMaintenance: "2024-01-12"
  },
  {
    id: 5,
    name: "Plates",
    capacity: "Standard size",
    quantity: 200,
    condition: "Good",
    lastMaintenance: "2024-01-08"
  },
  {
    id: 6,
    name: "Gas Cylinder",
    capacity: "19kg",
    quantity: 4,
    condition: "Good",
    lastMaintenance: "2024-01-01"
  }
];

const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'excellent': return 'bg-success text-success-foreground';
    case 'good': return 'bg-primary text-primary-foreground';
    case 'fair': return 'bg-warning text-warning-foreground';
    case 'poor': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function Utensils() {
  const [utensils, setUtensils] = useState(utensilsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<typeof utensilsData[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    quantity: "",
    condition: "Good"
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUtensil) {
      // Update existing utensil
      setUtensils(prev => prev.map(utensil => 
        utensil.id === editingUtensil.id 
          ? { 
              ...utensil, 
              ...formData, 
              quantity: parseInt(formData.quantity),
              lastMaintenance: new Date().toISOString().split('T')[0]
            }
          : utensil
      ));
      toast({
        title: "Utensil Updated",
        description: `${formData.name} has been successfully updated.`,
      });
    } else {
      // Add new utensil
      const newUtensil = {
        id: Math.max(...utensils.map(u => u.id)) + 1,
        ...formData,
        quantity: parseInt(formData.quantity),
        lastMaintenance: new Date().toISOString().split('T')[0]
      };
      setUtensils(prev => [...prev, newUtensil]);
      toast({
        title: "Utensil Added",
        description: `${formData.name} has been successfully added to inventory.`,
      });
    }

    // Reset form and close dialog
    setFormData({ name: "", capacity: "", quantity: "", condition: "Good" });
    setEditingUtensil(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (utensil: typeof utensilsData[0]) => {
    setEditingUtensil(utensil);
    setFormData({
      name: utensil.name,
      capacity: utensil.capacity,
      quantity: utensil.quantity.toString(),
      condition: utensil.condition
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setUtensils(prev => prev.filter(utensil => utensil.id !== id));
    toast({
      title: "Utensil Removed",
      description: "Utensil has been removed from inventory.",
      variant: "destructive"
    });
  };

  const totalItems = utensils.reduce((sum, utensil) => sum + utensil.quantity, 0);
  const excellentCondition = utensils.filter(u => u.condition === 'Excellent').length;
  const needsMaintenance = utensils.filter(u => {
    const lastMaintenance = new Date(u.lastMaintenance);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastMaintenance < thirtyDaysAgo;
  }).length;

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
                setFormData({ name: "", capacity: "", quantity: "", condition: "Good" });
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
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
            <CardTitle className="text-sm font-medium">Excellent</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{excellentCondition}</div>
            <p className="text-xs text-muted-foreground">In excellent condition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <UtensilsIcon className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{needsMaintenance}</div>
            <p className="text-xs text-muted-foreground">Need maintenance</p>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capacity:</span>
                <span className="font-medium">{utensil.capacity}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <Badge variant="secondary">{utensil.quantity}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Condition:</span>
                <Badge className={getConditionColor(utensil.condition)}>
                  {utensil.condition}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Maintenance:</span>
                <span className="text-sm font-medium">
                  {new Date(utensil.lastMaintenance).toLocaleDateString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}