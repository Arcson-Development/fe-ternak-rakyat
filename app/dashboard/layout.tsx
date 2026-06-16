"use client";

import React from "react";
import {
  AppShell,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppShellHeader } from "../../components/layout/AppShellHeader";
import { AppShellSidebar } from "../../components/layout/AppShellSidebar";
import { OnboardingTour } from "../../components/onboarding/OnboardingTour";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: "var(--app-surface)",
          borderBottom: "1px solid var(--app-border)",
        }}
      >
        <AppShellHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar
        style={{ background: "var(--app-sidebar-bg)", borderRight: "none" }}
      >
        <AppShellSidebar onNavigate={() => opened && toggle()} />
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
        <MobileBottomNav />
      </AppShell.Main>
    </AppShell>
  );
}
