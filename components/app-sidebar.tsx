"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, GraduationCapIcon, ListTodoIcon, MessageCircleIcon, MicIcon, LineChartIcon } from "lucide-react"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "LMS",
      url: "#",
      icon: (
        <GraduationCapIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Danh sách môn học",
          url: "/lms/subjects",
        },
        {
          title: "Danh sách học viên",
          url: "/lms/students",
        },
        {
          title: "Điểm danh",
          url: "/lms/attendance",
        },
      ],
    },
    {
      title: "Chat",
      url: "#",
      icon: (
        <MessageCircleIcon
        />
      ),
      isActive: false,
      items: [
        {
          title: "Phòng chat",
          url: "/chat",
        },
        {
          title: "Quản lý phòng chat",
          url: "/chat/manage",
        },
      ],
    },
    {
      title: "Quiz",
      url: "#",
      icon: (
        <MicIcon
        />
      ),
      isActive: false,
      items: [
        {
          title: "Vào quiz",
          url: "/quiz",
        },
        {
          title: "Điều khiển (Đạo diễn)",
          url: "/quiz/director",
        },
      ],
    },
    {
      title: "Doanh số",
      url: "#",
      icon: (
        <LineChartIcon
        />
      ),
      isActive: false,
      requiredRoles: ["sale-managers"],
      items: [
        {
          title: "Doanh số thời gian thực",
          url: "/sales",
        },
      ],
    },
    {
      title: "Workspace",
      url: "#",
      icon: (
        <ListTodoIcon
        />
      ),
      isActive: false,
      items: [
        {
          title: "Công việc",
          url: "/workspace/tasks",
        },
      ],
    },
    {
      title: "Playground",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: false,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { data: session } = useSession()
  const roles = session?.user?.roles ?? []

  const navUser = {
    name: user?.displayName || user?.email?.split("@")[0] || "Guest",
    email: user?.email || "",
    avatar: user?.photoURL || "",
  }

  const navMain = data.navMain.filter(
    (item) => !item.requiredRoles || item.requiredRoles.some((role) => roles.includes(role))
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
