'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useAllMainCategories } from '@/features/main-category/hooks/useMainCategory';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { useGetStories } from '../api/hooks';
import type { Story, StoryLanguage, StoryMainCategory } from '../api/types';
import { StoryActions } from './story-actions';
import { CreateStoryButton } from './story-editor-dialog';

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const storyIdField = '_id';
const mainCategoryIdField = '_id';

const LANGUAGES: { value: StoryLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hinglish', label: 'Hinglish' }
];

function getMainCategoryId(mainCategory: StoryMainCategory | string | null | undefined) {
  if (!mainCategory || typeof mainCategory === 'string') {
    return mainCategory ?? '';
  }

  return mainCategory.id ?? mainCategory[mainCategoryIdField] ?? '';
}

function StoryBannerPreview({ story }: { story: Story }) {
  const [open, setOpen] = useState(false);
  const imageUrl = story.bannerImage || story.coverImage;

  if (!imageUrl) {
    return <span className='text-muted-foreground text-sm'>No image</span>;
  }

  return (
    <>
      <div className='w-24'>
        <Button
          type='button'
          variant='ghost'
          aria-label={`Preview ${story.title} banner image`}
          title='Preview image'
          onClick={() => setOpen(true)}
          className='group relative h-16 w-24 overflow-hidden rounded-md border p-0'
        >
          <Image
            src={imageUrl}
            alt={`${story.title} banner`}
            width={96}
            height={64}
            unoptimized
            className='h-full w-full object-cover'
          />
          <span
            aria-hidden='true'
            className='bg-background/90 text-foreground absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full opacity-90 transition group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring'
          >
            <Icons.search />
          </span>
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='w-full sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{story.title} banner</DialogTitle>
            <DialogDescription>Full-size banner image preview.</DialogDescription>
          </DialogHeader>
          <Card className='bg-muted relative flex h-[70vh] items-center justify-center overflow-hidden'>
            <Image
              src={imageUrl}
              alt={`${story.title} banner preview`}
              width={1600}
              height={1200}
              unoptimized
              className='h-full w-full object-contain'
            />
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function StoriesListing() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [lang, setLang] = useState<StoryLanguage>('en');
  const { data, error, isPending, isFetching, refetch } = useGetStories({
    page,
    limit: pageSize,
    ...(search ? { search } : {}),
    lang
  });
  const mainCategoriesQuery = useAllMainCategories();
  const mainCategoryNames = useMemo(
    () =>
      new Map(
        (mainCategoriesQuery.data ?? []).map((mainCategory) => [
          mainCategory.id,
          mainCategory.title
        ])
      ),
    [mainCategoriesQuery.data]
  );

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
      <div role='alert' className='flex flex-col gap-3'>
        <p className='text-destructive'>Could not load stories: {error.message}</p>
        <Button variant='outline' onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (mainCategoriesQuery.error) {
    return (
      <div role='alert' className='flex flex-col gap-3'>
        <p className='text-destructive'>
          Could not load main categories: {mainCategoriesQuery.error.message}
        </p>
        <Button variant='outline' onClick={() => void mainCategoriesQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const pagination = data.meta.pagination;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <form onSubmit={handleSearch} className='flex flex-1 flex-col gap-3 sm:flex-row'>
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
        <CreateStoryButton onCreated={() => setPage(1)} />
      </div>

      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead>Banner Image</TableHead>
              <TableHead>Story</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Main Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Chapters</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length > 0 ? (
              data.data.map((story) => {
                const category =
                  typeof story.categoryId === 'object' && story.categoryId
                    ? story.categoryId
                    : null;
                const mainCategory = category?.mainCategory;
                const mainCategoryTitle =
                  typeof mainCategory === 'object' && mainCategory
                    ? mainCategory.title
                    : mainCategoryNames.get(getMainCategoryId(mainCategory));

                return (
                  <TableRow key={story[storyIdField]}>
                    <TableCell>
                      <StoryBannerPreview story={story} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/stories/${story[storyIdField]}`}
                        className='font-medium hover:underline'
                      >
                        {story.title}
                      </Link>
                    </TableCell>
                    <TableCell>{category?.title ?? '—'}</TableCell>
                    <TableCell>{mainCategoryTitle ?? '—'}</TableCell>
                    <TableCell>{story.authorName || '—'}</TableCell>
                    <TableCell className='uppercase'>{story.currentLanguage || '—'}</TableCell>
                    <TableCell>{story.chapters?.length ?? 0}</TableCell>
                    <TableCell>{story.totalLikes}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {story.isFeatured && <span className='text-xs'>Featured</span>}
                        {story.isTrending && <span className='text-xs'>Trending</span>}
                        {!story.isFeatured && !story.isTrending && (
                          <span className='text-muted-foreground text-xs'>—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <StoryActions story={story} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className='h-24 text-center'>
                  No stories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t px-1 py-3'>
        <div className='flex items-center gap-3'>
          <label className='text-sm font-medium whitespace-nowrap' htmlFor='stories-page-size'>
            Rows per page
          </label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPage(1);
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger id='stories-page-size' className='h-8 w-[4.5rem]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-3 sm:gap-6'>
          <p className='text-sm font-medium whitespace-nowrap'>
            Page {pagination.page} of {totalPages} · {pagination.total} stories
          </p>
          <Button
            aria-label='Go to first page'
            variant='outline'
            size='icon'
            disabled={!pagination.hasPreviousPage || isFetching}
            onClick={() => setPage(1)}
          >
            <Icons.chevronsLeft />
          </Button>
          <Button
            aria-label='Go to previous page'
            variant='outline'
            size='icon'
            disabled={!pagination.hasPreviousPage || isFetching}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            <Icons.chevronLeft />
          </Button>
          <Button
            aria-label='Go to next page'
            variant='outline'
            size='icon'
            disabled={!pagination.hasNextPage || isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            <Icons.chevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
