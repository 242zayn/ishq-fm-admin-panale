import type { InfobarContent } from "@/components/ui/infobar";

export const guestUsersInfoContent: InfobarContent = {
  title: "Guest Users — Mobile & Web Visitors",
  sections: [
    {
      title: "Overview",
      description:
        "Track and manage anonymous mobile and web guest devices registered through the Mobile App onboarding flow.",
      links: [],
    },
    {
      title: "Backend Guest User APIs",
      description:
        "Loaded from GET /api/guest-user. Registration occurs via POST /api/guest-user and administrative management uses PATCH /api/guest-user/:id and DELETE /api/guest-user/:id.",
      links: [],
    },
    {
      title: "Content Preference (isAdult)",
      description:
        "Indicates whether the guest user enabled 18+ adult content preference in their mobile device settings.",
      links: [],
    },
  ],
};
