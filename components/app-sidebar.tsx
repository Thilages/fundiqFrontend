"use client";

import type React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, User } from "lucide-react";
import Link from "next/link";

const menuItems = [
  {
    id: 0,
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="flex-[2]">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">FundIQ</h2>
        <p className="text-xs text-muted-foreground">
          Pitch Deck Evaluation Platform
        </p>
      </SidebarHeader>

      <SidebarContent className="p-0">
        {/* Navigation Section */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* {console.log(menuItems)} */}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild className="h-9 px-2">
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Demo User</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
