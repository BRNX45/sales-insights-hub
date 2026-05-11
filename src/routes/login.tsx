import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — SalesOS" },
      { name: "description", content: "Log in to SalesOS with your email or Google account." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});