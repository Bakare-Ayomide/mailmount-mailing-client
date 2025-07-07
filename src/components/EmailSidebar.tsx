import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EmailSidebarProps {
  collapsed: boolean;
  onCompose: () => void;
  currentView: string;
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

export function EmailSidebar({ collapsed, onCompose, currentView }: EmailSidebarProps) {
  return (
    <div className={cn(
      "bg-card border-r transition-all duration-300 flex flex-col",
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
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
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
            {accountItems.map((account) => (
              <Button
                key={account.id}
                variant="ghost"
                className="w-full justify-start h-12 px-3"
              >
                <div className={cn("w-3 h-3 rounded-full mr-3", account.color)} />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{account.label}</div>
                  <div className="text-xs text-muted-foreground">{account.type}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Storage Info */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Storage used</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">6.8 GB of 15 GB used</div>
        </div>
      )}
    </div>
  );
}