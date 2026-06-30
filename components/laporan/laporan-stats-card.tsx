"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Search, FileText, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  FileText,
  Users,
  BarChart3,
};

export function LaporanStatsCard({
  value,
  label,
  iconName,
  color,
}: {
  value: number;
  label: string;
  iconName: string;
  color: string;
}) {
  const Icon = iconMap[iconName] ?? BarChart3;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">
            <motion.span>{rounded}</motion.span>
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
