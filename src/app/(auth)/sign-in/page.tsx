import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <SignInForm next={params.next} />;
}
