"use client";

import {
  GetCommentRepliesQueryResult,
  GetPostCommentsQueryResult,
} from "@/sanity.types";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import TimeAgo from "../TimeAgo";
import CommentList from "./CommentList";
import CommentReply from "./CommentReply";
import PostVoteButtons from "../post/PostVoteButtons";
import { getCommentRepliesAction } from "@/action/getCommentData";

function Comment({
  postId,
  comment,
  userId,
}: {
  postId: string;
  comment:
    | GetPostCommentsQueryResult[number]
    | GetCommentRepliesQueryResult[number];
  userId: string | null;
}) {
  // Add type annotation to useState
  const [replies, setReplies] = useState<GetCommentRepliesQueryResult>([]);
  // Convert vote status to match expected format in PostVoteButtons
  let userVoteStatus: "up" | "down" | null = null;

  if (comment.votes?.voteStatus === "upvote") {
    userVoteStatus = "up";
  } else if (comment.votes?.voteStatus === "downvote") {
    userVoteStatus = "down";
  }

  useEffect(() => {
    // Fetch replies using server action
    async function fetchReplies() {
      const data = await getCommentRepliesAction(comment._id, userId);
      setReplies(data);
    }

    fetchReplies();
  }, [comment._id, userId]);

  return (
    <article className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex gap-4">
        <PostVoteButtons
          contentId={comment._id}
          votes={comment.votes}
          vote={userVoteStatus} // Now correctly typed
          contentType="comment"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {comment.author?.imageUrl ? (
              <div className="flex-shrink-0">
                <Image
                  src={comment.author.imageUrl}
                  alt={`${comment.author.username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <UserCircle className="w-10 h-10 text-gray-300" />
              </div>
            )}

            <h3 className="font-medium text-gray-900">
              {comment.author?.username || "Anonymous"}
            </h3>
            <span className="text-xs text-gray-500">
              <TimeAgo date={new Date(comment.createdAt!)} />
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{comment.content}</p>

          <CommentReply postId={postId} comment={comment} />

          {/* Comment replies - supports infinite nesting */}
          {replies?.length > 0 && (
            <div className="mt-3 ps-2 border-s-2 border-gray-100">
              <CommentList postId={postId} comments={replies} userId={userId} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default Comment;
