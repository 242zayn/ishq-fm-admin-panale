"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAllCategories } from "@/features/category/hooks/useCategory";
import { useCreateStory, useUpdateStory } from "../api/hooks";
import type {
  Story,
  StoryChapterPayload,
  StoryLanguage,
  StoryPayload,
  StoryTranslation,
} from "../api/types";
import { StoryImageUpload } from "./story-image-upload";

const ALL_LANGUAGES: { value: StoryLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "hinglish", label: "Hinglish" },
];

const CONTENT_RATINGS = [
  { value: 0, label: "General (All Ages)" },
  { value: 13, label: "Teen (13+)" },
  { value: 18, label: "Mature (18+)" },
];

interface StoryTranslationState {
  title: string;
  synopsis: string;
  authorName: string;
}

interface ChapterState {
  id: string; // internal unique key
  chapterNumber: number;
  isLocked: boolean;
  translations: Record<string, { title: string; paragraphs: string }>;
}

interface StoryFormProps {
  initialStory?: Story | null;
  storyId?: string;
}

export function StoryForm({ initialStory }: StoryFormProps) {
  const router = useRouter();
  const createMutation = useCreateStory();
  const updateMutation = useUpdateStory();
  const categoriesQuery = useAllCategories();

  const isEdit = Boolean(initialStory?._id);

  // Common State across all languages
  const [defaultLanguage, setDefaultLanguage] = useState<StoryLanguage>(
    (initialStory?.defaultLanguage as StoryLanguage) || "en",
  );
  const [categoryId, setCategoryId] = useState<string>(() => {
    const raw = initialStory?.categoryId;
    if (typeof raw === "string") return raw;
    if (typeof raw === "object" && raw?._id) return raw._id;
    return "";
  });
  const [coverImage, setCoverImage] = useState<string>(
    initialStory?.coverImage ?? "",
  );
  const [bannerImage, setBannerImage] = useState<string>(
    initialStory?.bannerImage ?? "",
  );
  const [tags, setTags] = useState<string>(
    initialStory?.tags?.join(", ") ?? "",
  );
  console.log(" initialStory?.contentRating", initialStory?.contentFor);
  const [contentFor, setContentFor] = useState<number>(
    initialStory?.contentFor ?? 0,
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialStory?.isFeatured ?? false,
  );
  const [isTrending, setIsTrending] = useState<boolean>(
    initialStory?.isTrending ?? false,
  );
  // Audio settings
  const [hasAudio, setHasAudio] = useState<boolean>(
    initialStory?.hasAudio ?? false,
  );
  const [audioUrl, setAudioUrl] = useState<string>(
    initialStory?.audioTrack?.audioUrl ?? "",
  );
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number>(
    initialStory?.audioTrack?.durationSeconds ?? 0,
  );
  const [audioWaveform, setAudioWaveform] = useState<string>(
    initialStory?.audioTrack?.waveform?.join(", ") ?? "",
  );

  // Languages & Active Tab
  const [languages, setLanguages] = useState<StoryLanguage[]>(() => {
    const langs = new Set<StoryLanguage>();
    if (initialStory?.defaultLanguage) {
      langs.add(initialStory.defaultLanguage as StoryLanguage);
    } else {
      langs.add("en");
    }
    if (Array.isArray(initialStory?.translations)) {
      initialStory.translations.forEach((t) => langs.add(t.language));
    }
    if (Array.isArray(initialStory?.availableLanguages)) {
      initialStory.availableLanguages.forEach((l) =>
        langs.add(l as StoryLanguage),
      );
    }
    return Array.from(langs);
  });

  const [activeTab, setActiveTab] = useState<StoryLanguage>(() => {
    return (initialStory?.defaultLanguage as StoryLanguage) || "en";
  });

  // Language-specific Story Translations: Record<language, { title, synopsis, authorName }>
  const [translations, setTranslations] = useState<
    Record<string, StoryTranslationState>
  >(() => {
    const map: Record<string, StoryTranslationState> = {};
    ALL_LANGUAGES.forEach((lang) => {
      map[lang.value] = {
        title: "",
        synopsis: "",
        authorName: initialStory?.authorName ?? "",
      };
    });

    // Default language fallback from story root
    if (initialStory) {
      const def = (initialStory.defaultLanguage as StoryLanguage) || "en";
      map[def] = {
        title: initialStory.title || "",
        synopsis: initialStory.synopsis || "",
        authorName: initialStory.authorName || "",
      };
      if (Array.isArray(initialStory.translations)) {
        initialStory.translations.forEach((t) => {
          map[t.language] = {
            title: t.title || "",
            synopsis: t.synopsis || "",
            authorName: t.authorName || initialStory.authorName || "",
          };
        });
      }
    }
    return map;
  });

  // Chapters State
  const [chapters, setChapters] = useState<ChapterState[]>(() => {
    if (
      Array.isArray(initialStory?.chapters) &&
      initialStory.chapters.length > 0
    ) {
      return initialStory.chapters.map((ch, index) => {
        const transRecord: Record<
          string,
          { title: string; paragraphs: string }
        > = {};
        ALL_LANGUAGES.forEach((l) => {
          transRecord[l.value] = { title: "", paragraphs: "" };
        });

        // Populate translations
        if (Array.isArray(ch.translations) && ch.translations.length > 0) {
          ch.translations.forEach((ct) => {
            transRecord[ct.language] = {
              title: ct.title || "",
              paragraphs: Array.isArray(ct.paragraphs)
                ? ct.paragraphs.join("\n\n")
                : "",
            };
          });
        }

        // Fallback root chapter title and paragraphs into default language if empty
        const defLang =
          (initialStory?.defaultLanguage as StoryLanguage) || "en";
        if (!transRecord[defLang].title && ch.title) {
          transRecord[defLang].title = ch.title;
        }
        if (
          !transRecord[defLang].paragraphs &&
          Array.isArray(ch.paragraphs) &&
          ch.paragraphs.length > 0
        ) {
          transRecord[defLang].paragraphs = ch.paragraphs.join("\n\n");
        }

        return {
          id: `chapter-${index + 1}-${Date.now()}`,
          chapterNumber: ch.chapterNumber ?? index + 1,
          isLocked: Boolean(ch.isLocked),
          translations: transRecord,
        };
      });
    }

    // Default initial Chapter 1
    const transRecord: Record<string, { title: string; paragraphs: string }> =
      {};
    ALL_LANGUAGES.forEach((l) => {
      transRecord[l.value] = { title: "", paragraphs: "" };
    });

    return [
      {
        id: "chapter-1-init",
        chapterNumber: 1,
        isLocked: false,
        translations: transRecord,
      },
    ];
  });

  // Translation helpers
  const updateTranslation = (
    lang: string,
    field: keyof StoryTranslationState,
    value: string,
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || { title: "", synopsis: "", authorName: "" }),
        [field]: value,
      },
    }));
  };

  // Chapter helpers
  const addChapter = () => {
    const nextNumber = chapters.length + 1;
    const transRecord: Record<string, { title: string; paragraphs: string }> =
      {};
    ALL_LANGUAGES.forEach((l) => {
      transRecord[l.value] = {
        title: `Chapter ${nextNumber}`,
        paragraphs: "",
      };
    });

    setChapters((prev) => [
      ...prev,
      {
        id: `chapter-${nextNumber}-${Date.now()}`,
        chapterNumber: nextNumber,
        isLocked: nextNumber > 1, // lock subsequent chapters by default
        translations: transRecord,
      },
    ]);
    toast.success(`Chapter ${nextNumber} added`);
  };

  const removeChapter = (indexToRemove: number) => {
    if (chapters.length <= 1) {
      toast.error("Story must have at least one chapter.");
      return;
    }
    setChapters((prev) =>
      prev
        .filter((_, idx) => idx !== indexToRemove)
        .map((ch, idx) => ({ ...ch, chapterNumber: idx + 1 })),
    );
  };

  const updateChapterTranslation = (
    chapterIndex: number,
    lang: string,
    field: "title" | "paragraphs",
    value: string,
  ) => {
    setChapters((prev) => {
      const copy = [...prev];
      const chapter = copy[chapterIndex];
      if (!chapter) return prev;

      const currentLangTrans = chapter.translations[lang] || {
        title: "",
        paragraphs: "",
      };
      copy[chapterIndex] = {
        ...chapter,
        translations: {
          ...chapter.translations,
          [lang]: {
            ...currentLangTrans,
            [field]: value,
          },
        },
      };
      return copy;
    });
  };

  const updateChapterLock = (chapterIndex: number, isLocked: boolean) => {
    setChapters((prev) => {
      const copy = [...prev];
      if (copy[chapterIndex]) {
        copy[chapterIndex] = { ...copy[chapterIndex], isLocked };
      }
      return copy;
    });
  };

  // Language management
  const addLanguage = (langToAdd: StoryLanguage) => {
    if (!languages.includes(langToAdd)) {
      setLanguages((prev) => [...prev, langToAdd]);
      setActiveTab(langToAdd);
      toast.success(
        `Added ${ALL_LANGUAGES.find((l) => l.value === langToAdd)?.label} translation tab`,
      );
    }
  };

  const removeLanguage = (langToRemove: StoryLanguage) => {
    if (languages.length <= 1) {
      toast.error("You must have at least one language.");
      return;
    }
    if (langToRemove === defaultLanguage) {
      toast.error(
        "Cannot remove default language. Change default language first.",
      );
      return;
    }
    const newLangs = languages.filter((l) => l !== langToRemove);
    setLanguages(newLangs);
    if (activeTab === langToRemove) {
      setActiveTab(newLangs[0]);
    }
    toast.info(`Removed ${langToRemove} translation`);
  };

  // Available languages to add
  const remainingLanguages = ALL_LANGUAGES.filter(
    (l) => !languages.includes(l.value),
  );

  // Form Submit
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!categoryId || categoryId === "none") {
      toast.error("Please select a category for the story.");
      return;
    }

    if (!coverImage.trim()) {
      toast.error("Please upload or provide a Cover Image.");
      return;
    }

    if (!bannerImage.trim()) {
      toast.error("Please upload or provide a Banner Image.");
      return;
    }

    // Default language translation check
    const defTrans = translations[defaultLanguage];
    if (!defTrans?.title?.trim()) {
      toast.error(
        `Please enter the Title for default language (${defaultLanguage.toUpperCase()}).`,
      );
      setActiveTab(defaultLanguage);
      return;
    }
    if (!defTrans?.synopsis?.trim()) {
      toast.error(
        `Please enter the Synopsis for default language (${defaultLanguage.toUpperCase()}).`,
      );
      setActiveTab(defaultLanguage);
      return;
    }
    if (!defTrans?.authorName?.trim()) {
      toast.error(
        `Please enter the Author Name for default language (${defaultLanguage.toUpperCase()}).`,
      );
      setActiveTab(defaultLanguage);
      return;
    }

    // Validate audio if enabled
    if (hasAudio) {
      if (!audioUrl.trim()) {
        toast.error("Audio URL is required when audio narration is enabled.");
        return;
      }
      if (audioDurationSeconds <= 0) {
        toast.error("Audio duration must be greater than 0 seconds.");
        return;
      }
    }

    // Build translations array for enabled languages
    const builtTranslations: StoryTranslation[] = languages.map((lang) => {
      const t = translations[lang] || {
        title: defTrans.title,
        synopsis: defTrans.synopsis,
        authorName: defTrans.authorName,
      };
      return {
        language: lang,
        title: t.title.trim() || defTrans.title.trim(),
        synopsis: t.synopsis.trim() || defTrans.synopsis.trim(),
        authorName: t.authorName.trim() || defTrans.authorName.trim(),
      };
    });

    // Build chapters array with translations
    const builtChapters: StoryChapterPayload[] = chapters.map((ch) => {
      const defChTrans = ch.translations[defaultLanguage];
      const defTitle =
        defChTrans?.title.trim() || `Chapter ${ch.chapterNumber}`;
      const defParagraphs = (defChTrans?.paragraphs ?? "")
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const chTranslations = languages.map((lang) => {
        const ct = ch.translations[lang];
        const title = ct?.title.trim() || defTitle;
        const paragraphs = (ct?.paragraphs ?? "")
          .split(/\r?\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        return {
          language: lang,
          title,
          paragraphs: paragraphs.length > 0 ? paragraphs : defParagraphs,
        };
      });

      return {
        chapterNumber: ch.chapterNumber,
        title: defTitle,
        paragraphs: defParagraphs.length > 0 ? defParagraphs : ["..."],
        isLocked: ch.isLocked,
        translations: chTranslations,
      };
    });

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: StoryPayload = {
      title: defTrans.title.trim(),
      synopsis: defTrans.synopsis.trim(),
      authorName: defTrans.authorName.trim(),
      defaultLanguage,
      categoryId,
      coverImage: coverImage.trim(),
      bannerImage: bannerImage.trim(),
      // contentRating,
      contentFor,
      tags: tagArray,
      isFeatured,
      isTrending,
      hasAudio,
      audioTrack: hasAudio
        ? {
            audioUrl: audioUrl.trim(),
            durationSeconds: audioDurationSeconds,
            waveform: audioWaveform.trim()
              ? audioWaveform
                  .split(",")
                  .map((p) => Number(p.trim()))
                  .filter(Number.isFinite)
              : undefined,
          }
        : undefined,
      translations: builtTranslations,
      chapters: builtChapters,
    };

    try {
      if (isEdit && initialStory?._id) {
        await updateMutation.mutateAsync({
          id: initialStory._id,
          values: payload,
        });
        toast.success("Story updated successfully!");
        router.push("/dashboard/stories");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Story created successfully!");
        router.push("/dashboard/stories");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save the story.",
      );
    }
  };

  const categories = categoriesQuery.data ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/stories"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-9 w-9 rounded-lg border-border/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Icons.chevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to stories</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit
                ? `Edit Story: ${initialStory?.title}`
                : "Create New Story"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill common metadata first, then use language tabs to enter
              content and chapters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/stories")}
            disabled={isPending}
            className="h-9 rounded-lg text-xs"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isPending}
            className="h-9 rounded-lg bg-primary text-xs font-semibold px-4 shadow-sm"
          >
            {isEdit ? "Update Story" : "Publish Story"}
          </LoadingButton>
        </div>
      </div>

      {/* SECTION 1: COMMON FIELDS (Media, Category, Flags, Audio) */}
      <Card className="rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              1
            </span>
            <CardTitle className="text-lg font-bold">
              Common Story Information
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Shared settings and media used across all language versions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Images Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <StoryImageUpload
                label="Banner Image"
                aspect="banner"
                value={bannerImage}
                onChange={setBannerImage}
                disabled={isPending}
              />
            </div>
            <div className="lg:col-span-5">
              <StoryImageUpload
                label="Cover Image"
                aspect="cover"
                value={coverImage}
                onChange={setCoverImage}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Category, Rating, Tags, Default Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Category *
              </label>
              <Select
                value={categoryId}
                onValueChange={(val) => setCategoryId(val || "")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Content Rating *
              </label>
              <Select
                value={contentFor}
                onValueChange={(val) => setContentFor(val || 0)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {CONTENT_RATINGS.map((rating) => (
                    <SelectItem
                      key={rating.value}
                      value={rating.value}
                      className="text-xs"
                    >
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Primary Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Default Language *
              </label>
              <Select
                value={defaultLanguage}
                onValueChange={(val) => {
                  const lang = val as StoryLanguage;
                  setDefaultLanguage(lang);
                  if (!languages.includes(lang)) {
                    setLanguages((prev) => [...prev, lang]);
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_LANGUAGES.map((l) => (
                    <SelectItem
                      key={l.value}
                      value={l.value}
                      className="text-xs"
                    >
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Tags (comma separated)
              </label>
              <Input
                placeholder="romance, drama, thriller"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Visibility Flags (Featured, Trending) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/20 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Featured
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Highlight this story in top banners & featured sections
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-accent/20 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Trending
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Display trending badge and boost discovery ranking
                </p>
              </div>
              <Switch checked={isTrending} onCheckedChange={setIsTrending} />
            </div>
          </div>

          {/* Audio narration section */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.music className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Audio Narration
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Enable if an audio narration track is available for this
                    story
                  </p>
                </div>
              </div>
              <Switch checked={hasAudio} onCheckedChange={setHasAudio} />
            </div>

            {hasAudio && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/30">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Audio URL *
                  </label>
                  <Input
                    placeholder="https://cdn.example.com/audio/story.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Duration (seconds) *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="120"
                    value={audioDurationSeconds}
                    onChange={(e) =>
                      setAudioDurationSeconds(Number(e.target.value) || 0)
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: LANGUAGE SPECIFIC FIELDS (Tabs for each language) */}
      <Card className="rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </span>
              <div>
                <CardTitle className="text-lg font-bold">
                  Language Content & Chapters
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Select a language tab to enter Title, Synopsis, Author, and
                  Chapters in that language.
                </CardDescription>
              </div>
            </div>

            {/* Add Language dropdown */}
            {remainingLanguages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-medium border-border/60 gap-1.5"
                    >
                      <Icons.add className="h-3.5 w-3.5" />
                      Add Language
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  {remainingLanguages.map((l) => (
                    <DropdownMenuItem
                      key={l.value}
                      onClick={() => addLanguage(l.value)}
                      className="text-xs cursor-pointer"
                    >
                      {l.label} ({l.value.toUpperCase()})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Languages Tab Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {languages.map((lang) => {
              const langInfo = ALL_LANGUAGES.find((l) => l.value === lang);
              const isActive = activeTab === lang;
              const isDef = lang === defaultLanguage;

              return (
                <div
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/80 text-muted-foreground border-border/50 hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span>{langInfo?.label || lang.toUpperCase()}</span>
                  {isDef && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1 py-0 border-0",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      Default
                    </Badge>
                  )}

                  {!isDef && languages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLanguage(lang);
                      }}
                      className="opacity-70 hover:opacity-100 hover:text-red-400 ml-0.5"
                      title={`Remove ${langInfo?.label} translation`}
                    >
                      <Icons.close className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        {/* Content for the Selected Language Tab */}
        <CardContent className="space-y-8 pt-6">
          {/* Active Language Badge Header */}
          <div className="flex items-center justify-between rounded-xl bg-accent/30 px-3.5 py-2 border border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Editing Content in:{" "}
                <span className="text-primary font-bold">
                  {ALL_LANGUAGES.find((l) => l.value === activeTab)?.label} (
                  {activeTab.toUpperCase()})
                </span>
              </span>
              {activeTab === defaultLanguage && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Primary Language
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Story Title, Author, Synopsis in Active Language */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Icons.page className="h-4 w-4 text-primary" />
              Story Information (
              {ALL_LANGUAGES.find((l) => l.value === activeTab)?.label})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Story Title ({activeTab.toUpperCase()}) *
                </label>
                <Input
                  placeholder={`e.g. ${
                    activeTab === "hi"
                      ? "एक अधूरी प्रेम कहानी"
                      : "An Untold Love Story"
                  }`}
                  value={translations[activeTab]?.title ?? ""}
                  onChange={(e) =>
                    updateTranslation(activeTab, "title", e.target.value)
                  }
                  required={activeTab === defaultLanguage}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Author Name ({activeTab.toUpperCase()}) *
                </label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={translations[activeTab]?.authorName ?? ""}
                  onChange={(e) =>
                    updateTranslation(activeTab, "authorName", e.target.value)
                  }
                  required={activeTab === defaultLanguage}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Synopsis / Description ({activeTab.toUpperCase()}) *
              </label>
              <Textarea
                placeholder={`Provide an engaging story synopsis in ${
                  ALL_LANGUAGES.find((l) => l.value === activeTab)?.label
                }...`}
                value={translations[activeTab]?.synopsis ?? ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "synopsis", e.target.value)
                }
                rows={3}
                required={activeTab === defaultLanguage}
                className="text-xs"
              />
            </div>
          </div>

          {/* Chapters in Active Language */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Icons.page className="h-4 w-4 text-primary" />
                  Chapters (
                  {ALL_LANGUAGES.find((l) => l.value === activeTab)?.label})
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Write the content for each chapter in this language.
                </p>
              </div>

              <Button
                type="button"
                onClick={addChapter}
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-medium border-border/60 gap-1.5"
              >
                <Icons.add className="h-3.5 w-3.5" />
                Add Chapter
              </Button>
            </div>

            {/* Chapters Accordion / Card List */}
            <div className="space-y-4">
              {chapters.map((chapter, chapterIdx) => {
                const currentChapterTrans = chapter.translations[activeTab] || {
                  title: "",
                  paragraphs: "",
                };

                return (
                  <div
                    key={chapter.id}
                    className="rounded-xl border border-border/50 bg-card/40 p-4 space-y-3.5 shadow-sm hover:border-border/80 transition-colors"
                  >
                    {/* Chapter Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs px-2 py-0.5"
                        >
                          Ch. {chapter.chapterNumber}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">
                          {currentChapterTrans.title ||
                            `Chapter ${chapter.chapterNumber}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Lock switch */}
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={chapter.isLocked}
                            onCheckedChange={(val) =>
                              updateChapterLock(chapterIdx, val)
                            }
                            id={`lock-ch-${chapter.chapterNumber}`}
                          />
                          <label
                            htmlFor={`lock-ch-${chapter.chapterNumber}`}
                            className="text-[11px] text-muted-foreground cursor-pointer"
                          >
                            {chapter.isLocked ? "Locked (VIP)" : "Free"}
                          </label>
                        </div>

                        {/* Remove chapter */}
                        {chapters.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeChapter(chapterIdx)}
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            title="Delete Chapter"
                          >
                            <Icons.trash className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Chapter Title & Paragraphs Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Chapter Title ({activeTab.toUpperCase()})
                        </label>
                        <Input
                          placeholder={`e.g. Chapter ${chapter.chapterNumber}: Introduction`}
                          value={currentChapterTrans.title}
                          onChange={(e) =>
                            updateChapterTranslation(
                              chapterIdx,
                              activeTab,
                              "title",
                              e.target.value,
                            )
                          }
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Paragraphs / Content ({activeTab.toUpperCase()})
                          </label>
                          <span className="text-[10px] text-muted-foreground">
                            Separate each paragraph with an empty line
                          </span>
                        </div>
                        <Textarea
                          placeholder={`Enter chapter story paragraphs in ${
                            ALL_LANGUAGES.find((l) => l.value === activeTab)
                              ?.label
                          }...`}
                          value={currentChapterTrans.paragraphs}
                          onChange={(e) =>
                            updateChapterTranslation(
                              chapterIdx,
                              activeTab,
                              "paragraphs",
                              e.target.value,
                            )
                          }
                          rows={6}
                          className="text-xs font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/stories")}
          disabled={isPending}
          className="h-9"
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          loading={isPending}
          className="h-9 px-6 font-semibold"
        >
          {isEdit ? "Update Story" : "Publish Story"}
        </LoadingButton>
      </div>
    </form>
  );
}
