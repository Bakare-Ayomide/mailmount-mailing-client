import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { EmailSidebar } from "./EmailSidebar";
import { EmailList } from "./EmailList";
import { EmailCompose } from "./EmailCompose";
import { EmailViewer } from "./EmailViewer";
import { AccountManager } from "./AccountManager";
import { apiService, EmailAccount } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailLayoutProps {
  children?: React.ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps) {
  const [currentView, setCurrentView] = useState<'inbox' | 'compose' | 'email' | 'accounts'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadAccounts();
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

  const handleEmailSelect = (email: any) => {
    setSelectedEmail(email);
    setCurrentView('email');
  };

  const handleCompose = () => {
    setCurrentView('compose');
    setSelectedEmail(null);
  };

  const handleBackToInbox = () => {
    setCurrentView('inbox');
    setSelectedEmail(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as any);
    setSelectedEmail(null);
  };

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
  };

  const sidebarItems = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'starred', label: 'Starred' },
    { id: 'important', label: 'Important' },
    { id: 'sent', label: 'Sent' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'spam', label: 'Spam' },
    { id: 'trash', label: 'Trash' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="md:hidden"
          >
            ☰
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MailMount
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-4">
          <Input 
            placeholder="Search mail..." 
            className="w-full bg-muted border-0 focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border shadow-lg">
            <DropdownMenuItem onClick={() => setCurrentView('accounts')}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView('accounts')}>
                Add Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Mobile overlay, desktop side-by-side */}
        <div className={cn(
          "transition-all duration-300",
          "md:relative md:translate-x-0",
          sidebarCollapsed ? "absolute -translate-x-full md:translate-x-0" : "absolute inset-y-0 left-0 z-40 md:relative"
        )}>
          <EmailSidebar 
            collapsed={sidebarCollapsed}
            onCompose={handleCompose}
            currentView={currentView}
            onViewChange={handleViewChange}
            onFolderChange={handleFolderChange}
          />
        </div>

        {/* Overlay for mobile */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {(currentView === 'inbox' || sidebarItems.find(item => item.id === currentView)) && (
            <EmailList 
              onEmailSelect={handleEmailSelect} 
              folder={currentFolder}
              accounts={accounts}
            />
          )}
          
          {currentView === 'compose' && (
            <EmailCompose onBack={handleBackToInbox} />
          )}
          
          {currentView === 'email' && selectedEmail && (
            <EmailViewer 
              email={selectedEmail} 
              onBack={handleBackToInbox} 
            />
          )}

          {currentView === 'accounts' && (
            <AccountManager onBack={handleBackToInbox} />
          )}
        </div>
      </div>
    </div>
  );
}