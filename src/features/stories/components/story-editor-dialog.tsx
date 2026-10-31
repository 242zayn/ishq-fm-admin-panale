'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCategories } from '@/features/category/hooks/useCategory';
import { FileUploader } from '@/components/file-uploader';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Separator } from '@/components/ui/separator';
import { useAppForm } from '@/lib/form';
import type {
  Story,
  StoryCategory,
  StoryChapterPayload,
  StoryLanguage,
  StoryPayload,
  StoryTranslation
} from '../api/types';
import { useCreateStory, useGetStoryById, useUpdateStory } from '../api/hooks';
import { storyResource } from '../api/resource';

const storyIdField = '_id';
const categoryIdField = '_id';
const maxStoryImageSize = 1024 * 1024;
const storyImageAccept = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg']
};

const storyTranslationSchema = z.object({
  language: z.enum(['en', 'hi', 'bn', 'hinglish']),
  title: z.string().trim().min(1, 'Title is required'),
  synopsis: z.string().trim().min(1, 'Synopsis is required'),
  authorName: z.string().trim().min(1, 'Author is required')
});

const chapterTranslationSchema = z.object({
  language: z.enum(['en', 'hi', 'bn', 'hinglish']),
  title: z.string().trim().min(1, 'Chapter title is required'),
  paragraphs: z.string().trim().min(1, 'Add at least one paragraph')
});

const chapterSchema = z.object({
  chapterNumber: z.number().int().min(1),
  isLocked: z.boolean(),
  translations: z.array(chapterTranslationSchema).min(1, 'Add at least one chapter language')
});

const storyEditorBaseSchema = z.object({
  defaultLanguage: z.enum(['en', 'hi', 'bn', 'hinglish']),
  translations: z.array(storyTranslationSchema).min(1, 'Add at least one language'),
  chapters: z.array(chapterSchema).min(1, 'Add at least one chapter'),
  coverImage: z.string().trim().url('Enter a valid cover image URL'),
  bannerImage: z.string().trim().url('Enter a valid banner image URL'),
  categoryId: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .refine((id) => id !== 'none', 'Select a category'),
  tags: z.string().trim().min(1, 'Add at least one tag'),
  contentRating: z.string().trim().min(1, 'Content rating is required'),
  hasAudio: z.boolean(),
  audioUrl: z.string(),
  audioDurationSeconds: z.number().min(0),
  audioWaveform: z.string().refine((waveform) => {
    if (!waveform.trim()) return true;

    const points = waveform.split(',').map((point) => point.trim());
    return points.every((point) => point !== '' && Number.isFinite(Number(point)));
  }, 'Waveform must contain comma-separated numbers'),
  isFeatured: z.boolean(),
  isTrending: z.boolean()
});

function validateAudio(
  values: Pick<StoryEditorValues, 'hasAudio' | 'audioUrl' | 'audioDurationSeconds'>,
  context: z.RefinementCtx
) {
  if (values.hasAudio) {
    if (!z.url().safeParse(values.audioUrl).success) {
      context.addIssue({
        code: 'custom',
        path: ['audioUrl'],
        message: 'Enter a valid audio URL'
      });
    }
    if (values.audioDurationSeconds <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['audioDurationSeconds'],
        message: 'Audio duration must be greater than zero'
      });
    }
  }
}

const storyEditorSchema = storyEditorBaseSchema.superRefine((values, context) => {
  if (!values.translations.some((translation) => translation.language === values.defaultLanguage)) {
    context.addIssue({
      code: 'custom',
      path: ['defaultLanguage'],
      message: 'Add a translation for the default language'
    });
  }

  const translationLanguages = values.translations.map((translation) => translation.language);
  if (new Set(translationLanguages).size !== translationLanguages.length) {
    context.addIssue({
      code: 'custom',
      path: ['translations'],
      message: 'Each story language can only be added once'
    });
  }

  validateAudio(values, context);

  values.chapters.forEach((chapter, chapterIndex) => {
    const languages = chapter.translations.map((translation) => translation.language);
    if (new Set(languages).size !== languages.length) {
      context.addIssue({
        code: 'custom',
        path: ['chapters', chapterIndex, 'translations'],
        message: 'Each chapter language can only be added once'
      });
    }
  });
});

type StoryTranslationForm = {
  language: StoryLanguage;
  title: string;
  synopsis: string;
  authorName: string;
};

