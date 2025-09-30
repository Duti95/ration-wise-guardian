import { useState, useEffect } from "react";
import { Plus, Package, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  is_active: boolean;
}

interface Item {
  id: string;
  name: string;
  unit: string;
  rate_per_unit: number;
}

interface Purchase {
  id: string;
  bill_no: string;
  vendor_id: string;
  vendor_name: string;
  purchase_date: string;
  total_amount: number;
  items: Array<{
    item_name: string;
    quantity: number;
    rate_per_unit: number;
    total_price: number;
    damaged_quantity: number;
    mrp: number;
    discount_value: number;
    discount_type: string;
  }>;
}

const unitOptions = ["kg", "litres", "pieces"];

export default function Purchase() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    billNo: "",
    date: new Date().toISOString().split('T')[0],
    vendorId: "",
    items: [{ 
      itemId: "", 
      name: "", 
      quantity: "", 
      unit: "kg", 
      rate: "", 
      mrp: "", 
      discount: "", 
      discountType: "percentage", 
      damaged: "" 
    }]
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (vendorsError) throw vendorsError;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Fetch recent purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          vendors(name),
          purchase_items(
            *,
            items(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (purchasesError) throw purchasesError;

      setVendors(vendorsData || []);
      setItems(itemsData || []);
      
      // Transform purchases data
      const transformedPurchases = purchasesData?.map(purchase => ({
        id: purchase.id,
        bill_no: purchase.bill_no,
        vendor_id: purchase.vendor_id,
        vendor_name: purchase.vendors?.name || 'Unknown',
        purchase_date: new Date(purchase.purchase_date).toLocaleDateString('en-IN'),
        total_amount: purchase.total_amount,
        items: purchase.purchase_items?.map((item: any) => ({
          item_name: item.items?.name || 'Unknown',
          quantity: item.quantity,
          rate_per_unit: item.rate_per_unit,
          total_price: item.total_price,
          damaged_quantity: item.damaged_quantity,
          mrp: item.mrp,
          discount_value: item.discount_value,
          discount_type: item.discount_type
        })) || []
      })) || [];

      setRecentPurchases(transformedPurchases);
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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        itemId: "", 
        name: "", 
        quantity: "", 
        unit: "kg", 
        rate: "", 
        mrp: "", 
        discount: "", 
        discountType: "percentage", 
        damaged: "" 
      }]
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

  const calculateItemTotal = (item: any) => {
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    let total = quantity * rate;
    if (item.discountType === 'percentage') {
      total = total * (1 - discount / 100);
    } else {
      total = total - discount;
    }
    
    return total;
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.billNo || !formData.vendorId || formData.items.some(item => !item.itemId || !item.quantity || !item.rate)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const totalAmount = getTotalAmount();

      // Insert purchase record
      const { data: purchaseRecord, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          bill_no: formData.billNo,
          vendor_id: formData.vendorId,
          purchase_date: formData.date,
          total_amount: totalAmount
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Insert purchase items and update stock
      for (const item of formData.items) {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const discount = parseFloat(item.discount) || 0;
        const damaged = parseFloat(item.damaged) || 0;
        const itemTotal = calculateItemTotal(item);

        // Insert purchase item
        const { error: itemError } = await supabase
          .from('purchase_items')
          .insert({
            purchase_id: purchaseRecord.id,
            item_id: item.itemId,
            quantity: quantity,
            mrp: parseFloat(item.mrp) || null,
            discount_type: item.discountType,
            discount_value: discount,
            rate_per_unit: rate,
            total_price: itemTotal,
            damaged_quantity: damaged
          });

        if (itemError) throw itemError;

        // Update item stock (add quantity minus damaged)
        const effectiveQuantity = quantity - damaged;
        
        // Update stock and rate
        const { data: currentItem } = await supabase
          .from('items')
          .select('current_stock')
          .eq('id', item.itemId)
          .single();

        if (currentItem) {
          const { error: stockError } = await supabase
            .from('items')
            .update({
              current_stock: currentItem.current_stock + effectiveQuantity,
              rate_per_unit: rate
            })
            .eq('id', item.itemId);

          if (stockError) throw stockError;
        }
      }

      toast({
        title: "Success",
        description: `Purchase recorded successfully. Stock updated.`,
      });

      // Reset form and refresh data
      setFormData({
        billNo: "",
        date: new Date().toISOString().split('T')[0],
        vendorId: "",
        items: [{ 
          itemId: "", 
          name: "", 
          quantity: "", 
          unit: "kg", 
          rate: "", 
          mrp: "", 
          discount: "", 
          discountType: "percentage", 
          damaged: "" 
        }]
      });

      fetchData();
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast({
        title: "Error",
        description: "Failed to record purchase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading purchase data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Management</h1>
          <p className="text-muted-foreground">Record provisions received with vendor details and pricing</p>
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
                    <Label htmlFor="billNo">Bill Number *</Label>
                    <Input
                      id="billNo"
                      value={formData.billNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNo: e.target.value }))}
                      placeholder="Enter bill number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date + 'T' + new Date().toTimeString().slice(0,5)}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value.split('T')[0] }))}
                      required
                    />
                  </div>
                </div>

                {/* Vendor Selection */}
                <div className="space-y-2">
                  <Label>Vendor Selection *</Label>
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select registered vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name} - {vendor.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Card key={index} className="p-6 border-2">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-base">Item #{index + 1}</h3>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            Remove Item
                          </Button>
                        )}
                      </div>

                      {/* Row 1: Item Selection and Quantity */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium">Item Name *</Label>
                          <Select 
                            value={item.itemId} 
                            onValueChange={(value) => {
                              const selectedItem = items.find(i => i.id === value);
                              updateItem(index, "itemId", value);
                              if (selectedItem) {
                                updateItem(index, "name", selectedItem.name);
                                updateItem(index, "unit", selectedItem.unit);
                                updateItem(index, "rate", selectedItem.rate_per_unit.toString());
                              }
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select item from inventory" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((availableItem) => (
                                <SelectItem key={availableItem.id} value={availableItem.id}>
                                  {availableItem.name} ({availableItem.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity *</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", e.target.value)}
                              placeholder="0"
                              min="0"
                              step="0.01"
                              required
                              className="h-11"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Pricing Details */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Rate/Unit *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(index, "rate", e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              required
                              className="h-11 pl-7"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">MRP</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              value={item.mrp}
                              onChange={(e) => updateItem(index, "mrp", e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="h-11 pl-7"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Discount</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(index, "discount", e.target.value)}
                              placeholder="0"
                              min="0"
                              step="0.01"
                              className="h-11 flex-1"
                            />
                            <Select 
                              value={item.discountType} 
                              onValueChange={(value) => updateItem(index, "discountType", value)}
                            >
                              <SelectTrigger className="w-20 h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="amount">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
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
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-primary" />
                            Item Total
                          </Label>
                          <div className="h-11 flex items-center justify-center bg-primary/10 border-2 border-primary/20 rounded-md">
                            <span className="text-lg font-bold text-primary">
                              ₹{item.quantity && item.rate ? calculateItemTotal(item).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">₹{getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Recording..." : "Record Purchase"}
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
                      <p className="font-semibold text-sm">{purchase.bill_no}</p>
                      <p className="text-xs text-muted-foreground">{purchase.purchase_date}</p>
                      <p className="text-xs text-muted-foreground">{purchase.vendor_name}</p>
                    </div>
                    <Badge variant="outline">₹{purchase.total_amount.toFixed(2)}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {purchase.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{item.item_name} - {item.quantity}</span>
                        <div className="text-right">
                          <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                          {item.damaged_quantity > 0 && (
                            <div className="text-destructive">Damaged: {item.damaged_quantity}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {recentPurchases.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent purchases found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}