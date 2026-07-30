"use client";

import { StatCard } from "@/components/ui/stat-card";

export function LaporanStatsCard(props: {
  value: number;
  label: string;
  iconName: string;
  color: string;
}) {
  return <StatCard {...props} animated />;
}
