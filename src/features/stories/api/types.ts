export type StoryLanguage = 'en' | 'hi' | 'bn' | 'hinglish';

export type StoryCategory = {
  _id: string;
  title: string;
  slug: string;
  iconImage?: string;
  bannerImage?: string;
  mainCategory?: string | StoryMainCategory | null;
};

export type StoryMainCategory = {
  _id?: string;
  id?: string;
  title?: string;
};

export type StoryChapter = {
  chapterNumber: number;
  title: string;
  paragraphs: string[];
  isLocked: boolean;
  translations?: StoryChapterTranslation[];
};

export type StoryTranslation = {
  language: StoryLanguage;
  title: string;
  synopsis: string;
  authorName: string;
};

export type StoryChapterTranslation = {
  language: StoryLanguage;
  title: string;
  paragraphs: string[];
};

export type StoryChapterPayload = {
  chapterNumber: number;
  title: string;
  paragraphs: string[];
  isLocked: boolean;
  translations: StoryChapterTranslation[];
};

export type StoryAudioTrack = {
  audioUrl: string;
  durationSeconds: number;
  waveform?: number[];
};

export type Story = {
  _id: string;
  title: string;
  synopsis: string;
  authorName: string;
  currentLanguage: string;
  defaultLanguage: string;
  availableLanguages: string[];
  translations?: StoryTranslation[];
  coverImage: string;
  bannerImage?: string;
  categoryId?: StoryCategory | string | null;
  tags: string[];
  contentRating: string;
  hasAudio: boolean;
  audioTrack?: StoryAudioTrack | null;
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

export type StoryPayload = {
  defaultLanguage?: StoryLanguage;
  title?: string;
  synopsis?: string;
  authorName?: string;
  translations?: StoryTranslation[];
  coverImage: string;
  bannerImage?: string;
  categoryId?: string | null;
  tags: string[];
  contentRating?: string;
  hasAudio?: boolean;
  audioTrack?: StoryAudioTrack;
  isFeatured?: boolean;
  isTrending?: boolean;
  chapters?: StoryChapterPayload[];
};

export type StoryMutationResponse = {
  message: string;
  story: Story;
};

export type StoryLikeResponse = {
  message: string;
  liked: boolean;
  totalLikes: number;
};

export type StoryDeleteResponse = {
  message: string;
  story: Story;
};