type ChapterTranslationForm = {
  language: StoryLanguage;
  title: string;
  paragraphs: string;
};

type ChapterForm = {
  chapterNumber: number;
  isLocked: boolean;
  translations: ChapterTranslationForm[];
};

type StoryEditorValues = {
  defaultLanguage: StoryLanguage;
  translations: StoryTranslationForm[];
  chapters: ChapterForm[];
  coverImage: string;
  bannerImage: string;
  categoryId: string;
  tags: string;
  contentRating: string;
  hasAudio: boolean;
  audioUrl: string;
  audioDurationSeconds: number;
  audioWaveform: string;
  isFeatured: boolean;
  isTrending: boolean;
};

const LANGUAGES: { value: StoryLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hinglish', label: 'Hinglish' }
];

function languageLabel(language: StoryLanguage) {
  return LANGUAGES.find((option) => option.value === language)?.label ?? language;
}

function emptyStoryTranslation(language: StoryLanguage): StoryTranslationForm {
  return { language, title: '', synopsis: '', authorName: '' };
}

function emptyChapterTranslation(language: StoryLanguage): ChapterTranslationForm {
  return { language, title: '', paragraphs: '' };
}

type StoryImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function StoryImageUpload({ label, value, onChange }: StoryImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(nextFiles: File[]) {
    setFiles(nextFiles);

    const file = nextFiles[0];
    if (!file) {
      onChange('');
      return;
    }

    if (!Object.keys(storyImageAccept).includes(file.type)) {
      toast.error('Only PNG, JPG, WEBP, and SVG images are allowed.');
      return;
    }

    if (file.size > maxStoryImageSize) {
      toast.error('Image size must be 1 MB or smaller.');
      return;
    }

    try {
      setIsUploading(true);
      const response = await storyResource.uploadImage(file);
      onChange(response.data.url);
      setFiles([]);
      toast.success(`${label} uploaded successfully.`);
    } catch (error) {
      setFiles([]);
      toast.error(error instanceof Error ? error.message : `Could not upload the ${label.toLowerCase()}.`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <p className='text-sm font-medium'>{label} *</p>
      {value ? (
        <Card size='sm' className='gap-0 py-0'>
          <CardHeader className='px-3 py-2'>
            <CardTitle>Current {label}</CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-3'>
            <Image
              src={value}
              alt={`Current ${label.toLowerCase()}`}
              width={320}
              height={80}
              unoptimized
              className='h-20 w-full rounded-md object-cover'
            />
          </CardContent>
        </Card>
      ) : null}
      <FileUploader
        value={files}
        onValueChange={(nextFiles) =>
          void handleFiles(typeof nextFiles === 'function' ? nextFiles(files) : nextFiles)
        }
        accept={storyImageAccept}
        maxSize={maxStoryImageSize}
        maxFiles={1}
        className='h-28'
        disabled={isUploading}
      />
      <p className='text-sm text-muted-foreground'>PNG, JPG, WEBP, or SVG only. Maximum file size: 1 MB.</p>
    </div>
  );
}

type StoryEditorDialogProps = {
  story?: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function StoryEditorDialog({ story, open, onOpenChange, onSaved }: StoryEditorDialogProps) {
  const storyId = story?.[storyIdField];
  const storyDetailQuery = useGetStoryById(storyId ?? '', undefined, {
    enabled: Boolean(storyId && open)
  });

  const activeStory = storyDetailQuery.data ?? story;
  const isDetailLoading = Boolean(storyId && storyDetailQuery.isLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{story ? 'Edit story' : 'Add story'}</DialogTitle>
          <DialogDescription>
            {story
              ? 'Edit story details, chapters, and multi-language content or add new languages.'
              : 'Add multi-language story details and chapter content for each language you support.'}
          </DialogDescription>
        </DialogHeader>

        {isDetailLoading ? (
          <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
            <Icons.spinner className='mr-2 h-5 w-5 animate-spin' />
            Loading story details...
          </div>
        ) : (
          <StoryEditorForm
            key={story ? `edit-${story[storyIdField]}-${storyDetailQuery.data ? 'full' : 'init'}` : 'create'}
            story={activeStory}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StoryEditorForm({
  story,
  onOpenChange,
  onSaved
}: {
  story?: Story;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const createMutation = useCreateStory();
  const updateMutation = useUpdateStory();
  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const isEdit = Boolean(story);

  const rawCategoryId = story?.categoryId;
  const categoryId =
    typeof rawCategoryId === 'string'
      ? rawCategoryId
      : ((rawCategoryId as StoryCategory)?.[categoryIdField] ?? '');

  const categories = categoriesQuery.data?.data ?? [];
  const currentCategoryTitle =
    typeof rawCategoryId === 'object' && rawCategoryId
      ? (rawCategoryId as StoryCategory).title
      : '';

  const categoryOptions = [
    { value: 'none', label: 'Select category' },
    ...categories.map((category) => ({ value: category.id, label: category.title })),
    ...(categoryId && !categories.some((category) => category.id === categoryId)
      ? [{ value: categoryId, label: currentCategoryTitle || 'Current category' }]
      : [])
  ];

  const defaultLang = ((story?.defaultLanguage || 'en') as StoryLanguage);

  // Initialize translations: prefer story.translations array, else fallback to root title/synopsis/author
  const initialTranslations: StoryTranslationForm[] =
    Array.isArray(story?.translations) && story.translations.length > 0
      ? story.translations.map((t) => ({
          language: t.language,
          title: t.title || '',
          synopsis: t.synopsis || '',
          authorName: t.authorName || ''
        }))
      : [
          {
            language: defaultLang,
            title: story?.title || '',
            synopsis: story?.synopsis || '',
            authorName: story?.authorName || ''
          }
        ];

  // Initialize chapters: prefer story.chapters with their translations, else fallback
  const initialChapters: ChapterForm[] =
    Array.isArray(story?.chapters) && story.chapters.length > 0
      ? story.chapters.map((ch, idx) => {
          const chTranslations: ChapterTranslationForm[] =
            Array.isArray(ch.translations) && ch.translations.length > 0
              ? ch.translations.map((ct) => ({
                  language: ct.language,
                  title: ct.title || '',
                  paragraphs: Array.isArray(ct.paragraphs)
                    ? ct.paragraphs.join('\n')
                    : String(ct.paragraphs || '')
                }))
              : [
                  {
                    language: defaultLang,
                    title: ch.title || `Chapter ${ch.chapterNumber ?? idx + 1}`,
                    paragraphs: Array.isArray(ch.paragraphs)
                      ? ch.paragraphs.join('\n')
                      : String(ch.paragraphs || '')
                  }
                ];

          return {
            chapterNumber: ch.chapterNumber ?? idx + 1,
            isLocked: Boolean(ch.isLocked),
            translations: chTranslations
          };
        })
      : [
          {
            chapterNumber: 1,
            isLocked: false,
            translations: [emptyChapterTranslation(defaultLang)]
          }
        ];

  const form = useAppForm({
    defaultValues: {
      defaultLanguage: defaultLang,
      translations: initialTranslations,
      chapters: initialChapters,
      coverImage: story?.coverImage ?? '',
      bannerImage: story?.bannerImage ?? '',
      categoryId: categoryId || 'none',
      tags: story?.tags?.join(', ') ?? '',
      contentRating: story?.contentRating ?? 'ALL',
      hasAudio: story?.hasAudio ?? false,
      audioUrl: story?.audioTrack?.audioUrl ?? '',
      audioDurationSeconds: story?.audioTrack?.durationSeconds ?? 0,
      audioWaveform: story?.audioTrack?.waveform?.join(', ') ?? '',
      isFeatured: story?.isFeatured ?? false,
      isTrending: story?.isTrending ?? false
    } as StoryEditorValues,
    validators: { onSubmit: storyEditorSchema },
    onSubmit: async ({ value }) => {
      const defaultTranslation =
        value.translations.find((t) => t.language === value.defaultLanguage) ??
        value.translations[0];

      const sharedValues = {
        coverImage: value.coverImage,
        bannerImage: value.bannerImage,
        categoryId: value.categoryId === 'none' ? null : value.categoryId,
        tags: value.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        contentRating: value.contentRating,
        hasAudio: value.hasAudio,
        audioTrack: value.hasAudio
          ? {
              audioUrl: value.audioUrl,
              durationSeconds: value.audioDurationSeconds,
              waveform: value.audioWaveform.trim()
                ? value.audioWaveform
                    .split(',')
                    .map((point) => Number(point.trim()))
                    .filter(Number.isFinite)
                : undefined
            }
          : undefined,
        isFeatured: value.isFeatured,
        isTrending: value.isTrending
      };

      const translations: StoryTranslation[] = value.translations.map((translation) => ({
        language: translation.language,
        title: translation.title.trim(),
        synopsis: translation.synopsis.trim(),
        authorName: translation.authorName.trim()
      }));

      const chapters: StoryChapterPayload[] = value.chapters.map((chapter) => {
        const defChapterTrans =
          chapter.translations.find((t) => t.language === value.defaultLanguage) ??
          chapter.translations[0];

        const defParagraphs = (defChapterTrans?.paragraphs ?? '')
          .split(/\r?\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean);

        const chapterTranslations = chapter.translations.map((translation) => ({
          language: translation.language,
          title: translation.title.trim(),
          paragraphs: translation.paragraphs
            .split(/\r?\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
        }));

        return {
          chapterNumber: chapter.chapterNumber,
          title: defChapterTrans?.title.trim() || `Chapter ${chapter.chapterNumber}`,
          paragraphs: defParagraphs.length > 0 ? defParagraphs : ['...'],
          isLocked: chapter.isLocked,
          translations: chapterTranslations
        };
      });

      const payload: StoryPayload = {
        ...sharedValues,
        title: defaultTranslation.title.trim(),
        synopsis: defaultTranslation.synopsis.trim(),
        authorName: defaultTranslation.authorName.trim(),
        defaultLanguage: value.defaultLanguage,
        translations,
        chapters,
        categoryId: value.categoryId,
        coverImage: value.coverImage,
        bannerImage: value.bannerImage,
        tags: sharedValues.tags ?? []
      };

      try {
        if (story) {
          await updateMutation.mutateAsync({
            id: story[storyIdField],
            values: payload
          });
          toast.success('Story updated successfully');
        } else {
          await createMutation.mutateAsync(payload);
          toast.success('Story created successfully');
        }
        onOpenChange(false);
        onSaved?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save the story.');
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  }

  return (
    <>
      {categoriesQuery.error ? (
        <Card role='alert' className='text-destructive p-4'>
          <p>Could not load categories: {categoriesQuery.error.message}</p>
          <Button
            className='mt-3'
            variant='outline'
            onClick={() => void categoriesQuery.refetch()}
          >
            Retry categories
          </Button>
        </Card>
      ) : null}

      <form onSubmit={handleSubmit}>
        <form.AppForm>
          <FieldGroup>
            <form.AppField
              name='defaultLanguage'
              listeners={{
                onChange: ({ value, fieldApi }) => {
                  const translations = fieldApi.form.getFieldValue('translations');
                  const firstTranslation = translations[0];
                  if (
                    translations.length === 1 &&
                    firstTranslation &&
                    !firstTranslation.title &&
                    !firstTranslation.synopsis &&
                    !firstTranslation.authorName
                  ) {
                    fieldApi.form.setFieldValue('translations[0].language', value);

                    const firstChTrans = fieldApi.form.getFieldValue(
                      'chapters[0].translations[0]'
                    );
                    if (firstChTrans && !firstChTrans.title && !firstChTrans.paragraphs) {
                      fieldApi.form.setFieldValue('chapters[0].translations[0].language', value);
                    }
                  }
                }
              }}
            >
              {(field) => (
                <field.SelectField
                  label='Default language'
                  options={LANGUAGES}
                  description='The main language of your story. It will be used as default fallback.'
                  required
                />
              )}
            </form.AppField>

            <Separator />
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <h3 className='font-semibold'>Story translations</h3>
                <p className='text-muted-foreground text-sm'>
                  Enter title, author, and synopsis for each language. Click “Add language” to support more languages.
                </p>
              </div>
              <form.AppField name='translations' mode='array'>
                {(field) => {
                  const usedLanguages = new Set(
                    field.state.value.map((translation) => translation.language)
                  );
                  const availableLanguage = LANGUAGES.find(
                    (language) => !usedLanguages.has(language.value)
                  );

                  return (
                    <Button
                      type='button'
                      variant='outline'
                      disabled={!availableLanguage}
                      onClick={() => {
                        if (availableLanguage) {
                          const newLang = availableLanguage.value;
                          field.pushValue(emptyStoryTranslation(newLang));

                          // Automatically sync this language into all existing chapters!
                          const currentChapters = field.form.getFieldValue('chapters') || [];
                          currentChapters.forEach((_, chIndex) => {
                            const existingTranslations =
                              field.form.getFieldValue(`chapters[${chIndex}].translations`) || [];
                            if (!existingTranslations.some((t: any) => t.language === newLang)) {
                              field.form.pushFieldValue(
                                `chapters[${chIndex}].translations`,
                                emptyChapterTranslation(newLang)
                              );
                            }
                          });
                        }
                      }}
                    >
                      <Icons.add className='mr-1.5 h-4 w-4' />
                      Add language
                    </Button>
                  );
                }}
              </form.AppField>
            </div>

            <form.AppField name='translations' mode='array'>
              {(field) => (
                <div className='flex flex-col gap-4'>
                  {field.state.value.map((translation, index) => {
                    const translationLanguages = new Set(
                      field.state.value
                        .filter((_, rowIndex) => rowIndex !== index)
                        .map((item) => item.language)
                    );
                    const languageOptions = LANGUAGES.map((language) => ({
                      ...language,
                      disabled: translationLanguages.has(language.value)
                    }));

                    return (
                      <Card key={`story-translation-${index}`}>
                        <CardHeader className='flex flex-row items-center justify-between gap-2 pb-2'>
                          <CardTitle className='text-base flex items-center gap-2'>
                            <span>{languageLabel(translation.language)} Translation</span>
                            <Badge variant='outline'>{translation.language.toUpperCase()}</Badge>
                          </CardTitle>
                          <div className='flex items-center gap-2'>
                            <form.AppField name={`translations[${index}].language` as const}>
                              {(languageField) => (
                                <languageField.SelectField
                                  label='Language'
                                  options={languageOptions}
                                  required
                                />
                              )}
                            </form.AppField>
                            <form.AppField name='defaultLanguage'>
                              {(defaultLanguageField) =>
                                defaultLanguageField.state.value === translation.language ? (
                                  <Badge variant='secondary'>Default</Badge>
                                ) : (
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      defaultLanguageField.handleChange(translation.language)
                                    }
                                  >
                                    Set default
                                  </Button>
                                )
                              }
                            </form.AppField>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              aria-label={`Remove ${languageLabel(translation.language)} translation`}
                              disabled={field.state.value.length <= 1}
                              onClick={() => {
                                const langToRemove = translation.language;
                                field.removeValue(index);

                                const currentChapters = field.form.getFieldValue('chapters') || [];
                                currentChapters.forEach((_, chIndex) => {
                                  const existingTranslations =
                                    field.form.getFieldValue(`chapters[${chIndex}].translations`) || [];
                                  const transIndex = existingTranslations.findIndex(
                                    (t: any) => t.language === langToRemove
                                  );
                                  if (transIndex !== -1 && existingTranslations.length > 1) {
                                    field.form.removeFieldValue(
                                      `chapters[${chIndex}].translations`,
                                      transIndex
                                    );
                                  }
                                });
                              }}
                            >
                              <Icons.trash className='h-4 w-4 text-destructive' />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <FieldGroup>
                            <div className='grid gap-4 sm:grid-cols-2'>
                              <form.AppField name={`translations[${index}].title` as const}>
                                {(item) => (
                                  <item.TextField
                                    label={`Title (${languageLabel(translation.language)})`}
                                    placeholder={`Story title in ${languageLabel(translation.language)}`}
                                    required
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                name={`translations[${index}].authorName` as const}
                              >
                                {(item) => (
                                  <item.TextField
                                    label={`Author (${languageLabel(translation.language)})`}
                                    placeholder={`Author name in ${languageLabel(translation.language)}`}
                                    required
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <form.AppField name={`translations[${index}].synopsis` as const}>
                              {(item) => (
                                <item.TextareaField
                                  label={`Synopsis (${languageLabel(translation.language)})`}
                                  placeholder={`Story synopsis in ${languageLabel(translation.language)}...`}
                                  required
                                  rows={3}
                                />
                              )}
                            </form.AppField>
                          </FieldGroup>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </form.AppField>

            <Separator />
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <h3 className='font-semibold'>Chapters & Language Content</h3>
                <p className='text-muted-foreground text-sm'>
                  Add chapters and their localized content for each supported language.
                </p>
              </div>
              <form.AppField name='chapters' mode='array'>
                {(field) => (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      const activeTranslations =
                        field.form.getFieldValue('translations') || [];
                      const chapterTranslations =
                        activeTranslations.length > 0
                          ? activeTranslations.map((translation) =>
                              emptyChapterTranslation(translation.language)
                            )
                          : [
                              emptyChapterTranslation(
                                field.form.getFieldValue('defaultLanguage') || 'en'
                              )
                            ];

                      field.pushValue({
                        chapterNumber: field.state.value.length + 1,
                        isLocked: false,
                        translations: chapterTranslations
                      });
                    }}
                  >
                    <Icons.add className='mr-1.5 h-4 w-4' />
                    Add chapter
                  </Button>
                )}
              </form.AppField>
            </div>

            <form.AppField name='chapters' mode='array'>
              {(chaptersField) => (
                <div className='flex flex-col gap-5'>
                  {chaptersField.state.value.map((chapter, chapterIndex) => (
                    <Card key={`story-chapter-${chapterIndex}`}>
                      <CardHeader className='flex flex-row items-center justify-between gap-2 pb-2'>
                        <CardTitle className='text-base font-bold'>
                          Chapter {chapter.chapterNumber}
                        </CardTitle>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          aria-label={`Remove chapter ${chapter.chapterNumber}`}
                          disabled={chaptersField.state.value.length <= 1}
                          onClick={() => chaptersField.removeValue(chapterIndex)}
                        >
                          <Icons.trash className='h-4 w-4 text-destructive' />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <FieldGroup>
                          <div className='grid gap-4 sm:grid-cols-2'>
                            <form.AppField
                              name={`chapters[${chapterIndex}].chapterNumber` as const}
                            >
                              {(item) => (
                                <item.TextField
                                  label='Chapter number'
                                  type='number'
                                  min={1}
                                  required
                                />
                              )}
                            </form.AppField>
                            <form.AppField
                              name={`chapters[${chapterIndex}].isLocked` as const}
                            >
                              {(item) => <item.SwitchField label='Locked chapter' compact />}
                            </form.AppField>
                          </div>

                          <div className='space-y-2 mt-2'>
                            <div className='text-sm font-semibold text-muted-foreground'>
                              Chapter Content by Language:
                            </div>

                            <form.AppField
                              name={`chapters[${chapterIndex}].translations` as const}
                              mode='array'
                            >
                              {(translationsField) => {
                                const usedLanguages = new Set(
                                  translationsField.state.value.map(
                                    (translation) => translation.language
                                  )
                                );
                                const availableLanguage = LANGUAGES.find(
                                  (language) => !usedLanguages.has(language.value)
                                );

                                return (
                                  <div className='flex flex-col gap-4'>
                                    {translationsField.state.value.map(
                                      (translation, translationIndex) => {
                                        const otherLanguages = new Set(
                                          translationsField.state.value
                                            .filter((_, index) => index !== translationIndex)
                                            .map((item) => item.language)
                                        );
                                        const languageOptions = LANGUAGES.map((language) => ({
                                          ...language,
                                          disabled: otherLanguages.has(language.value)
                                        }));

                                        return (
                                          <div
                                            key={`chapter-${chapterIndex}-translation-${translationIndex}`}
                                            className='rounded-lg border bg-muted/20 p-3 space-y-3'
                                          >
                                            <div className='flex items-center justify-between gap-2'>
                                              <div className='flex items-center gap-2'>
                                                <Badge variant='outline' className='font-semibold'>
                                                  {languageLabel(translation.language)}
                                                </Badge>
                                                <span className='text-xs text-muted-foreground'>
                                                  ({translation.language.toUpperCase()})
                                                </span>
                                              </div>
                                              <div className='flex items-center gap-2'>
                                                <form.AppField
                                                  name={
                                                    `chapters[${chapterIndex}].translations[${translationIndex}].language` as const
                                                  }
                                                >
                                                  {(languageField) => (
                                                    <languageField.SelectField
                                                      label='Language'
                                                      options={languageOptions}
                                                      required
                                                    />
                                                  )}
                                                </form.AppField>
                                                <Button
                                                  type='button'
                                                  variant='ghost'
                                                  size='icon'
                                                  aria-label={`Remove ${languageLabel(translation.language)} chapter translation`}
                                                  disabled={
                                                    translationsField.state.value.length <= 1
                                                  }
                                                  onClick={() =>
                                                    translationsField.removeValue(
                                                      translationIndex
                                                    )
                                                  }
                                                >
                                                  <Icons.trash className='h-4 w-4 text-destructive' />
                                                </Button>
                                              </div>
                                            </div>
                                            <FieldGroup>
                                              <form.AppField
                                                name={
                                                  `chapters[${chapterIndex}].translations[${translationIndex}].title` as const
                                                }
                                              >
                                                {(item) => (
                                                  <item.TextField
                                                    label={`Chapter title (${languageLabel(translation.language)})`}
                                                    placeholder={`Chapter title in ${languageLabel(translation.language)}`}
                                                    required
                                                  />
                                                )}
                                              </form.AppField>
                                              <form.AppField
                                                name={
                                                  `chapters[${chapterIndex}].translations[${translationIndex}].paragraphs` as const
                                                }
                                              >
                                                {(item) => (
                                                  <item.TextareaField
                                                    label={`Paragraphs (${languageLabel(translation.language)})`}
                                                    placeholder={`Write content in ${languageLabel(translation.language)}...\nEnter one paragraph per line.`}
                                                    description='Enter one paragraph per line.'
                                                    rows={4}
                                                    required
                                                  />
                                                )}
                                              </form.AppField>
                                            </FieldGroup>
                                          </div>
                                        );
                                      }
                                    )}
                                    <div className='flex justify-end'>
                                      <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        disabled={!availableLanguage}
                                        onClick={() => {
                                          if (availableLanguage) {
                                            translationsField.pushValue(
                                              emptyChapterTranslation(availableLanguage.value)
                                            );
                                          }
                                        }}
                                      >
                                        <Icons.add className='mr-1.5 h-3.5 w-3.5' />
                                        Add chapter language
                                      </Button>
                                    </div>
                                  </div>
                                );
                              }}
                            </form.AppField>
                          </div>
                        </FieldGroup>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </form.AppField>

            <Separator />
            <h3 className='font-semibold'>Story details & Media</h3>
            <div className='grid gap-4 sm:grid-cols-2'>
              <form.AppField name='coverImage'>
                {(field) => (
                  <StoryImageUpload
                    label='Cover image'
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
              <form.AppField name='bannerImage'>
                {(field) => (
                  <StoryImageUpload
                    label='Banner image'
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
              <form.AppField name='categoryId'>
                {(field) => (
                  <field.SelectField
                    label='Category'
                    options={categoryOptions}
                    placeholder={categoriesQuery.isPending ? 'Loading categories...' : 'Select category'}
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name='contentRating'>
                {(field) => <field.TextField label='Content rating' placeholder='ALL' required />}
              </form.AppField>
              <form.AppField name='tags'>
                {(field) => (
                  <field.TextField
                    label='Tags'
                    placeholder='romance, drama, thriller'
                    description='Separate tags with commas.'
                    required
                  />
                )}
              </form.AppField>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <form.AppField name='hasAudio'>
                {(field) => <field.SwitchField label='Audio available' compact />}
              </form.AppField>
              <form.AppField name='isFeatured'>
                {(field) => <field.SwitchField label='Featured' compact />}
              </form.AppField>
              <form.AppField name='isTrending'>
                {(field) => <field.SwitchField label='Trending' compact />}
              </form.AppField>
            </div>
            <form.Subscribe selector={(state) => state.values.hasAudio}>
              {(hasAudio) =>
                hasAudio ? (
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <form.AppField name='audioUrl'>
                      {(field) => (
                        <field.TextField
                          label='Audio URL'
                          type='url'
                          placeholder='https://...'
                          required
                        />
                      )}
                    </form.AppField>
                    <form.AppField name='audioDurationSeconds'>
                      {(field) => (
                        <field.TextField
                          label='Duration (seconds)'
                          type='number'
                          min={1}
                          required
                        />
                      )}
                    </form.AppField>
                    <form.AppField name='audioWaveform'>
                      {(field) => (
                        <field.TextField
                          label='Waveform'
                          placeholder='12, 28, 45'
                          description='Optional comma-separated numbers.'
                        />
                      )}
                    </form.AppField>
                  </div>
                ) : null
              }
            </form.Subscribe>
          </FieldGroup>
          <div className='mt-6 flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton loading={isPending} type='submit'>
              {isEdit ? 'Save changes' : 'Create story'}
            </LoadingButton>
          </div>
        </form.AppForm>
      </form>
    </>
  );
}

export function CreateStoryButton({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type='button' onClick={() => setOpen(true)}>
        Add story
      </Button>
      {open ? <StoryEditorDialog open={open} onOpenChange={setOpen} onSaved={onCreated} /> : null}
    </>
  );
}
