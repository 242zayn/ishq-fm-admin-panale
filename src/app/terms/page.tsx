import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Terms of Use | Ishq FM',
  description: 'Terms for using Ishq FM and its collection of stories and audio.'
};

const sections = [
  ['Using Ishq FM', 'Ishq FM provides a library of stories and related audio content. You agree to use the service lawfully and respectfully, and not to disrupt the service, probe its security, or access accounts or content without permission.'],
  ['Your account', 'Some features may require an account. Keep your sign-in details secure and tell us promptly if you believe someone else has accessed your account. You are responsible for activity carried out through your account.'],
  ['Stories and other content', 'Stories, chapters, artwork, audio, and branding may be protected by intellectual property laws. You may read or listen through the features we provide for personal, non-commercial use. Do not copy, republish, sell, redistribute, or create derivative works from content unless you have permission from the rights holder or the law allows it.'],
  ['Your submissions', 'If you submit content or feedback, you confirm that you have the rights needed to do so. You give Ishq FM permission to host, display, and process that submission as needed to operate and improve the service. You retain any rights you already hold in your content.'],
  ['Availability and changes', 'We may update, suspend, or remove parts of Ishq FM, including stories or features, as the service develops. We aim to keep the service available, but cannot promise uninterrupted access.'],
  ['Disclaimer and liability', 'Ishq FM is provided as available. To the extent permitted by applicable law, we disclaim implied warranties and are not liable for indirect or consequential losses arising from use of the service. Nothing in these terms limits rights or liabilities that cannot legally be limited.'],
  ['Changes to these terms', 'We may revise these terms when the service or applicable requirements change. The updated version will be posted here with a revised date. Continued use after an update means you accept the revised terms.'],
  ['Contact', 'For questions about these terms, contact the Ishq FM team through the contact channel provided in the app or on the Ishq FM website.']
] as const;

export default function TermsPage() {
  return (
    <main className='min-h-screen bg-muted/30 px-4 py-10 sm:px-6 sm:py-16'>
      <div className='mx-auto max-w-5xl'>
        <Link href='/login' className='mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-tight'>
          {/*<span className='grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground'><Icons.heart className='size-5' /></span>*/}
          Ishq FM
        </Link>
        <div className='grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]'>
          <aside className='h-fit rounded-2xl border bg-background p-5 lg:sticky lg:top-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>The essentials</p>
            <h2 className='mt-3 text-lg font-semibold'>A little clarity goes a long way.</h2>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>These terms explain the basics of enjoying stories and audio on Ishq FM.</p>
            <div className='mt-5 border-t pt-4 text-xs text-muted-foreground'>Last updated: October 31, 2026</div>
          </aside>
          <article className='rounded-2xl border bg-background p-6 sm:p-10'>
            <p className='text-sm font-medium text-primary'>ISHQ FM · TERMS</p>
            <h1 className='mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'>Terms of Use</h1>
            <p className='mt-5 max-w-2xl text-base leading-7 text-muted-foreground'>Welcome to Ishq FM. These terms apply when you access or use our stories, chapters, audio, and related features.</p>
            <div className='my-8 h-px bg-border' />
            <div className='space-y-8'>
              {sections.map(([title, content], index) => (
                <section key={title} className='grid gap-3 sm:grid-cols-[40px_minmax(0,1fr)]'>
                  <span className='grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'>{String(index + 1).padStart(2, '0')}</span>
                  <div><h2 className='text-lg font-semibold'>{title}</h2><p className='mt-2 text-sm leading-7 text-muted-foreground'>{content}</p></div>
                </section>
              ))}
            </div>
            <div className='mt-10 rounded-xl bg-muted/60 p-5 text-sm leading-6 text-muted-foreground'>Please read these terms together with our <Link className='font-medium text-foreground underline underline-offset-4' href='/privacy-policy'>Privacy Policy</Link>.</div>
          </article>
        </div>
      </div>
    </main>
  );
}
