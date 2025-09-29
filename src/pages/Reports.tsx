import { useState } from "react";
import { FileText, Download, Filter, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Dummy data for reports
const provisionIssueData = [
  {
    date: "2024-01-15",
    item: "Rice",
    issued: 75,
    balance: 375,
    unit: "kg",
    class: "Classes Below 8"
  },
  {
    date: "2024-01-15", 
    item: "Dal",
    issued: 25,
    balance: 50,
    unit: "kg",
    class: "Classes Below 11"
  },
  {
    date: "2024-01-14",
    item: "Oil",
    issued: 8,
    balance: 17,
    unit: "litres",
    class: "Intermediate (11-12)"
  },
  {
    date: "2024-01-14",
    item: "Vegetables",
    issued: 45,
    balance: 75,
    unit: "kg",
    class: "Classes Below 8"
  }
];

const stockValueData = [
  { item: "Rice", quantity: 375, unit: "kg", rate: 45, value: 16875 },
  { item: "Dal", quantity: 50, unit: "kg", rate: 120, value: 6000 },
  { item: "Oil", quantity: 17, unit: "litres", rate: 140, value: 2380 },
  { item: "Vegetables", quantity: 75, unit: "kg", rate: 30, value: 2250 },
  { item: "Milk", quantity: 45, unit: "litres", rate: 60, value: 2700 }
];

const reportTypes = [
  "Date-wise Provision Issue",
  "Item-wise Issue Report",
  "Stock Value Report",
  "Monthly Summary",
  "Yearly Overview"
];

const filterPeriods = [
  { label: "Today", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "This Month", value: "30" },
  { label: "This Year", value: "365" },
  { label: "Custom Range", value: "custom" }
];

export default function Reports() {
  const [filters, setFilters] = useState({
    reportType: "",
    period: "",
    startDate: "",
    endDate: "",
    itemFilter: ""
  });

  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!filters.reportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to generate.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Generated",
      description: `${filters.reportType} has been generated successfully.`,
    });
  };

  const handleDownloadReport = (format: string) => {
    toast({
      title: "Download Started",
      description: `Report is being downloaded in ${format.toUpperCase()} format.`,
    });
  };

  const totalStockValue = stockValueData.reduce((sum, item) => sum + item.value, 0);
  const totalIssued = provisionIssueData.reduce((sum, item) => sum + item.issued, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and analyze provision reports</p>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={filters.reportType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select 
                value={filters.period} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {filterPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                disabled={filters.period !== "custom"}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={filters.period !== "custom"}
              />
            </div>

            <div className="space-y-2">
              <Label>Item Filter</Label>
              <Input
                placeholder="Filter by item name"
                value={filters.itemFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, itemFilter: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={() => handleDownloadReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => handleDownloadReport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Issued</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalIssued}</div>
            <p className="text-xs text-muted-foreground">Recent issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Calendar className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stockValueData.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date-wise Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Provision Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <span>Date</span>
                <span>Item</span>
                <span>Issued</span>
                <span>Balance</span>
                <span>Class</span>
              </div>
              {provisionIssueData.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 text-sm py-2 border-b last:border-b-0">
                  <span className="text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-IN')}
                  </span>
                  <span className="font-medium">{item.item}</span>
                  <span className="text-destructive">-{item.issued}{item.unit}</span>
                  <span className="text-success">{item.balance}{item.unit}</span>
                  <Badge variant="outline" className="text-xs w-fit">
                    {item.class.split(' ')[0]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Value Report */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <span>Item</span>
                <span>Quantity</span>
                <span>Rate</span>
                <span>Value</span>
              </div>
              {stockValueData.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b last:border-b-0">
                  <span className="font-medium">{item.item}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span>₹{item.rate}</span>
                  <span className="font-semibold text-primary">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="grid grid-cols-4 gap-2 text-sm py-2 border-t-2 font-bold">
                <span className="col-span-3">Total Value:</span>
                <span className="text-primary">₹{totalStockValue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}