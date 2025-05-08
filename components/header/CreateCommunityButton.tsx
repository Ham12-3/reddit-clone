"use client";

import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus } from "lucide-react";

function CreateCommunityButton() {
  const { user } = useUser();
  return (
    <Dialog>
      <DialogTrigger
        className="w-full p-2 pl-5 flex items-center rounded-md cursor-pointer bg-black text-white hover:bg-black transition-all duration-200 disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!user}
      >
        <Plus className="w-4 h-4 mr-2" />

        {user ? "Create a Coommunity" : "Sign in to create community"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCommunityButton;
