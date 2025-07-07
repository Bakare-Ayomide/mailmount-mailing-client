import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface EmailComposeProps {
  onBack: () => void;
}

export function EmailCompose({ onBack }: EmailComposeProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!to || !subject) {
      toast({
        title: "Missing required fields",
        description: "Please fill in recipient and subject fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would implement actual email sending
    toast({
      title: "Email sent!",
      description: `Your email to ${to} has been sent successfully.`,
    });
    
    onBack();
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your email has been saved to drafts.",
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 border-b bg-card flex items-center px-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="font-medium">Compose Email</h2>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button 
            size="sm"
            onClick={handleSend}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground"
          >
            Send ✈️
          </Button>
        </div>
      </div>

      {/* Compose Form */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* From Account Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="from" className="w-16 text-sm font-medium">From:</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  john@gmail.com ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border shadow-lg">
                <DropdownMenuItem>john@gmail.com</DropdownMenuItem>
                <DropdownMenuItem>john@outlook.com</DropdownMenuItem>
                <DropdownMenuItem>john@yahoo.com</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* To Field */}
          <div className="flex items-center gap-4">
            <Label htmlFor="to" className="w-16 text-sm font-medium">To:</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter recipient email addresses..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className={showCc ? "bg-muted" : ""}
              >
                Cc
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className={showBcc ? "bg-muted" : ""}
              >
                Bcc
              </Button>
            </div>
          </div>

          {/* CC Field */}
          {showCc && (
            <div className="flex items-center gap-4">
              <Label htmlFor="cc" className="w-16 text-sm font-medium">Cc:</Label>
              <Input
                id="cc"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Enter CC recipients..."
                className="flex-1"
              />
            </div>
          )}

          {/* BCC Field */}
          {showBcc && (
            <div className="flex items-center gap-4">
              <Label htmlFor="bcc" className="w-16 text-sm font-medium">Bcc:</Label>
              <Input
                id="bcc"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Enter BCC recipients..."
                className="flex-1"
              />
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center gap-4">
            <Label htmlFor="subject" className="w-16 text-sm font-medium">Subject:</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="flex-1"
            />
          </div>

          <Separator />

          {/* Email Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Message:</Label>
              <div className="flex gap-2">
                <Button
                  variant={isHtml ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsHtml(false)}
                >
                  Plain Text
                </Button>
                <Button
                  variant={isHtml ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsHtml(true)}
                >
                  HTML
                </Button>
              </div>
            </div>
            
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isHtml ? "Enter HTML content..." : "Enter your message..."}
              className="min-h-[300px] resize-none"
            />

            {isHtml && (
              <div className="text-xs text-muted-foreground">
                HTML mode enabled. You can use HTML tags for formatting.
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Attachments:</Label>
              <Label
                htmlFor="file-upload"
                className="cursor-pointer bg-secondary hover:bg-secondary-hover text-secondary-foreground px-3 py-1 rounded text-sm"
              >
                📎 Add Files
              </Label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-2 py-1"
                  >
                    📎 {file.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}