"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {

  const router = useRouter();

  useEffect(() => {

    const createProfile = async () => {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

     
const user = session.user;

console.log(user.user_metadata);

     const { data: existingProfile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();

     if (!existingProfile) {

  const { error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: user.user_metadata.full_name,
      email: user.email,
      avatar_url:
        user.user_metadata.avatar_url ||
        user.user_metadata.picture
    });


  if (error) {

    console.log("Profile creation error:", error);

  }
  else {

    await supabase
  .from("user_usage")
  .upsert({
    user_id: user.id,
    generations_used: 0,
    plan: "free"
  });

  }

}


      router.push("/dashboard");

    };


    createProfile();

  }, [router]);


  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Creating your profile...</p>
    </div>
  );
}