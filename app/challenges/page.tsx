import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Челленджи | КиноТека",
    description: "Раздел челленджей недоступен",
  };
}

export default async function ChallengesPage() {
  redirect("/");
}

