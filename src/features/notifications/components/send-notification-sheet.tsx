'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  useBroadcastNotification,
  useMarkAllNotificationsAsRead,
  useSendNotification
} from '../hooks/useNotifications';

const SCREEN_TARGETS = [
  { value: 'home', label: 'Home Screen' },
  { value: 'story', label: 'Story Reader' },
  { value: 'category', label: 'Category Page' },
  { value: 'subscription', label: 'Subscription / VIP' },
  { value: 'profile', label: 'Profile' }
];

interface SendNotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationSheet({ open, onOpenChange }: SendNotificationSheetProps) {
  const [mode, setMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [targetType, setTargetType] = useState<'userId' | 'guestId' | 'pushToken'>('userId');
  const [targetValue, setTargetValue] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [screen, setScreen] = useState('home');
  const [storyId, setStoryId] = useState('');

  const sendMutation = useSendNotification();
  const broadcastMutation = useBroadcastNotification();
  const isPending = sendMutation.isPending || broadcastMutation.isPending;

  const resetForm = () => {
    setTitle('');
    setBody('');
    setImageUrl('');
    setTargetValue('');
    setScreen('home');
    setStoryId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a notification title.');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter notification body text.');
      return;
    }

    const dataPayload: Record<string, unknown> = {
      screen
    };
    if (screen === 'story' && storyId.trim()) {
      dataPayload.storyId = storyId.trim();
    }

