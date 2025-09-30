import { useState, useEffect } from "react";
import { Send, Calendar, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
}

interface IssueItem {
  name: string;
  quantity: string;
  unit: string;
  price: string;
  item_id?: string;
}

interface StockIssue {
  id: string;
  issue_date: string;
  issue_type: string;
  total_value: number;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    rate_per_unit: number;
  }>;
}

export default function StockIssue() {
  const [items, setItems] = useState<Item[]>([]);
  const [recentIssues, setRecentIssues] = useState<StockIssue[]>([]);
  const [issueData, setIssueData] = useState({
    date: new Date().toISOString().split('T')[0],
    issueType: "Master",
    items: [{ name: "", quantity: "", unit: "kg", price: "" }] as IssueItem[]
  });

  const { toast } = useToast();

  // Fetch items from database
  useEffect(() => {
    fetchItems();
    fetchRecentIssues();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch items from database",
        variant: "destructive"
      });
    } else if (data) {
      setItems(data);
    }
  };

  const fetchRecentIssues = async () => {
    const { data: issuesData, error } = await supabase
      .from('stock_issues')
      .select(`
        *,
        stock_issue_items (
          quantity,
          rate_per_unit,
          item_id,
          items (name, unit)
        )
      `)
      .order('issue_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent issues:', error);
    } else if (issuesData) {
      const formattedIssues = issuesData.map(issue => ({
        id: issue.id,
        issue_date: new Date(issue.issue_date).toLocaleDateString('en-IN'),
        issue_type: issue.issue_type,
        total_value: issue.total_value || 0,
        items: issue.stock_issue_items.map((item: any) => ({
          name: item.items.name,
          quantity: item.quantity,
          unit: item.items.unit,
          rate_per_unit: item.rate_per_unit
        }))
      }));
      setRecentIssues(formattedIssues);
    }
  };

  const addItem = () => {
    setIssueData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "", unit: "kg", price: "" }]
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setIssueData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'name') {
            const selectedItem = items.find(it => it.name === value);
            if (selectedItem) {
              return { 
                ...item, 
                name: value, 
                unit: selectedItem.unit,
                item_id: selectedItem.id 
              };
            }
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const handleIssue = async (index: number) => {
    const item = issueData.items[index];
    
    if (!item.name || !item.quantity || !item.price) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields before issuing",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(item.quantity);
    const price = parseFloat(item.price);

    // Check if sufficient stock is available
    const stockItem = items.find(i => i.name === item.name);
    if (!stockItem || stockItem.current_stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${stockItem?.current_stock || 0} ${item.unit} available`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Create stock issue
      const { data: issueRecord, error: issueError } = await supabase
        .from('stock_issues')
        .insert({
          issue_date: issueData.date,
          issue_type: issueData.issueType,
          total_value: quantity * price
        })
        .select()
        .single();

      if (issueError) throw issueError;

      // Create stock issue item
      const { error: itemError } = await supabase
        .from('stock_issue_items')
        .insert({
          issue_id: issueRecord.id,
          item_id: item.item_id,
          quantity: quantity,
          rate_per_unit: price,
          total_price: quantity * price
        });

      if (itemError) throw itemError;

      // Update item stock
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          current_stock: stockItem.current_stock - quantity 
        })
        .eq('id', item.item_id);

      if (updateError) throw updateError;

      toast({
        title: "Stock Issued",
        description: `${item.name} issued successfully`,
      });

      // Remove the issued item from the form
      setIssueData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));

      // If no items left, add a new empty one
      if (issueData.items.length === 1) {
        setIssueData(prev => ({
          ...prev,
          items: [{ name: "", quantity: "", unit: "kg", price: "" }]
        }));
      }

      // Refresh data
      fetchItems();
      fetchRecentIssues();

    } catch (error) {
      console.error('Error issuing stock:', error);
      toast({
        title: "Error",
        description: "Failed to issue stock. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Issue</h1>
          <p className="text-muted-foreground">Issue provisions to hostel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Issue Provisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Date and Issue Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueData.date}
                      onChange={(e) => setIssueData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Type</Label>
                    <Select 
                      value={issueData.issueType} 
                      onValueChange={(value) => setIssueData(prev => ({ ...prev, issueType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="Handloan">Handloan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Items to Issue</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Package className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {issueData.items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label>Item</Label>
                          <Select 
                            value={item.name} 
                            onValueChange={(value) => updateItem(index, "name", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((availableItem) => (
                                <SelectItem key={availableItem.id} value={availableItem.name}>
                                  {availableItem.name} ({availableItem.current_stock} {availableItem.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Input
                            value={item.unit}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price/Unit</Label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => handleIssue(index)}
                            className="w-full"
                          >
                            ISSUE
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Stock & Recent Issues */}
        <div className="space-y-6">
          {/* Available Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Available Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                  </div>
                  <Badge 
                    variant={item.current_stock < 50 ? "destructive" : item.current_stock < 100 ? "secondary" : "default"}
                  >
                    {item.current_stock}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-success" />
                Recent Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{issue.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{issue.issue_date}</p>
                    </div>
                    <Badge variant="outline">{issue.issue_type}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {issue.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-bold">₹{issue.total_value.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
