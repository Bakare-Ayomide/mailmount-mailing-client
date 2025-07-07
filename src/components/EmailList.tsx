import { useState } from "react";
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

interface EmailListProps {
  onEmailSelect: (email: any) => void;
}

// Mock email data
const mockEmails = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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

export function EmailList({ onEmailSelect }: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(mockEmails.map(email => email.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (emailId: number) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

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
          
          <Button variant="ghost" size="sm">🔄</Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {mockEmails.map((email) => (
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