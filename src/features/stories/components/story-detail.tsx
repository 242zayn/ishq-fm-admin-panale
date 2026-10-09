'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGetStoryById } from '../api/hooks';
import type { StoryLanguage } from '../api/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StoryDetail({ storyId }: { storyId: string }) {
  const [language, setLanguage] = useState<StoryLanguage>('en');
  const { data: story, error, isPending, refetch } = useGetStoryById(storyId, language);

  if (isPending) {
    return (
      <p role='status' className='text-muted-foreground'>
        Loading story…
      </p>
    );
  }

  if (error) {
    return (
      <div role='alert' className='space-y-3'>
        <p className='text-destructive'>Could not load story: {error.message}</p>
        <Button variant='outline' onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const category =
    typeof story.categoryId === 'object' && story.categoryId ? story.categoryId.title : null;

  return (
    <article className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Link href='/dashboard/stories' className={buttonVariants({ variant: 'outline' })}>
          Back to stories
        </Link>
        <StoryLanguageSelector language={language} onLanguageChange={setLanguage} />
      </div>

      <Card>
        <div
          role='img'
          aria-label={`Cover for ${story.title}`}
          className='bg-muted h-64 bg-cover bg-center sm:h-80'
          style={{ backgroundImage: `url("${story.bannerImage ?? story.coverImage}")` }}
        />
        <CardHeader>
          <div className='text-muted-foreground flex flex-wrap gap-3 text-sm'>
            <span>By {story.authorName}</span>
            <span>{story.currentLanguage}</span>
            {category && <span>{category}</span>}
            <span>{story.totalLikes} likes</span>
            {story.hasAudio && <span>Audio available</span>}
          </div>
          <CardTitle className='text-2xl'>{story.title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='whitespace-pre-wrap'>{story.synopsis}</p>
          <div className='flex flex-wrap gap-2'>
            {story.tags.map((tag) => (
              <span
                key={tag}
                className='bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs'
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby='story-chapters-heading' className='space-y-4'>
        <h2 id='story-chapters-heading' className='text-xl font-semibold'>
          Chapters ({story.chapters?.length ?? 0})
        </h2>
        {story.chapters?.length ? (
          story.chapters.map((chapter) => (
            <Card key={chapter.chapterNumber}>
              <CardHeader>
                <CardTitle>
                  Chapter {chapter.chapterNumber}: {chapter.title}
                  {chapter.isLocked && (
                    <span className='text-muted-foreground ml-2 text-sm font-normal'>Locked</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {chapter.paragraphs.map((paragraph, index) => (
                  <p key={`${chapter.chapterNumber}-${index}`} className='whitespace-pre-wrap'>
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className='text-muted-foreground'>This story has no chapters yet.</p>
        )}
      </section>
    </article>
  );
}

function StoryLanguageSelector({
  language,
  onLanguageChange
}: {
  language: StoryLanguage;
  onLanguageChange: (language: StoryLanguage) => void;
}) {
  return (
    <label className='flex items-center gap-2 text-sm'>
      Language
      <select
        className='border-input bg-background h-8 rounded-lg border px-3'
        value={language}
        onChange={(event) => onLanguageChange(event.target.value as StoryLanguage)}
      >
        <option value='en'>English</option>
        <option value='hi'>Hindi</option>
        <option value='bn'>Bengali</option>
        <option value='hinglish'>Hinglish</option>
      </select>
    </label>
  );
}
