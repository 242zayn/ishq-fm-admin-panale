'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useGetStories } from '../api/hooks';
import type { StoryLanguage } from '../api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 12;

const LANGUAGES: { value: StoryLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hinglish', label: 'Hinglish' }
];

export default function StoriesListing() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lang, setLang] = useState<StoryLanguage>('en');
  const { data, error, isPending, isFetching, refetch } = useGetStories({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    lang
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  if (isPending) {
    return (
      <p role='status' className='text-muted-foreground'>
        Loading stories…
      </p>
    );
  }

  if (error) {
    return (
      <div role='alert' className='space-y-3'>
        <p className='text-destructive'>Could not load stories: {error.message}</p>
        <Button variant='outline' onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const pagination = data.meta.pagination;

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSearch} className='flex flex-col gap-3 sm:flex-row'>
        <Input
          aria-label='Search stories'
          placeholder='Search by title, synopsis, author, or tag'
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <label className='sr-only' htmlFor='story-language'>
          Story language
        </label>
        <select
          id='story-language'
          className='border-input bg-background h-8 rounded-lg border px-3 text-sm'
          value={lang}
          onChange={(event) => {
            setLang(event.target.value as StoryLanguage);
            setPage(1);
          }}
        >
          {LANGUAGES.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
        <Button type='submit'>Search</Button>
      </form>

      {data.data.length === 0 ? (
        <p className='text-muted-foreground py-12 text-center'>No stories found.</p>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {data.data.map((story) => (
            <Link
              key={story['_id']}
              href={`/dashboard/stories/${story['_id']}`}
              className='rounded-xl focus-visible:ring-3 focus-visible:ring-ring'
            >
              <Card className='h-full transition-colors hover:bg-muted/40'>
                <div
                  role='img'
                  aria-label={`Cover for ${story.title}`}
                  className='bg-muted h-40 bg-cover bg-center'
                  style={{ backgroundImage: `url("${story.coverImage}")` }}
                />
                <CardHeader>
                  <CardTitle className='line-clamp-1'>{story.title}</CardTitle>
                  <CardDescription>
                    {story.authorName} · {story.currentLanguage}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <p className='text-muted-foreground line-clamp-3'>{story.synopsis}</p>
                  <div className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                    <span>{story.totalLikes} likes</span>
                    <span>{story.chapters?.length ?? 0} chapters</span>
                    {story.hasAudio && <span>Audio</span>}
                    {story.isFeatured && <span>Featured</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Page {pagination.page} of {pagination.totalPages} · {pagination.total} stories
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            disabled={!pagination.hasPreviousPage || isFetching}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            disabled={!pagination.hasNextPage || isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
