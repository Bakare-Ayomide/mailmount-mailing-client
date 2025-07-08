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
import { apiService, EmailAccount, EmailProvider } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AccountManagerProps {
  onBack: () => void;
}

export function AccountManager({ onBack }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [providers, setProviders] = useState<Record<string, EmailProvider>>({});
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
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
    loadAccounts();
    loadProviders();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await apiService.getAccounts();
      if (response.success) {
        setAccounts(response.accounts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive",
      });
    }
  };

  const loadProviders = async () => {
    try {
      const response = await apiService.getProviders();
      setProviders(response.providers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email providers",
        variant: "destructive",
      });
    }
  };

  const handleEmailChange = async (value: string) => {
    setEmail(value);
    if (value.includes('@')) {
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
    if (!email || !password || !selectedProvider) {
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
    if (!email || !password || !displayName) {
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

  return (
    <div className="flex-1 flex flex-col bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-2xl font-semibold">Account Management</h1>
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
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your email password or app password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
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
                        <Label>Provider Name</Label>
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
                            <Label>Host</Label>
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
                            <Label>Host</Label>
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
                    disabled={loading}
                  >
                    Test Connection
                  </Button>
                  <Button 
                    onClick={addAccount} 
                    disabled={loading}
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