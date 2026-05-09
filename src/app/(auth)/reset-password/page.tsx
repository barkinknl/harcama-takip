import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Yeni Şifre" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
