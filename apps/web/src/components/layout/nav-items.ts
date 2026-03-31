import {
  LayoutDashboard,
  Package,
  Users,
  Bell,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Competitors", href: "/competitors", icon: Users },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export const bottomNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
