import type { InfobarContent } from '@/components/ui/infobar';

export const usersInfoContent: InfobarContent = {
  title: 'Users — React Query + nuqs Pattern',
  sections: [
    {
      title: 'Overview',
      description:
        'Manage real users from the backend Users API. The existing table layout, URL-driven filters, pagination, and create/edit sheet are preserved.',
      links: [
        {
          title: 'TanStack Query SSR Docs',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr'
        }
      ]
    },
    {
      title: 'Backend API + Client Query',
      description:
        'Users are loaded from GET /api/user through the same-origin backend proxy, which forwards the secure admin token. Create, update, and delete use POST /api/user, PATCH /api/user/:id, and DELETE /api/user/:id.',
      links: []
    },
    {
      title: 'URL State with nuqs',
      description:
        'Pagination, search, sorting, and role filters stay synced to the URL via nuqs and are applied to the fetched user list. React Query caches the backend response and mutations refresh that cached list.',
      links: [
        {
          title: 'nuqs Documentation',
          url: 'https://nuqs.47ng.com'
        }
      ]
    },
    {
      title: 'Products vs Users Pattern',
      description:
        'This Users page keeps its React Query table pattern while using the backend API as its source of truth. The form maps dashboard fields to the backend user model and retains the existing sheet-based create/edit workflow.',
      links: []
    }
  ]
};
