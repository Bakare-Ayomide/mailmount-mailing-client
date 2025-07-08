import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { apiService, EmailMessage, EmailAccount } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EmailListProps {
  onEmailSelect: (email: any) => void;
  folder?: string;
  accounts?: EmailAccount[];
}

// Mock email data for demo purposes
const mockEmails = [
  {
    id: "mock-1",
    from: "GitHub",
    fromEmail: "noreply@github.com",
    subject: "Your security alert for repository swift-mail",
    preview: "A new SSH key was added to your account...",
    time: "2:30 PM",
    unread: true,
    important: false,
    starred: false,
    hasAttachment: false,
    category: "Primary",
  },
  {
    id: "mock-2",
    from: "Sarah Johnson",
    fromEmail: "sarah.j@company.com",
    subject: "Project Update - Q4 Development Milestones",
    preview: "Hi team, I wanted to share an update on our Q4 development progress...",
    time: "1:45 PM",
    unread: true,
    important: true,
    starred: true,
    hasAttachment: true,
    category: "Work",
  },
  {
    id: "mock-3",
    from: "Netflix",
    fromEmail: "info@netflix.com",
    subject: "New shows added to your list",
    preview: "Check out these new releases we think you'll love...",
    time: "12:20 PM",
    unread: false,
    important: false,
    starred: false,
    hasAttachment: false,
    category: "Promotions",
  },
  {
    id: "mock-4",
    from: "Mom",
    fromEmail: "mom@family.com",
    subject: "Family dinner this weekend?",
    preview: "Hi honey, are you free for dinner this Saturday? Your dad wants to try...",
    time: "11:30 AM",
    unread: true,
    important: false,
    starred: true,
    hasAttachment: false,
    category: "Personal",
  },
  {
    id: "mock-5",
    from: "Bank of America",
    fromEmail: "alerts@bankofamerica.com",
    subject: "Your monthly statement is ready",
    preview: "Your statement for December 2024 is now available...",
    time: "10:15 AM",
    unread: false,
    important: false,
    starred: false,
    hasAttachment: true,
    category: "Finance",
  },
];

export function EmailList({ onEmailSelect, folder = 'inbox', accounts = [] }: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
  }, [folder, accounts]);

  const loadEmails = async () => {
    if (accounts.length === 0) return;
    
    setLoading(true);
    try {
      const response = await apiService.getEmails();
      if (response.success) {
        let filteredEmails = response.emails;
        
        // Filter by folder
        if (folder === 'inbox') {
          filteredEmails = filteredEmails.filter(email => 
            email.folder === 'INBOX' || email.folder === 'Inbox'
          );
        } else if (folder === 'sent') {
          filteredEmails = filteredEmails.filter(email => 
            email.folder === 'SENT' || email.folder === 'Sent Messages'
          );
        } else if (folder === 'starred') {
          filteredEmails = filteredEmails.filter(email => email.starred);
        } else if (folder === 'important') {
          filteredEmails = filteredEmails.filter(email => email.important);
        } else if (folder === 'drafts') {
          filteredEmails = filteredEmails.filter(email => 
            email.folder === 'DRAFTS' || email.folder === 'Drafts'
          );
        } else if (folder === 'spam') {
          filteredEmails = filteredEmails.filter(email => 
            email.folder === 'SPAM' || email.folder === 'Junk'
          );
        } else if (folder === 'trash') {
          filteredEmails = filteredEmails.filter(email => 
            email.folder === 'TRASH' || email.folder === 'Deleted Messages'
          );
        }
        
        setEmails(filteredEmails);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async () => {
    if (accounts.length === 0) {
      toast({
        title: "No Accounts",
        description: "Please add an email account first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      for (const account of accounts) {
        await apiService.syncEmails(account.id, 'INBOX', 50);
      }
      await loadEmails();
      toast({
        title: "Success",
        description: "Emails synchronized successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getEmailPreview = (email: EmailMessage) => {
    const content = email.body.text || email.body.html || '';
    return content.substring(0, 150).replace(/<[^>]*>/g, '');
  };

  const displayEmails = emails.length > 0 ? emails : (accounts.length === 0 ? [] : mockEmails);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      Primary: "bg-primary text-primary-foreground",
      Work: "bg-secondary text-secondary-foreground",
      Promotions: "bg-email-important text-white",
      Personal: "bg-purple-500 text-white",
      Finance: "bg-orange-500 text-white",
    };
    return colors[category as keyof typeof colors] || "bg-muted";
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-12 border-b bg-card flex items-center px-4 gap-2">
        <Checkbox 
          checked={selectAll}
          onCheckedChange={handleSelectAll}
        />
        
        {selectedEmails.length > 0 && (
          <>
            <Button variant="ghost" size="sm">🗑️</Button>
            <Button variant="ghost" size="sm">📥</Button>
            <Button variant="ghost" size="sm">🏷️</Button>
            <Button variant="ghost" size="sm">⭐</Button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Sort ▼</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border shadow-lg">
              <DropdownMenuItem>Date (newest first)</DropdownMenuItem>
              <DropdownMenuItem>Date (oldest first)</DropdownMenuItem>
              <DropdownMenuItem>From A-Z</DropdownMenuItem>
              <DropdownMenuItem>Subject A-Z</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="sm" onClick={syncEmails} disabled={loading}>
            {loading ? "⏳" : "🔄"}
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {displayEmails.map((email) => (
          <div
            key={email.id}
            className={cn(
              "border-b hover:bg-muted/50 cursor-pointer transition-colors",
              email.unread ? "bg-background" : "bg-muted/20"
            )}
            onClick={() => onEmailSelect(email)}
          >
            <div className="flex items-center px-4 py-3 gap-3">
              <Checkbox 
                checked={selectedEmails.includes(email.id)}
                onCheckedChange={() => handleSelectEmail(email.id)}
                onClick={(e) => e.stopPropagation()}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {email.starred ? "⭐" : "☆"}
              </Button>

              {email.important && (
                <span className="text-email-important text-sm">❗</span>
              )}

              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {email.from.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "font-medium truncate",
                    email.unread ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {email.from}
                  </span>
                  
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getCategoryBadgeColor(email.category))}
                  >
                    {email.category}
                  </Badge>
                </div>
                
                <div className={cn(
                  "text-sm mb-1 truncate",
                  email.unread ? "font-medium text-foreground" : "text-muted-foreground"
                )}>
                  {email.subject}
                </div>
                
                <div className="text-xs text-muted-foreground truncate">
                  {email.preview}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">{email.time}</span>
                <div className="flex gap-1">
                  {email.hasAttachment && (
                    <span className="text-xs">📎</span>
                  )}
                  {email.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}