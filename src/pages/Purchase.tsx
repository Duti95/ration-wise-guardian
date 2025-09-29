import { useState } from "react";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Dummy data for recent purchases
const recentPurchases = [
  {
    id: "PUR001",
    billNo: "BILL/2024/001",
    date: "2024-01-15",
    vendor: "Ram Provisions Store",
    phone: "+91 9876543210",
    items: [
      { name: "Rice", quantity: 100, unit: "kg", damaged: 2 },
      { name: "Dal", quantity: 50, unit: "kg", damaged: 0 }
    ],
    total: 8500
  },
  {
    id: "PUR002",
    billNo: "BILL/2024/002", 
    date: "2024-01-14",
    vendor: "Shyam Grocery",
    phone: "+91 9876543211",
    items: [
      { name: "Oil", quantity: 20, unit: "litres", damaged: 0.5 },
      { name: "Vegetables", quantity: 75, unit: "kg", damaged: 5 }
    ],
    total: 3200
  }
];

const unitOptions = ["kg", "litres", "pieces"];

export default function Purchase() {
  const [formData, setFormData] = useState({
    billNo: "",
    date: "",
    vendorName: "",
    vendorPhone: "",
    items: [{ name: "", quantity: "", unit: "kg", damaged: "" }]
  });
  
  const { toast } = useToast();

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "", unit: "kg", damaged: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Purchase Recorded",
      description: `Bill ${formData.billNo} has been successfully recorded.`,
    });
    // Reset form
    setFormData({
      billNo: "",
      date: "",
      vendorName: "",
      vendorPhone: "",
      items: [{ name: "", quantity: "", unit: "kg", damaged: "" }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Management</h1>
          <p className="text-muted-foreground">Record provisions received and track inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Record New Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bill Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billNo">Bill Number</Label>
                    <Input
                      id="billNo"
                      value={formData.billNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNo: e.target.value }))}
                      placeholder="Enter bill number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Vendor Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name</Label>
                    <Input
                      id="vendorName"
                      value={formData.vendorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorPhone">Phone Number</Label>
                    <Input
                      id="vendorPhone"
                      value={formData.vendorPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
                      placeholder="+91 XXXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Provisions Received</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(index, "name", e.target.value)}
                            placeholder="Enter item name"
                            required
                          />
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
                          <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {unitOptions.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                            Damaged
                          </Label>
                          <Input
                            type="number"
                            value={item.damaged}
                            onChange={(e) => updateItem(index, "damaged", e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end">
                          {formData.items.length > 1 && (
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
                  Record Purchase
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{purchase.billNo}</p>
                      <p className="text-xs text-muted-foreground">{purchase.date}</p>
                    </div>
                    <Badge variant="secondary">₹{purchase.total}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{purchase.vendor}</p>
                    <p className="text-xs text-muted-foreground">{purchase.phone}</p>
                  </div>
                  
                  <div className="space-y-1">
                    {purchase.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{item.quantity} {item.unit}</span>
                          {item.damaged > 0 && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">
                              -{item.damaged}
                            </Badge>
                          )}
                        </div>
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