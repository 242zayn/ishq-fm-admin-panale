export type StoryLanguage = 'en' | 'hi' | 'bn' | 'hinglish';

export type StoryCategory = {
  _id: string;
  title: string;
  slug: string;
  iconImage?: string;
  bannerImage?: string;
};

export type StoryChapter = {
  chapterNumber: number;
  title: string;
  paragraphs: string[];
  isLocked: boolean;
};

export type Story = {
  _id: string;
  title: string;
  synopsis: string;
  authorName: string;
  currentLanguage: string;
  defaultLanguage: string;
  availableLanguages: string[];
  coverImage: string;
  bannerImage?: string;
  categoryId?: StoryCategory | string | null;
  tags: string[];
  contentRating: string;
  hasAudio: boolean;
  audioTrack?: {
    audioUrl: string;
    durationSeconds: number;
    waveform: number[];
  } | null;
  isFeatured: boolean;
  isTrending: boolean;
  totalLikes: number;
  chapters?: StoryChapter[];
  userInteraction?: {
    liked: boolean;
    favorited: boolean;
    saved: boolean;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GetStoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  lang?: StoryLanguage;
};

export type GetStoriesResponse = {
  message: string;
  data: Story[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};
