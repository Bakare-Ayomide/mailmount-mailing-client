import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { apiService, EmailAccount } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EmailSidebarProps {
  collapsed: boolean;
  onCompose: () => void;
  currentView: string;
  onViewChange?: (view: string) => void;
  onFolderChange?: (folder: string) => void;
}

const sidebarItems = [
  { id: 'inbox', label: 'Inbox', count: 12, icon: '📥' },
  { id: 'starred', label: 'Starred', count: 3, icon: '⭐' },
  { id: 'important', label: 'Important', count: 5, icon: '❗' },
  { id: 'sent', label: 'Sent', count: 0, icon: '📤' },
  { id: 'drafts', label: 'Drafts', count: 2, icon: '📝' },
  { id: 'spam', label: 'Spam', count: 8, icon: '🚫' },
  { id: 'trash', label: 'Trash', count: 0, icon: '🗑️' },
];

const accountItems = [
  { id: 'gmail', label: 'john@gmail.com', type: 'Gmail', color: 'bg-red-500' },
  { id: 'outlook', label: 'john@outlook.com', type: 'Outlook', color: 'bg-blue-500' },
  { id: 'yahoo', label: 'john@yahoo.com', type: 'Yahoo', color: 'bg-purple-500' },
];

export function EmailSidebar({ collapsed, onCompose, currentView, onViewChange, onFolderChange }: EmailSidebarProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [emailCounts, setEmailCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
    loadEmailCounts();
  }, []);

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

  const loadEmailCounts = async () => {
    try {
      const response = await apiService.getEmails();
      if (response.success) {
        // Calculate counts for different folders/categories
        const counts = {
          inbox: response.emails.filter(e => e.folder === 'INBOX' && !e.read).length,
          starred: response.emails.filter(e => e.starred).length,
          important: response.emails.filter(e => e.important).length,
          sent: response.emails.filter(e => e.folder === 'SENT' || e.folder === 'Sent Messages').length,
          drafts: response.emails.filter(e => e.folder === 'DRAFTS' || e.folder === 'Drafts').length,
          spam: response.emails.filter(e => e.folder === 'SPAM' || e.folder === 'Junk').length,
          trash: response.emails.filter(e => e.folder === 'TRASH' || e.folder === 'Deleted Messages').length,
        };
        setEmailCounts(counts);
      }
    } catch (error) {
      console.error("Failed to load email counts:", error);
    }
  };

  const handleFolderClick = (folderId: string) => {
    onViewChange?.(folderId);
    onFolderChange?.(folderId);
  };

  const handleAddAccount = () => {
    onViewChange?.('accounts');
  };

  const getProviderColor = (providerName: string) => {
    const colors = {
      'Gmail': 'bg-red-500',
      'Outlook.com': 'bg-blue-500',
      'Hotmail': 'bg-blue-500',
      'Yahoo Mail': 'bg-purple-500',
      'Zoho Mail': 'bg-orange-500',
      'ProtonMail': 'bg-indigo-500',
    };
    return colors[providerName as keyof typeof colors] || 'bg-primary';
  };

  const sidebarItemsWithCounts = sidebarItems.map(item => ({
    ...item,
    count: emailCounts[item.id] || 0
  }));

  return (
    <div className={cn(
      "bg-card border-r transition-all duration-300 flex flex-col h-full",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Compose Button */}
      <div className="p-4">
        <Button 
          onClick={onCompose}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground font-medium"
          size={collapsed ? "sm" : "default"}
        >
          {collapsed ? "✏️" : "✏️ Compose"}
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="px-2 space-y-1">
        {sidebarItemsWithCounts.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => handleFolderClick(item.id)}
            className={cn(
              "w-full justify-start h-10 px-3",
              currentView === item.id ? "bg-primary-light text-primary" : "hover:bg-muted"
            )}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.count}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Account Switcher */}
      {!collapsed && (
        <div className="px-2 flex-1">
          <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">
            Accounts
          </h3>
          <div className="space-y-1">
            {accounts.length === 0 ? (
              <Button
                variant="ghost"
                onClick={handleAddAccount}
                className="w-full justify-start h-12 px-3 text-muted-foreground"
              >
                <div className="w-3 h-3 rounded-full mr-3 bg-muted-foreground/30" />
                <div className="flex-1 text-left">
                  <div className="text-sm">Add Account</div>
                  <div className="text-xs">Connect your email</div>
                </div>
              </Button>
            ) : (
              <>
                {accounts.map((account) => (
                  <Button
                    key={account.id}
                    variant="ghost"
                    className="w-full justify-start h-12 px-3"
                  >
                    <div className={cn("w-3 h-3 rounded-full mr-3", getProviderColor(account.provider.name))} />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium truncate">{account.email}</div>
                      <div className="text-xs text-muted-foreground">{account.provider.name}</div>
                    </div>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={handleAddAccount}
                  className="w-full justify-start h-10 px-3 text-muted-foreground"
                >
                  <span className="text-sm mr-3">+</span>
                  <span className="text-sm">Add Account</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Server Status */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Server Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
          </div>
        </div>
      )}
    </div>
  );
}