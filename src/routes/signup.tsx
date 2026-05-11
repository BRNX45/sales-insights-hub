import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — SalesOS" },
      { name: "description", content: "Create a SalesOS account with your name and email." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});