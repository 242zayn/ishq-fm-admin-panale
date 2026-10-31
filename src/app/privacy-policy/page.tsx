import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ishq FM',
  description: 'Learn how Ishq FM handles account, usage, and story interaction information.'
};

const sections = [
  ['Information we handle', 'Depending on how you use Ishq FM, we may process account details such as your name, email address, and profile information; content you submit; and activity such as stories viewed, likes, and language preferences. The app may also receive basic technical information needed to keep the service secure and working.'],
  ['How we use it', 'We use information to provide and maintain Ishq FM, manage accounts, show stories and relevant preferences, process interactions such as likes, respond to support requests, protect the service, and improve its features.'],
  ['Cookies and local storage', 'Ishq FM may use cookies or browser storage to remember sign-in state, preferences, and security settings. You can control cookies through your browser, though some parts of the service may not work correctly if essential storage is disabled.'],
  ['When information is shared', 'We do not sell personal information. Information may be processed by service providers that help us operate the app, or disclosed when required by law or needed to protect users, rights, and service security. We ask providers to handle information for the services they perform.'],
  ['Retention and security', 'We keep information for as long as needed to provide the service, meet legitimate operational needs, and comply with applicable requirements. We use reasonable safeguards, but no online service can guarantee absolute security.'],
  ['Your choices', 'You may be able to review or update account details through the app. You can also contact us to ask about access, correction, or deletion of your information. Some records may need to be retained where required by law or for legitimate security purposes.'],
  ['Children’s privacy', 'Ishq FM is not intended for children who are not permitted to use the service under applicable law. If you believe a child has provided personal information, contact us so we can review the request.'],
  ['Policy updates and contact', 'We may update this policy as Ishq FM changes. We will post the current version on this page and revise the date below. For privacy questions or requests, use the contact channel provided in the app or on the Ishq FM website.']
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className='min-h-screen bg-muted/30 px-4 py-10 sm:px-6 sm:py-16'>
      <div className='mx-auto max-w-5xl'>
        <Link href='/login' className='mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-tight'>
          {/*<span className='grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground'><Icons.heart className='size-5' /></span>*/}
          Ishq FM
        </Link>
        <div className='grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]'>
          <aside className='h-fit rounded-2xl border bg-background p-5 lg:sticky lg:top-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Your privacy</p>
            <h2 className='mt-3 text-lg font-semibold'>Your stories are yours. Your data deserves care.</h2>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>A plain language overview of the information used to run Ishq FM.</p>
            <div className='mt-5 border-t pt-4 text-xs text-muted-foreground'>Last updated: October 31, 2026</div>
          </aside>
          <article className='rounded-2xl border bg-background p-6 sm:p-10'>
            <p className='text-sm font-medium text-primary'>ISHQ FM · PRIVACY</p>
            <h1 className='mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'>Privacy Policy</h1>
            <p className='mt-5 max-w-2xl text-base leading-7 text-muted-foreground'>This policy describes how Ishq FM handles information when you use our story library, audio features, and account tools.</p>
            <div className='my-8 h-px bg-border' />
            <div className='space-y-8'>
              {sections.map(([title, content], index) => (
                <section key={title} className='grid gap-3 sm:grid-cols-[40px_minmax(0,1fr)]'>
                  <span className='grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'>{String(index + 1).padStart(2, '0')}</span>
                  <div><h2 className='text-lg font-semibold'>{title}</h2><p className='mt-2 text-sm leading-7 text-muted-foreground'>{content}</p></div>
                </section>
              ))}
            </div>
            <div className='mt-10 rounded-xl bg-muted/60 p-5 text-sm leading-6 text-muted-foreground'>For the rules that apply when using Ishq FM, read our <Link className='font-medium text-foreground underline underline-offset-4' href='/terms'>Terms of Use</Link>.</div>
          </article>
        </div>
      </div>
    </main>
  );
}
