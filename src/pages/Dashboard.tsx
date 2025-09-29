import { Calendar, Users, DollarSign, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dummy data
const todaysMenu = {
  breakfast: "Upma with vegetables, Milk",
  lunch: "Rice, Dal, Vegetable curry, Chapati",
  snacks: "Banana, Groundnut chikki"
};

const strengthData = {
  below8: { boys: 145, girls: 138, total: 283 },
  below11: { boys: 167, girls: 159, total: 326 },
  intermediate: { boys: 89, girls: 94, total: 183 }
};

const stockItems = [
  { name: "Rice", quantity: 450, unit: "kg", status: "sufficient", level: 85 },
  { name: "Dal", quantity: 25, unit: "kg", status: "warning", level: 35 },
  { name: "Oil", quantity: 8, unit: "litres", status: "danger", level: 15 },
  { name: "Vegetables", quantity: 120, unit: "kg", status: "sufficient", level: 70 },
  { name: "Milk", quantity: 45, unit: "litres", status: "warning", level: 40 }
];

const weeklyMenu = [
  { day: "Monday", items: ["Rice, Dal, Sabzi", "Milk, Banana"] },
  { day: "Tuesday", items: ["Pulao, Curd", "Poha, Tea"] },
  { day: "Wednesday", items: ["Roti, Dal, Sabzi", "Kheer, Fruits"] },
  { day: "Thursday", items: ["Rice, Sambar", "Upma, Milk"] },
  { day: "Friday", items: ["Biryani, Raita", "Halwa, Tea"] },
  { day: "Saturday", items: ["Chole Bhature", "Fruits, Milk"] }
];

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

export default function Dashboard() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const totalStudents = strengthData.below8.total + strengthData.below11.total + strengthData.intermediate.total;
  const perCapitaExpense = ((totalStudents * 12.5) / totalStudents).toFixed(2);

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
            {weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {' '}
            {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
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
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{(totalStudents * 12.5).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per day allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Per Capita</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{perCapitaExpense}</div>
            <p className="text-xs text-muted-foreground">Yesterday's expense</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Items</CardTitle>
            <Package className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory</p>
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
              Today's Government Menu
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

        {/* Weekly Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Menu Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyMenu.map((day, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  day.day === today.toLocaleDateString('en-US', { weekday: 'long' }) 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-muted/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{day.day}</h4>
                    {day.day === today.toLocaleDateString('en-US', { weekday: 'long' }) && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {day.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-xs text-muted-foreground">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Particulars */}
        <Card>
          <CardHeader>
            <CardTitle>Student Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Classes Below 8</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{strengthData.below8.boys}</p>
                    <p className="text-xs text-muted-foreground">Boys</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{strengthData.below8.girls}</p>
                    <p className="text-xs text-muted-foreground">Girls</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{strengthData.below8.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Classes Below 11</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{strengthData.below11.boys}</p>
                    <p className="text-xs text-muted-foreground">Boys</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{strengthData.below11.girls}</p>
                    <p className="text-xs text-muted-foreground">Girls</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{strengthData.below11.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Intermediate (11-12)</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{strengthData.intermediate.boys}</p>
                    <p className="text-xs text-muted-foreground">Boys</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{strengthData.intermediate.girls}</p>
                    <p className="text-xs text-muted-foreground">Girls</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{strengthData.intermediate.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockItems.map((item, index) => (
                <div key={index} className="p-4 bg-card border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <Badge 
                      className={`${getStockColor(item.status)} ${getStockTextColor(item.status)} text-xs`}
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-sm font-medium">{item.level}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStockColor(item.status)}`}
                      style={{ width: `${item.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}