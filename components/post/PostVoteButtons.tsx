"use client";

import { upvote } from "@/action/upvote";
import { downvote } from "@/action/downvote";
import { useState, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

function PostVoteButtons({
  contentId,
  votes,
  vote,
  contentType,
}: {
  contentId: string;
  votes: any; // Using any since votes might be missing properties
  vote: "up" | "down" | null;
  contentType: "post" | "comment";
}) {
  const [optimisticVote, setOptimisticVote] = useState(vote);
  const [isPending, startTransition] = useTransition();

  // Safely extract vote counts with fallback to 0
  const upvotes = votes?.upvotes || 0;
  const downvotes = votes?.downvotes || 0;

  // Calculate the vote count
  const voteCount = upvotes - downvotes;

  // Handle upvote action
  const handleUpvote = () => {
    // Your existing upvote logic
    startTransition(async () => {
      // Update optimistic UI first
      setOptimisticVote(optimisticVote === "up" ? null : "up");

      // Call the server action
      await upvote(contentId, contentType);
    });
  };

  // Handle downvote action
  const handleDownvote = () => {
    // Your existing downvote logic
    startTransition(async () => {
      // Update optimistic UI first
      setOptimisticVote(optimisticVote === "down" ? null : "down");

      // Call the server action
      await downvote(contentId, contentType);
    });
  };

  return (
    <div className="flex flex-col items-center mr-3">
      <button
        onClick={handleUpvote}
        className={`p-1 ${optimisticVote === "up" ? "text-orange-500" : "text-gray-400"}`}
        disabled={isPending}
      >
        <ArrowBigUp className="w-6 h-6" />
      </button>

      {/* Convert to string to avoid the NaN error */}
      <span className="text-xs font-medium">{String(voteCount)}</span>

      <button
        onClick={handleDownvote}
        className={`p-1 ${optimisticVote === "down" ? "text-blue-500" : "text-gray-400"}`}
        disabled={isPending}
      >
        <ArrowBigDown className="w-6 h-6" />
      </button>
    </div>
  );
}

export default PostVoteButtons;
