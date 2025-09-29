import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, Package, TrendingUp, Edit, Filter, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StrengthCategory {
  id: string;
  category_name: string;
  student_count: number;
  assigned_amount: number;
  is_active: boolean;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  danger_threshold: number;
  medium_threshold: number;
  rate_per_unit: number;
}

interface MenuData {
  breakfast: string;
  lunch: string;
  snacks: string;
}

const getStockStatus = (current: number, danger: number, medium: number) => {
  if (current <= danger) return 'danger';
  if (current <= medium) return 'warning';
  return 'sufficient';
};

const getStockColor = (status: string) => {
  switch (status) {
    case 'danger': return 'bg-destructive';
    case 'warning': return 'bg-warning';
    case 'sufficient': return 'bg-success';
    default: return 'bg-muted';
  }
};

const getStockTextColor = (status: string) => {
  switch (status) {
    case 'danger': return 'text-destructive-foreground';
    case 'warning': return 'text-warning-foreground';
    case 'sufficient': return 'text-success-foreground';
    default: return 'text-muted-foreground';
  }
};

// Generate government menu for the current month
const generateMonthlyMenu = () => {
  const menus = [
    { breakfast: "Upma with vegetables, Milk", lunch: "Rice, Dal, Vegetable curry, Chapati", snacks: "Banana, Groundnut chikki" },
    { breakfast: "Poha with peas, Tea", lunch: "Pulao, Curd, Pickle", snacks: "Biscuits, Milk" },
    { breakfast: "Idli, Sambhar, Chutney", lunch: "Roti, Dal, Sabzi, Rice", snacks: "Fruits, Roasted chana" },
    { breakfast: "Bread, Jam, Milk", lunch: "Rice, Sambar, Beans curry", snacks: "Kheer, Banana" },
    { breakfast: "Paratha, Curd, Pickle", lunch: "Biryani, Raita, Papad", snacks: "Halwa, Tea" },
    { breakfast: "Dosa, Chutney, Milk", lunch: "Chole, Bhature, Onion", snacks: "Fruits, Milk" },
    { breakfast: "Daliya, Vegetables", lunch: "Rajma, Rice, Roti", snacks: "Laddu, Milk" }
  ];
  
  const today = new Date();
  const currentWeek = Math.floor(today.getDate() / 7);
  return menus[currentWeek % menus.length];
};

export default function Dashboard() {
  const [strengthCategories, setStrengthCategories] = useState<StrengthCategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ student_count: 0, assigned_amount: 0 });
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const todaysMenu = generateMonthlyMenu();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch strength categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('strength_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_name');

      if (categoriesError) throw categoriesError;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;

      setStrengthCategories(categoriesData || []);
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStrengthCategory = async (id: string, updates: { student_count: number; assigned_amount: number }) => {
    try {
      const { error } = await supabase
        .from('strength_categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setStrengthCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
      );

      toast({
        title: "Success",
        description: "Strength category updated successfully"
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update strength category",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: StrengthCategory) => {
    setEditingCategory(category.id);
    setEditValues({
      student_count: category.student_count,
      assigned_amount: category.assigned_amount
    });
  };

  const handleSave = (id: string) => {
    updateStrengthCategory(id, editValues);
    setEditingCategory(null);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditValues({ student_count: 0, assigned_amount: 0 });
  };

  // Calculate totals
  const totalStudents = strengthCategories.reduce((sum, cat) => sum + cat.student_count, 0);
  const totalAssignedAmount = strengthCategories.reduce((sum, cat) => sum + (cat.student_count * cat.assigned_amount), 0);
  const perCapitaExpense = totalStudents > 0 ? (totalAssignedAmount / totalStudents).toFixed(2) : "0.00";
  const yesterdayExpense = totalAssignedAmount;

  // Filter items based on stock status
  const filteredItems = items.filter(item => {
    if (stockFilter === "all") return true;
    const status = getStockStatus(item.current_stock, item.danger_threshold, item.medium_threshold);
    return status === stockFilter;
  });

  // Calculate stock level percentage
  const getStockLevel = (current: number, medium: number) => {
    const maxLevel = medium * 2; // Assume double medium is maximum
    return Math.min((current / maxLevel) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {today.toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Week</p>
          <p className="font-semibold">
            Week {Math.ceil(today.getDate() / 7)} of {today.toLocaleDateString('en-IN', { month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{totalAssignedAmount.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Daily allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Per Capita Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{perCapitaExpense}</div>
            <p className="text-xs text-muted-foreground">Yesterday's average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Government Diet Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">Breakfast</h4>
              <p className="text-sm">{todaysMenu.breakfast}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Lunch</h4>
              <p className="text-sm">{todaysMenu.lunch}</p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg">
              <h4 className="font-semibold text-success mb-2">Snacks</h4>
              <p className="text-sm">{todaysMenu.snacks}</p>
            </div>
          </CardContent>
        </Card>

        {/* Strength Particulars with Edit */}
        <Card>
          <CardHeader>
            <CardTitle>Student Strength Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strengthCategories.map((category) => (
                <div key={category.id} className="p-4 bg-card border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{category.category_name}</h4>
                    {editingCategory !== category.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {editingCategory === category.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Students</label>
                          <Input
                            type="number"
                            value={editValues.student_count}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              student_count: parseInt(e.target.value) || 0
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Amount (₹)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValues.assigned_amount}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              assigned_amount: parseFloat(e.target.value) || 0
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(category.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{category.student_count}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">₹{category.assigned_amount}</p>
                        <p className="text-xs text-muted-foreground">Per student</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Total Strength</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students across all categories</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Status</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="danger">Danger Zone</SelectItem>
                  <SelectItem value="warning">Medium Stock</SelectItem>
                  <SelectItem value="sufficient">Sufficient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const status = getStockStatus(item.current_stock, item.danger_threshold, item.medium_threshold);
              const level = getStockLevel(item.current_stock, item.medium_threshold);
              
              return (
                <div key={item.id} className="p-4 bg-card border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <Badge 
                      className={`${getStockColor(status)} ${getStockTextColor(status)} text-xs`}
                    >
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      {item.current_stock} {item.unit}
                    </span>
                    <span className="text-sm font-medium">₹{item.rate_per_unit}/{item.unit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStockColor(status)}`}
                      style={{ width: `${level}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Danger: {item.danger_threshold}</span>
                    <span>Medium: {item.medium_threshold}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No items found for the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}