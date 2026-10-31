import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_API_URL } from "@/lib/backend-api-proxy";
import DeleteAccount from "./delete-account";

export const metadata: Metadata = {
  title: "Delete account | Ishq FM",
  description: "Review and confirm deletion of your Ishq FM account.",
};

export default async function DeleteAccountPage() {
  const token = (await cookies()).get("user_access_token")?.value;
  if (!token) redirect("/user");
  let name = "Ishq FM reader";
  let email = "";
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (response.status === 401) redirect("/user");
    if (response.ok) {
      const payload: unknown = await response.json();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "user" in payload &&
        typeof payload.user === "object" &&
        payload.user !== null
      ) {
        if ("name" in payload.user && typeof payload.user.name === "string")
          name = payload.user.name;
        if ("email" in payload.user && typeof payload.user.email === "string")
          email = payload.user.email;
      }
    }
  } catch {
    /* Keep the page usable if profile details cannot be loaded. */
  }
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl">
        {/*<Link href="/user" className="mb-8 inline-flex items-center">
          <Image
            src="/images/ishq-fm-logo.png"
            alt="Ishq FM"
            width={164}
            height={48}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>*/}
        <section className="rounded-2xl border bg-background p-6 shadow-sm sm:p-9">
          <div className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <span className="text-xl font-semibold">!</span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
            Account deletion
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Delete your account
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            You are about to permanently delete{" "}
            <span className="font-medium text-foreground">{name}</span>
            {email ? <> ({email})</> : null} and its associated Ishq FM data.
          </p>
          <ul className="mt-6 list-inside list-disc space-y-2 rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            <li>Your account profile will be deleted.</li>
            <li>
              Associated story likes, ratings, and reading records will be
              removed.
            </li>
            <li>This action cannot be undone.</li>
          </ul>
          <DeleteAccount />
          <div className="mt-5 border-t pt-5">
            <Link
              href="/user"
              className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cancel and return to account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
