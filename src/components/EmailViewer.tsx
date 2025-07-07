import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EmailViewerProps {
  email: any;
  onBack: () => void;
}

export function EmailViewer({ email, onBack }: EmailViewerProps) {
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

  const formatEmailContent = (content: string) => {
    // Simple mock email content
    return `Dear User,

${content}

This is a full email message with multiple paragraphs to demonstrate the email viewing functionality.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Best regards,
${email.from}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 border-b bg-card flex items-center px-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm">🗑️</Button>
          <Button variant="ghost" size="sm">📥</Button>
          <Button variant="ghost" size="sm">🏷️</Button>
          <Button variant="ghost" size="sm">{email.starred ? "⭐" : "☆"}</Button>
          <Button variant="ghost" size="sm">↩️</Button>
          <Button variant="ghost" size="sm">↗️</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">⋮</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border shadow-lg">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Add to task</DropdownMenuItem>
              <DropdownMenuItem>Print</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Subject and Labels */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-2xl font-semibold flex-1">{email.subject}</h1>
              {email.important && (
                <span className="text-email-important text-lg">❗</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getCategoryBadgeColor(email.category))}
              >
                {email.category}
              </Badge>
              {email.hasAttachment && (
                <Badge variant="outline" className="text-xs">
                  📎 Attachment
                </Badge>
              )}
            </div>
          </div>

          {/* Email Header */}
          <div className="bg-card rounded-lg border p-4 mb-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {email.from.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{email.from}</span>
                  <span className="text-muted-foreground text-sm">&lt;{email.fromEmail}&gt;</span>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  to me, support@company.com
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {email.time} • Full Date: Dec 7, 2024, 2:30 PM (GMT-8)
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm">↩️</Button>
                <Button variant="ghost" size="sm">↗️</Button>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {formatEmailContent(email.preview)}
            </div>
          </div>

          {/* Attachments */}
          {email.hasAttachment && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                📎 Attachments (2)
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-background rounded border">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    📄
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Project_Report.pdf</div>
                    <div className="text-xs text-muted-foreground">2.3 MB</div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-background rounded border">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    📊
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Analytics_Data.xlsx</div>
                    <div className="text-xs text-muted-foreground">1.8 MB</div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Reply */}
          <div className="mt-8 border-t pt-6">
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1"
              >
                ↩️ Reply
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
              >
                ↗️ Forward
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}