"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Icons } from "@/components/icons";
import { apiClient } from "@/lib/api-client";

type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
};
type AuthResult = { message: string; user: UserProfile; isNewUser: boolean };

export default function UserAuth({
  initialProfile,
}: {
  initialProfile: UserProfile | null;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [email, setEmail] = useState(initialProfile?.email ?? "");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">(
    initialProfile ? "otp" : "email",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await apiClient<{ message: string }>(
        "/backend/user-auth/request-otp",
        { method: "POST", body: JSON.stringify({ email }) },
      );
      setNotice(
        response.message || "Check your inbox for your verification code.",
      );
      setStep("otp");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not send the code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiClient<AuthResult>(
        "/backend/user-auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            otp,
            ...(name.trim() ? { name: name.trim() } : {}),
          }),
        },
      );
      setProfile(result.user);
      router.refresh();
      if (result.isNewUser)
        setNotice("Your Ishq FM account is ready. Welcome!");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not verify the code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await apiClient("/backend/user-auth/logout", { method: "POST" });
    setProfile(null);
    setEmail("");
    setOtp("");
    setName("");
    setStep("email");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative w-full max-w-5xl">
        
        <div className="grid overflow-hidden rounded-3xl border bg-background shadow-xl md:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(var(--primary-foreground)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative">
              {/*<span className="grid size-12 place-items-center rounded-2xl bg-primary-foreground/15">
                <Icons.heart className="size-6" />
              </span>*/}
              <Link href="/user" className="mb-8 inline-flex items-center">
                <Image src="/images/ishq-fm-logo.png" alt="Ishq FM" width={300} height={100} priority className="h-20 w-auto object-contain" />
              </Link>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
                Your Ishq FM account
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Stories feel closer when they feel like yours.
              </h1>
              <p className="mt-4 max-w-sm leading-7 text-primary-foreground/75">
                Sign in to keep your story experience connected and pick up
                where your imagination left off.
              </p>
            </div>
            <p className="relative text-xs text-primary-foreground/60">
              A secure, password-free sign in.
            </p>
          </section>
          <section className="flex min-h-[560px] items-center justify-center p-6 sm:p-10">
            {profile ? (
              <div className="w-full max-w-3xl space-y-5">
                <div>
                  <p className="text-sm font-medium text-primary">
                    ISHQ FM · READER SPACE
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Your account
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    A little home for your Ishq FM profile.
                  </p>
                </div>
                <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-sm">
                  <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
                    <Avatar
                      size="lg"
                      className="size-16 ring-2 ring-primary-foreground/30"
                    >
                      <AvatarImage src={profile.avatar} alt="" />
                      <AvatarFallback className="bg-primary-foreground/15 text-xl text-primary-foreground">
                        {(profile.name || profile.email || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-primary-foreground/70">
                        Welcome back
                      </p>
                      <h2 className="mt-1 truncate text-2xl font-semibold">
                        {profile.name || "Reader"}
                      </h2>
                      <p className="mt-1 break-all text-sm text-primary-foreground/75">
                        {profile.email}
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium">
                      <Icons.circleCheck className="size-4" />
                      Account active
                    </span>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icons.user className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Account type
                        </p>
                        <p className="mt-1 font-semibold capitalize">
                          {profile.role || "Reader"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icons.mail className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Email status
                        </p>
                        <p className="mt-1 font-semibold">Verified</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icons.calendar className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Member since
                        </p>
                        <p className="mt-1 font-semibold">
                          {profile.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString()
                            : "Ishq FM reader"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Account details</CardTitle>
                    <CardDescription>
                      Your profile information returned by Ishq FM.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Display name
                      </p>
                      <p className="mt-1 font-medium">
                        {profile.name || "Reader"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Email address
                      </p>
                      <p className="mt-1 break-all font-medium">
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="mt-1 break-all font-mono text-xs">
                        {profile._id || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account status
                      </p>
                      <p className="mt-1 font-medium">
                        {profile.isActive === false ? "Inactive" : "Active"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Account actions</CardTitle>
                    <CardDescription>
                      Manage your current session or account settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center">
                    <Button variant="outline" onClick={() => void logout()}>
                      <Icons.logout className="mr-2 size-4" />
                      Sign out
                    </Button>
                    <Button
                      variant="destructive"
                      className="sm:ml-auto inline-flex "
                    >
                      <Link className=" inline-flex " href="/user/delete-account">
                        <Icons.trash className="mr-2 size-4" />
                        Delete account
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                {notice && (
                  <p role="status" className="text-sm text-primary">
                    {notice}
                  </p>
                )}
              </div>
            ) : (
              <Card className="w-full max-w-md border-0 shadow-none px-4">
                <CardHeader className="px-0">
                  <div className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icons.mail className="size-5" />
                  </div>
                  <CardTitle className="text-2xl">
                    {step === "email"
                      ? "Sign in or create account"
                      : "Check your email"}
                  </CardTitle>
                  <CardDescription>
                    {step === "email" ? (
                      "Enter your email and we’ll send you a one-time verification code."
                    ) : (
                      <>
                        We sent a 6-digit code to{" "}
                        <span className="font-medium text-foreground">
                          {email}
                        </span>
                        .
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {step === "email" ? (
                    <form onSubmit={requestOtp} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email address</Label>
                        <Input
                          id="user-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-name">
                          Name{" "}
                          <span className="text-muted-foreground">
                            (optional for new accounts)
                          </span>
                        </Label>
                        <Input
                          id="user-name"
                          autoComplete="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={busy}>
                        {busy ? "Sending code…" : "Send verification code"}
                        <Icons.chevronRight className="ml-auto" />
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={verifyOtp} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="user-otp">
                          6-digit verification code
                        </Label>
                        <InputOTP
                          id="user-otp"
                          maxLength={6}
                          value={otp}
                          onChange={setOtp}
                          autoComplete="one-time-code"
                          required
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }, (_, index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={busy || otp.length !== 6}
                      >
                        {busy ? "Verifying…" : "Verify and continue"}
                      </Button>
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                          onClick={() => {
                            setStep("email");
                            setError("");
                          }}
                        >
                          Change email
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                          disabled={busy}
                          onClick={(event) => {
                            const form = event.currentTarget
                              .closest("section")
                              ?.querySelector("form");
                            if (form) {
                              setStep("email");
                              setTimeout(
                                () =>
                                  (
                                    document.getElementById(
                                      "user-email",
                                    ) as HTMLInputElement | null
                                  )?.focus(),
                                0,
                              );
                            }
                          }}
                        >
                          Send a new code
                        </button>
                      </div>
                    </form>
                  )}
                  {error && (
                    <p
                      role="alert"
                      className="mt-4 break-words text-sm text-destructive"
                    >
                      {error}
                    </p>
                  )}
                  {notice && (
                    <p role="status" className="mt-4 text-sm text-primary">
                      {notice}
                    </p>
                  )}
                  <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy-policy"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
