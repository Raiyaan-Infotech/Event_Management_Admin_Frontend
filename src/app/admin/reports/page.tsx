import { BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and business reports</p>
        </div>
        <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Reports &amp; Analytics</h2>
          <p className="text-muted-foreground max-w-sm">
            Detailed reports and analytics are coming soon. You&apos;ll be able to view sales,
            vendor performance, and event statistics here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
