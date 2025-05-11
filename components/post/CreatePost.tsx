"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function CreatePost() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const handleCreatePost = () => {
    // Extract the community slug directly from the pathname
    // This will already be in the correct format as it appears in the URL
    const communitySlug = pathname.includes("/community/")
      ? pathname.split("/community/")[1]
      : null;

    // If we're in a community, redirect to create post with that community pre-selected
    if (communitySlug) {
      // Use the slug directly from the URL - it's already formatted correctly!
      router.push(`/create-post?subreddit=${communitySlug}`);
    } else {
      // Otherwise just go to the create post page
      router.push("/create-post");
    }
  };

  return (
    <Button onClick={handleCreatePost} disabled={!user}>
      <Plus className="w-4 h-4 mr-2" />
      {user ? "Create Post" : "Sign in to create post"}
    </Button>
  );
}

export default CreatePost;
