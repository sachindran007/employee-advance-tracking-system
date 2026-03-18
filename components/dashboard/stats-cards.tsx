import { AlertTriangle, HandCoins, Landmark, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function StatsCards({
  employeeCount,
  totalEarned,
  totalOutstanding,
  atRiskCount
}: {
  employeeCount: number;
  totalEarned: number;
  totalOutstanding: number;
  atRiskCount: number;
}) {
  const items = [
    {
      label: "Employees",
      value: employeeCount.toString(),
      icon: Landmark,
      description: "Active records visible in the dashboard",
      tone: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
    },
    {
      label: "Total Earned",
      value: formatCurrency(totalEarned),
      icon: HandCoins,
      description: "All wages generated from production",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(totalOutstanding),
      icon: Wallet,
      description: "Total exposure from advances and deductions",
      tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    },
    {
      label: "High Risk",
      value: atRiskCount.toString(),
      icon: AlertTriangle,
      description: "Employees above 15,000 outstanding balance",
      tone: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    }
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription className="mt-1 max-w-[18rem]">{item.description}</CardDescription>
              </div>
              <Badge className={item.tone}>
                <Icon className="mr-1 h-3.5 w-3.5" />
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
