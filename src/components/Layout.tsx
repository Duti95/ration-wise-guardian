import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Utensils, 
  FileText,
  Menu,
  X,
  Users,
  Settings as SettingsIcon,
  Box,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import treisLogo from "@/assets/treis-logo.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Purchase", path: "/purchase" },
  { icon: Package, label: "Stock Issue", path: "/stock-issue" },
  { icon: Box, label: "Items", path: "/items" },
  { icon: Utensils, label: "Utensils", path: "/utensils" },
  { icon: Users, label: "Vendors", path: "/vendors" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-primary/90"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <img src={treisLogo} alt="TREIS Logo" className="h-10 w-10 lg:h-12 lg:w-12" />
            <div>
              <h1 className="text-sm lg:text-xl font-bold text-primary-foreground">
                TREIS Hostel Management
              </h1>
              <p className="text-xs lg:text-sm text-primary-foreground/80 hidden sm:block">
                Complete Hostel Management Solution
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/90"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border w-64 transition-transform duration-300 lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-16 lg:mt-0">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
