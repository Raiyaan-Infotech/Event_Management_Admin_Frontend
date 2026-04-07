import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mail</h1>
          <p className="text-muted-foreground mt-1">Email campaigns and inbox management</p>
        </div>
        <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Mail Management</h2>
          <p className="text-muted-foreground max-w-sm">
            Send bulk emails, manage campaigns, and view your inbox. This feature is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
