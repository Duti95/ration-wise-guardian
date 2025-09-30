import { useState } from "react";
import { Send, Calendar, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Dummy data
const availableItems = [
  { name: "Rice", available: 450, unit: "kg" },
  { name: "Dal", available: 75, unit: "kg" },
  { name: "Oil", available: 25, unit: "litres" },
  { name: "Vegetables", available: 120, unit: "kg" },
  { name: "Milk", available: 45, unit: "litres" }
];

const classCategories = [
  "Classes Below 8",
  "Classes Below 11", 
  "Intermediate (11-12)"
];

const recentIssues = [
  {
    id: "ISS001",
    date: "2024-01-15",
    class: "Classes Below 8",
    items: [
      { name: "Rice", quantity: 25, unit: "kg" },
      { name: "Dal", quantity: 10, unit: "kg" }
    ]
  },
  {
    id: "ISS002", 
    date: "2024-01-15",
    class: "Classes Below 11",
    items: [
      { name: "Vegetables", quantity: 35, unit: "kg" },
      { name: "Oil", quantity: 5, unit: "litres" }
    ]
  }
];

export default function StockIssue() {
  const [issueData, setIssueData] = useState({
    date: new Date().toISOString().split('T')[0],
    issueType: "Master",
    items: [{ name: "", quantity: "", unit: "kg", price: "" }]
  });

  const { toast } = useToast();

  const addItem = () => {
    setIssueData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "", unit: "kg", price: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setIssueData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setIssueData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Stock Issued",
      description: `Items issued successfully as ${issueData.issueType}`,
    });
    // Reset form
    setIssueData({
      date: new Date().toISOString().split('T')[0],
      issueType: "Master",
      items: [{ name: "", quantity: "", unit: "kg", price: "" }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Issue</h1>
          <p className="text-muted-foreground">Issue provisions to different class categories</p>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Class Selection */}
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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Item</Label>
                          <Select 
                            value={item.name} 
                            onValueChange={(value) => {
                              const selectedItem = availableItems.find(i => i.name === value);
                              updateItem(index, "name", value);
                              if (selectedItem) {
                                updateItem(index, "unit", selectedItem.unit);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableItems.map((availableItem) => (
                                <SelectItem key={availableItem.name} value={availableItem.name}>
                                  {availableItem.name} ({availableItem.available} {availableItem.unit} available)
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
                            required
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
                        <div className="flex items-end">
                          {issueData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Issue Stock
                </Button>
              </form>
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
              {availableItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                  </div>
                  <Badge 
                    variant={item.available < 50 ? "destructive" : item.available < 100 ? "secondary" : "default"}
                  >
                    {item.available}
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
                      <p className="font-semibold text-sm">{issue.id}</p>
                      <p className="text-xs text-muted-foreground">{issue.date}</p>
                    </div>
                    <Badge variant="outline">{issue.class}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {issue.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
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