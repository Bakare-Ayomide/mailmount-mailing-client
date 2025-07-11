
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService, EmailAccount, EmailProvider } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Server } from "lucide-react";

interface AccountManagerProps {
  onBack: () => void;
}

export function AccountManager({ onBack }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [providers, setProviders] = useState<Record<string, EmailProvider>>({});
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isCustomProvider, setIsCustomProvider] = useState(false);

  // Custom provider states
  const [customName, setCustomName] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapSecure, setImapSecure] = useState(true);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('online');
      loadAccounts();
      loadProviders();
    } catch (error) {
      setServerStatus('offline');
      console.error("Server is offline:", error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await apiService.getAccounts();
      if (response.success) {
        setAccounts(response.accounts);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await apiService.getProviders();
      setProviders(response.providers);
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  };

  const handleEmailChange = async (value: string) => {
    setEmail(value);
    if (value.includes('@') && serverStatus === 'online') {
      try {
        const response = await apiService.detectProvider(value);
        if (response.provider) {
          setSelectedProvider(response.provider);
          setIsCustomProvider(false);
        } else {
          setIsCustomProvider(true);
        }
      } catch (error) {
        console.log("Auto-detection failed, using custom provider");
        setIsCustomProvider(true);
      }
    }
  };

  const testConnection = async () => {
    // Fix validation logic - check for actual values, not just truthy
    if (!email.trim() || !password.trim() || !selectedProvider) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.testConnection(email, password, selectedProvider);
      toast({
        title: "Success",
        description: "Connection test successful!",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomProvider = async () => {
    if (!customName.trim() || !imapHost.trim() || !smtpHost.trim()) {
      toast({
        title: "Error",
        description: "Please fill all custom provider fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.createCustomProvider(
        customName,
        imapHost,
        parseInt(imapPort),
        imapSecure,
        smtpHost,
        parseInt(smtpPort),
        smtpSecure
      );
      setSelectedProvider(response.provider);
      toast({
        title: "Success",
        description: "Custom provider created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom provider",
        variant: "destructive",
      });
    }
  };

  const addAccount = async () => {
    // Fix validation logic - check for actual values, not just truthy
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProvider) {
      toast({
        title: "Error",
        description: "Please select or create a provider",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.addAccount(email, password, displayName, selectedProvider);
      await loadAccounts();
      setShowAddDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Account added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setSelectedProvider(null);
    setIsCustomProvider(false);
    setCustomName("");
    setImapHost("");
    setImapPort("993");
    setImapSecure(true);
    setSmtpHost("");
    setSmtpPort("587");
    setSmtpSecure(false);
  };

  const startServer = () => {
    toast({
      title: "Server Setup",
      description: "Run 'npm run dev:server' in your terminal to start the backend server",
    });
  };

  if (serverStatus === 'checking') {
    return (
      <div className="flex-1 flex flex-col bg-background p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold">Account Management</h1>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking server status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <div className="flex-1 flex flex-col bg-background p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold">Account Management</h1>
        </div>
        
        <div className="flex items-center justify-center flex-1">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Server Offline</h3>
              <p className="text-muted-foreground mb-4">
                The backend server is not running. Please start it to manage email accounts.
              </p>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Run <code className="bg-muted px-1 rounded">npm run dev:server</code> in your terminal
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={checkServerStatus} variant="outline" className="flex-1">
                  Check Again
                </Button>
                <Button onClick={startServer} className="flex-1">
                  How to Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-2xl font-semibold">Account Management</h1>
        <Badge variant="outline" className="ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Server Online
        </Badge>
      </div>

      {/* Accounts List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Connected Accounts</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>+ Add Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Email Account</DialogTitle>
                <DialogDescription>
                  Connect a new email account to MailMount
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your email password or app password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                {!isCustomProvider && selectedProvider && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Detected Provider</h4>
                    <Badge variant="outline">{selectedProvider.name}</Badge>
                  </div>
                )}

                {isCustomProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Custom Provider Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Provider Name *</Label>
                        <Input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="My Email Provider"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h5 className="font-medium">IMAP Settings</h5>
                          <div className="space-y-2">
                            <Label>Host *</Label>
                            <Input
                              value={imapHost}
                              onChange={(e) => setImapHost(e.target.value)}
                              placeholder="imap.example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Port</Label>
                            <Input
                              value={imapPort}
                              onChange={(e) => setImapPort(e.target.value)}
                              placeholder="993"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={imapSecure}
                              onCheckedChange={setImapSecure}
                            />
                            <Label>Use SSL/TLS</Label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium">SMTP Settings</h5>
                          <div className="space-y-2">
                            <Label>Host *</Label>
                            <Input
                              value={smtpHost}
                              onChange={(e) => setSmtpHost(e.target.value)}
                              placeholder="smtp.example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Port</Label>
                            <Input
                              value={smtpPort}
                              onChange={(e) => setSmtpPort(e.target.value)}
                              placeholder="587"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={smtpSecure}
                              onCheckedChange={setSmtpSecure}
                            />
                            <Label>Use SSL/TLS</Label>
                          </div>
                        </div>
                      </div>

                      <Button onClick={createCustomProvider} variant="outline">
                        Create Custom Provider
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={testConnection} 
                    variant="outline" 
                    disabled={loading || !email.trim() || !password.trim() || !selectedProvider}
                  >
                    Test Connection
                  </Button>
                  <Button 
                    onClick={addAccount} 
                    disabled={loading || !email.trim() || !password.trim() || !displayName.trim() || !selectedProvider}
                    className="flex-1"
                  >
                    {loading ? "Adding..." : "Add Account"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No accounts connected yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first email account to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{account.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{account.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {account.provider.name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {account.lastSync ? new Date(account.lastSync).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
