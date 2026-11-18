'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useBroadcastNotification,
  useMarkAllNotificationsAsRead,
  useSendNotification
} from '../hooks/useNotifications';
import { UserPickerDialog } from './user-picker-dialog';
import { GuestPickerDialog } from './guest-picker-dialog';
import type { User } from '@/features/users/api/types';
import type { GuestUser } from '@/features/guest-users/api/types';

const SCREEN_TARGETS = [
  { value: 'home', label: 'Home Screen' },
  { value: 'story', label: 'Story Reader' },
  { value: 'category', label: 'Category Page' },
  { value: 'subscription', label: 'Subscription / VIP' },
  { value: 'profile', label: 'Profile' }
];

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const [mode, setMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [targetType, setTargetType] = useState<'userId' | 'guestId' | 'pushToken'>('userId');
  const [targetValue, setTargetValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<GuestUser | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [guestPickerOpen, setGuestPickerOpen] = useState(false);

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
    setSelectedUser(null);
    setSelectedGuest(null);
    setManualEntry(false);
    setScreen('home');
    setStoryId('');
  };

  const handleTargetTypeChange = (type: 'userId' | 'guestId' | 'pushToken') => {
    setTargetType(type);
    setTargetValue('');
    setSelectedUser(null);
    setSelectedGuest(null);
    setManualEntry(false);
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
              ? 'Please select or enter the target User ID.'
              : targetType === 'guestId'
                ? 'Please select or enter the target Guest ID.'
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto p-6'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-lg'>
                <Icons.notification className='text-primary h-5 w-5' />
                Send Push Notification
              </DialogTitle>
              <DialogDescription>
                Dispatch real-time push and in-app notifications to mobile devices.
              </DialogDescription>
            </DialogHeader>

            {/* Mode Switch: Broadcast vs Single Target */}
            <div className='space-y-2'>
              <Label className='text-xs font-semibold text-muted-foreground'>
                Delivery Audience *
              </Label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setMode('broadcast')}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer ${
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
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer ${
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
              <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3.5'>
                <div className='flex items-center gap-4'>
                  <Label className='text-xs font-medium'>Target By:</Label>
                  <div className='flex flex-wrap items-center gap-3 text-xs'>
                    <label className='flex items-center gap-1.5 cursor-pointer'>
                      <input
                        type='radio'
                        name='dialogTargetType'
                        checked={targetType === 'userId'}
                        onChange={() => handleTargetTypeChange('userId')}
                        className='accent-primary'
                      />
                      User ID
                    </label>
                    <label className='flex items-center gap-1.5 cursor-pointer'>
                      <input
                        type='radio'
                        name='dialogTargetType'
                        checked={targetType === 'guestId'}
                        onChange={() => handleTargetTypeChange('guestId')}
                        className='accent-primary'
                      />
                      Guest ID
                    </label>
                    <label className='flex items-center gap-1.5 cursor-pointer'>
                      <input
                        type='radio'
                        name='dialogTargetType'
                        checked={targetType === 'pushToken'}
                        onChange={() => handleTargetTypeChange('pushToken')}
                        className='accent-primary'
                      />
                      Expo Push Token
                    </label>
                  </div>
                </div>

                {/* USER TARGET SELECTION */}
                {targetType === 'userId' && (
                  <div className='space-y-2'>
                    {selectedUser ? (
                      <div className='flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs'>
                            {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold text-xs text-foreground truncate'>
                                {selectedUser.name}
                              </span>
                              {selectedUser.role && (
                                <Badge
                                  variant='outline'
                                  className='text-[10px] py-0 px-1.5 h-4 capitalize'
                                >
                                  {selectedUser.role}
                                </Badge>
                              )}
                            </div>
                            <span className='text-[11px] text-muted-foreground truncate'>
                              {selectedUser.email}
                            </span>
                            <span className='text-[10px] font-mono text-muted-foreground/80 truncate'>
                              ID: {selectedUser.id}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1 shrink-0'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => setUserPickerOpen(true)}
                            className='h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer'
                          >
                            Change
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              setSelectedUser(null);
                              setTargetValue('');
                            }}
                            className='h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer'
                            title='Remove user'
                          >
                            <Icons.close className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>
                    ) : !manualEntry ? (
                      <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Target Registered User *</Label>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setUserPickerOpen(true)}
                          className='w-full justify-between h-11 px-3.5 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-left transition-colors cursor-pointer'
                        >
                          <div className='flex items-center gap-2.5'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
                              <Icons.search className='h-3.5 w-3.5' />
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs font-semibold text-foreground'>
                                Click to Search & Select Registered User
                              </span>
                              <span className='text-[11px] text-muted-foreground'>
                                Search name, email, or ID from Users API
                              </span>
                            </div>
                          </div>
                          <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
                        </Button>
                        <div className='flex justify-end pt-0.5'>
                          <button
                            type='button'
                            onClick={() => setManualEntry(true)}
                            className='text-[11px] text-muted-foreground hover:text-primary underline cursor-pointer'
                          >
                            Or enter User ID manually
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-1.5'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='dialogTargetValue' className='text-xs font-medium'>
                            MongoDB User ID *
                          </Label>
                          <button
                            type='button'
                            onClick={() => {
                              setManualEntry(false);
                              setUserPickerOpen(true);
                            }}
                            className='text-[11px] text-primary hover:underline cursor-pointer'
                          >
                            ← Back to User Search Dialog
                          </button>
                        </div>
                        <Input
                          id='dialogTargetValue'
                          placeholder='e.g. 6740b2c3d4e5f6a7b8c9d012'
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          className='h-9 font-mono text-xs'
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* GUEST USER TARGET SELECTION */}
                {targetType === 'guestId' && (
                  <div className='space-y-2'>
                    {selectedGuest ? (
                      <div className='flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs'>
                            <Icons.teams className='h-4 w-4' />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold text-xs text-foreground truncate'>
                                {selectedGuest.name || 'Anonymous Guest'}
                              </span>
                              <Badge
                                variant='outline'
                                className='text-[10px] py-0 px-1.5 h-4 text-muted-foreground'
                              >
                                Guest
                              </Badge>
                            </div>
                            <span className='text-[11px] font-mono text-muted-foreground truncate'>
                              {selectedGuest.guestId}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1 shrink-0'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => setGuestPickerOpen(true)}
                            className='h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer'
                          >
                            Change
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              setSelectedGuest(null);
                              setTargetValue('');
                            }}
                            className='h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer'
                            title='Remove guest'
                          >
                            <Icons.close className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>
                    ) : !manualEntry ? (
                      <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Target Guest User *</Label>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setGuestPickerOpen(true)}
                          className='w-full justify-between h-11 px-3.5 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-left transition-colors cursor-pointer'
                        >
                          <div className='flex items-center gap-2.5'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
                              <Icons.teams className='h-3.5 w-3.5' />
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs font-semibold text-foreground'>
                                Click to Search & Select Guest User
                              </span>
                              <span className='text-[11px] text-muted-foreground'>
                                Search name or guest ID from Guest API
                              </span>
                            </div>
                          </div>
                          <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
                        </Button>
                        <div className='flex justify-end pt-0.5'>
                          <button
                            type='button'
                            onClick={() => setManualEntry(true)}
                            className='text-[11px] text-muted-foreground hover:text-primary underline cursor-pointer'
                          >
                            Or enter Guest ID manually
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-1.5'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='dialogTargetValue' className='text-xs font-medium'>
                            Guest User ID *
                          </Label>
                          <button
                            type='button'
                            onClick={() => {
                              setManualEntry(false);
                              setGuestPickerOpen(true);
                            }}
                            className='text-[11px] text-primary hover:underline cursor-pointer'
                          >
                            ← Back to Guest Search Dialog
                          </button>
                        </div>
                        <Input
                          id='dialogTargetValue'
                          placeholder='e.g. guest-xxxxxxxx-xxxx'
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          className='h-9 font-mono text-xs'
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* PUSH TOKEN TARGET SELECTION */}
                {targetType === 'pushToken' && (
                  <div className='space-y-1.5'>
                    <Label htmlFor='dialogTargetValue' className='text-xs font-medium'>
                      Expo Push Token (ExponentPushToken[...]) *
                    </Label>
                    <Input
                      id='dialogTargetValue'
                      placeholder='e.g. ExponentPushToken[xxxxxxxxxxxxxx]'
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className='h-9 font-mono text-xs'
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Title and Message Body */}
            <div className='space-y-3.5'>
              <div className='space-y-1.5'>
                <Label htmlFor='dialogNotifTitle' className='text-xs font-semibold'>
                  Title *
                </Label>
                <Input
                  id='dialogNotifTitle'
                  placeholder='e.g. 🔥 New Story Released: Midnight Echoes'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='dialogNotifBody' className='text-xs font-semibold'>
                  Message Body *
                </Label>
                <Textarea
                  id='dialogNotifBody'
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
                <Label htmlFor='dialogNotifImageUrl' className='text-xs font-semibold'>
                  Banner Image URL (Optional)
                </Label>
                <Input
                  id='dialogNotifImageUrl'
                  type='url'
                  placeholder='https://res.cloudinary.com/.../banner.jpg'
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Deep link / Navigation data */}
            <div className='space-y-3 rounded-xl border border-border/60 bg-card p-3'>
              <Label className='text-xs font-semibold text-foreground'>
                Deep Linking & Target Screen
              </Label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='dialogTargetScreen' className='text-xs text-muted-foreground'>
                    Open Screen on Tap
                  </Label>
                  <Select value={screen} onValueChange={(val) => setScreen(val ?? 'home')}>
                    <SelectTrigger id='dialogTargetScreen' className='h-9 text-xs'>
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
                    <Label htmlFor='dialogTargetStoryId' className='text-xs text-muted-foreground'>
                      Story ID *
                    </Label>
                    <Input
                      id='dialogTargetStoryId'
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

            <DialogFooter className='pt-2 sm:gap-2'>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Search Picker Subdialog */}
      <UserPickerDialog
        open={userPickerOpen}
        onOpenChange={setUserPickerOpen}
        selectedUserId={selectedUser?.id || targetValue}
        onSelect={(user) => {
          setSelectedUser(user);
          setTargetValue(user.id);
          setManualEntry(false);
        }}
      />

      {/* Guest User Search Picker Subdialog */}
      <GuestPickerDialog
        open={guestPickerOpen}
        onOpenChange={setGuestPickerOpen}
        selectedGuestId={selectedGuest?.guestId || targetValue}
        onSelect={(guest) => {
          setSelectedGuest(guest);
          setTargetValue(guest.guestId);
          setManualEntry(false);
        }}
      />
    </>
  );
}

export function NotificationsHeaderActions() {
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <Button
        onClick={() => setDialogOpen(true)}
        size='sm'
        className='gap-2 shadow-xs cursor-pointer'
      >
        <Icons.add className='h-4 w-4' />
        Send Notification
      </Button>
      <SendNotificationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

export function SendNotificationDialogTrigger() {
  return <NotificationsHeaderActions />;
}
