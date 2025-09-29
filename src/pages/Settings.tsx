import { useState } from "react";
import { Shield, Upload, Calendar, Key, Smartphone, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [allowPreviousDateEntry, setAllowPreviousDateEntry] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  
  const { toast } = useToast();

  const handlePasswordToggle = () => {
    if (passwordProtection) {
      // Turning off password protection
      setPasswordProtection(false);
      toast({
        title: "Success",
        description: "Password protection disabled"
      });
    } else {
      // Turning on password protection - need to set password
      setIsPasswordDialogOpen(true);
    }
  };

  const handleSetPassword = () => {
    if (adminPassword.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setPasswordProtection(true);
    setIsPasswordDialogOpen(false);
    toast({
      title: "Success",
      description: "Password protection enabled"
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast({
          title: "Success",
          description: `Excel file "${file.name}" imported successfully`
        });
        // Here you would implement the actual file processing logic
      } else {
        toast({
          title: "Error",
          description: "Please select a valid Excel file (.xls or .xlsx)",
          variant: "destructive"
        });
      }
    }
  };

  const handlePreviousDateAccess = () => {
    if (!passwordProtection) {
      toast({
        title: "Error",
        description: "Please enable password protection first",
        variant: "destructive"
      });
      return;
    }

    if (enteredPassword === adminPassword) {
      setAllowPreviousDateEntry(!allowPreviousDateEntry);
      setEnteredPassword("");
      toast({
        title: "Success",
        description: `Previous date entry ${allowPreviousDateEntry ? 'disabled' : 'enabled'}`
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage application settings and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Password Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require password for secure data modification
                </p>
              </div>
              <Switch
                checked={passwordProtection}
                onCheckedChange={handlePasswordToggle}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label className="text-base">Previous Date Entry</Label>
                <p className="text-sm text-muted-foreground">
                  Allow entry of previous date stock with permission
                </p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  disabled={!passwordProtection}
                />
                <Button 
                  onClick={handlePreviousDateAccess}
                  disabled={!passwordProtection || !enteredPassword}
                  variant={allowPreviousDateEntry ? "destructive" : "default"}
                >
                  {allowPreviousDateEntry ? "Disable" : "Enable"}
                </Button>
              </div>
              
              {allowPreviousDateEntry && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    ⚠️ Previous date entry is currently enabled
                  </p>
                </div>
              )}
            </div>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Admin Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter a secure password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSetPassword} className="flex-1">
                      Set Password
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-accent" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label className="text-base">Import from Excel</Label>
                <p className="text-sm text-muted-foreground">
                  Import items and data from Excel files
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileImport}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label className="text-base">Date Restrictions</Label>
                <p className="text-sm text-muted-foreground">
                  Current date restriction settings
                </p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Today: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {allowPreviousDateEntry 
                    ? "Previous date entry is allowed" 
                    : "Only current date entry allowed"
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-success" />
              Platform Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <Monitor className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-sm">Desktop</p>
                  <p className="text-xs text-muted-foreground">Fully Supported</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-sm">Mobile</p>
                  <p className="text-xs text-muted-foreground">Responsive Design</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-foreground" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Application Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Database Status:</span>
                <span className="font-medium text-success">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Backup:</span>
                <span className="font-medium">Never</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Security Level:</span>
                <span className="font-medium">
                  {passwordProtection ? "High" : "Standard"}
                </span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Create Database Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}