    try {
      if (mode === 'broadcast') {
        const res = await broadcastMutation.mutateAsync({
          title: title.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
          data: dataPayload
        });

        if (res.success) {
          toast.success(
            `Broadcast sent successfully! Dispatched to ${res.sentCount ?? 0} active devices.`
          );
          onOpenChange(false);
          resetForm();
        } else {
          toast.error(res.message || 'Failed to broadcast notification.');
        }
      } else {
        if (!targetValue.trim()) {
          toast.error(
            targetType === 'userId'
              ? 'Please enter the target User ID.'
              : targetType === 'guestId'
                ? 'Please enter the target Guest ID.'
                : 'Please enter the target Expo Push Token.'
          );
          return;
        }

        const payload: {
          title: string;
          body: string;
          imageUrl?: string;
          userId?: string;
          guestId?: string;
          pushToken?: string;
          data?: Record<string, unknown>;
        } = {
          title: title.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
          data: dataPayload
        };

        if (targetType === 'userId') {
          payload.userId = targetValue.trim();
        } else if (targetType === 'guestId') {
          payload.guestId = targetValue.trim();
        } else {
          payload.pushToken = targetValue.trim();
        }

        const res = await sendMutation.mutateAsync(payload);
        if (res.success) {
          toast.success(
            `Notification sent successfully! Dispatched to ${res.sentCount ?? 1} devices.`
          );
          onOpenChange(false);
          resetForm();
        } else {
          toast.error(res.message || 'Failed to send notification.');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send push notification.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-lg overflow-y-auto '>
        <form onSubmit={handleSubmit} className='space-y-6 '>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <Icons.notification className='text-primary h-5 w-5' />
              Send Push Notification
            </SheetTitle>
            <SheetDescription>
              Dispatch real-time push and in-app notifications to mobile devices.
            </SheetDescription>
          </SheetHeader>

          {/* Mode Switch: Broadcast vs Single Target */}
          <div className='space-y-2 px-2'>
            <Label className='text-xs font-semibold text-muted-foreground'>
              Delivery Audience *
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={() => setMode('broadcast')}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all cursor-pointer ${
                  mode === 'broadcast'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Icons.share className='h-4 w-4' />
                Broadcast (All Users)
              </button>
              <button
                type='button'
                onClick={() => setMode('targeted')}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all cursor-pointer ${
                  mode === 'targeted'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Icons.user className='h-4 w-4' />
                Specific Target
              </button>
            </div>
          </div>

          {/* Targeted specifics */}
          {mode === 'targeted' && (
            <div className='rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3'>
              <div className='flex items-center gap-4'>
                <Label className='text-xs font-medium'>Target By:</Label>
                <div className='flex flex-wrap items-center gap-3 text-xs'>
                  <label className='flex items-center gap-1.5 cursor-pointer'>
                    <input
                      type='radio'
                      name='targetType'
                      checked={targetType === 'userId'}
                      onChange={() => setTargetType('userId')}
                      className='accent-primary'
                    />
                    User ID
                  </label>
                  <label className='flex items-center gap-1.5 cursor-pointer'>
                    <input
                      type='radio'
                      name='targetType'
                      checked={targetType === 'guestId'}
                      onChange={() => setTargetType('guestId')}
                      className='accent-primary'
                    />
                    Guest ID
                  </label>
                  <label className='flex items-center gap-1.5 cursor-pointer'>
                    <input
                      type='radio'
                      name='targetType'
                      checked={targetType === 'pushToken'}
                      onChange={() => setTargetType('pushToken')}
                      className='accent-primary'
                    />
                    Expo Push Token
                  </label>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='targetValue' className='text-xs font-medium'>
                  {targetType === 'userId'
                    ? 'MongoDB User ID *'
                    : targetType === 'guestId'
                      ? 'Guest User ID *'
                      : 'Expo Push Token (ExponentPushToken[...]) *'}
                </Label>
                <Input
                  id='targetValue'
                  placeholder={
                    targetType === 'userId'
                      ? 'e.g. 6740b2c3d4e5f6a7b8c9d012'
                      : targetType === 'guestId'
                        ? 'e.g. guest-xxxxxxxx-xxxx'
                        : 'e.g. ExponentPushToken[xxxxxxxxxxxxxx]'
                  }
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className='h-9 font-mono text-xs'
                  required
                />
              </div>
            </div>
          )}

          {/* Title and Message Body */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='notifTitle' className='text-xs font-semibold'>
                Title *
              </Label>
              <Input
                id='notifTitle'
                placeholder='e.g. 🔥 New Story Released: Midnight Echoes'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='notifBody' className='text-xs font-semibold'>
                Message Body *
              </Label>
              <Textarea
                id='notifBody'
                placeholder='Write your push notification message here...'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={500}
                required
              />
              <span className='text-[11px] text-muted-foreground'>
                Keep messages concise for optimal mobile lock screen display.
              </span>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='notifImageUrl' className='text-xs font-semibold'>
                Banner Image URL (Optional)
              </Label>
              <Input
                id='notifImageUrl'
                type='url'
                placeholder='https://res.cloudinary.com/.../banner.jpg'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Deep link / Navigation data */}
          <div className='space-y-3 rounded-xl border border-border/60 bg-card p-3.5'>
            <Label className='text-xs font-semibold text-foreground'>
              Deep Linking & Target Screen
            </Label>
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='targetScreen' className='text-xs text-muted-foreground'>
                  Open Screen on Tap
                </Label>
                <Select value={screen} onValueChange={(val) => setScreen(val ?? 'home')}>
                  <SelectTrigger id='targetScreen' className='h-9 text-xs'>
                    <SelectValue placeholder='Select destination screen' />
                  </SelectTrigger>
                  <SelectContent>
                    {SCREEN_TARGETS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {screen === 'story' && (
                <div className='space-y-1.5'>
                  <Label htmlFor='targetStoryId' className='text-xs text-muted-foreground'>
                    Story ID *
                  </Label>
                  <Input
                    id='targetStoryId'
                    placeholder='e.g. 6740c3d4e5f6a7b8c9d01234'
                    value={storyId}
                    onChange={(e) => setStoryId(e.target.value)}
                    className='h-9 font-mono text-xs'
                    required={screen === 'story'}
                  />
                </div>
              )}
            </div>
          </div>

          <SheetFooter className='gap-2 sm:gap-0 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <LoadingButton type='submit' loading={isPending} className='gap-2 font-medium'>
              <Icons.send className='h-4 w-4' />
              {mode === 'broadcast' ? 'Broadcast to All' : 'Send to Target'}
            </LoadingButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function NotificationsHeaderActions() {
  const [open, setOpen] = useState(false);
  const markAllMutation = useMarkAllNotificationsAsRead();

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllMutation.mutateAsync();
      if (res.success) {
        toast.success(res.message || 'All notifications marked as read');
      } else {
        toast.error('Failed to mark all notifications as read');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      );
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleMarkAllAsRead}
        disabled={markAllMutation.isPending}
        className='gap-2 text-xs'
      >
        <Icons.check className='h-3.5 w-3.5' />
        {markAllMutation.isPending ? 'Marking...' : 'Mark All as Read'}
      </Button>
      <Button onClick={() => setOpen(true)} size='sm' className='gap-2 shadow-xs'>
        <Icons.add className='h-4 w-4' />
        Send Notification
      </Button>
      <SendNotificationSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function SendNotificationSheetTrigger() {
  return <NotificationsHeaderActions />;
}
