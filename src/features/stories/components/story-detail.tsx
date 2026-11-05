"use client";

import Link from "next/link";
import { useState } from "react";
import { useGetStoryById } from "../api/hooks";
import type { StoryLanguage } from "../api/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export default function StoryDetail({ storyId }: { storyId: string }) {
  const [language, setLanguage] = useState<StoryLanguage>("en");
  const {
    data: story,
    error,
    isPending,
    refetch,
  } = useGetStoryById(storyId, language);

  if (isPending) {
    return (
      <p role="status" className="text-muted-foreground">
        Loading story…
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-destructive">
          Could not load story: {error.message}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const category =
    typeof story.categoryId === "object" && story.categoryId
      ? story.categoryId.title
      : null;

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/stories"
            className={buttonVariants({ variant: "outline" })}
          >
            <Icons.chevronLeft className="mr-1.5 h-4 w-4" />
            Back to stories
          </Link>
          <Link
            href={`/dashboard/stories/${storyId}/edit`}
            className={buttonVariants({ variant: "default" })}
          >
            <Icons.edit className="mr-1.5 h-4 w-4" />
            Edit Story
          </Link>
        </div>
        <StoryLanguageSelector
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>

      <Card>
        <div
          role="img"
          aria-label={`Cover for ${story.title}`}
          className="bg-muted h-64 bg-cover bg-center sm:h-80"
          style={{
            backgroundImage: `url("${story.bannerImage ?? story.coverImage}")`,
          }}
        />
        <CardHeader>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
            <span>By {story.authorName}</span>
            <span>{story.currentLanguage}</span>
            {category && <span>{category}</span>}
            <span>{story.totalLikes} likes</span>
            {story.hasAudio && <span>Audio available</span>}
          </div>
          <CardTitle className="text-2xl">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{story.synopsis}</p>
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Chapters ({story.chapters?.length ?? 0})
        </h2>
        {story.chapters && story.chapters.length > 0 ? (
          <div className="space-y-4">
            {story.chapters.map((chapter) => (
              <Card key={chapter.chapterNumber}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chapter.paragraphs?.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No chapters available in this language.
          </p>
        )}
      </section>
    </article>
  );
}

function StoryLanguageSelector({
  language,
  onLanguageChange,
}: {
  language: StoryLanguage;
  onLanguageChange: (lang: StoryLanguage) => void;
}) {
  const languages: { value: StoryLanguage; label: string }[] = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "hinglish", label: "Hinglish" },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.value}
          variant={language === lang.value ? "default" : "outline"}
          size="sm"
          onClick={() => onLanguageChange(lang.value)}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
