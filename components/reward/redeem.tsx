import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/animate-ui/components/radix/dialog";

import { Member, Reward } from "@/types/typeData";
import RewardCardDisplay from "./rewardCardDisplay";
import RewardCardDialog from "./rewardCardDialog";

type RedeemProps = {
  member: Member;
  reward: Reward;
};

export default function Redeem({ reward, member }: RedeemProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setIsEditing(false); // reset edit mode ketika dialog ditutup
      }}
    >
      {/* CARD */}
      <DialogTrigger asChild>
        <div>
          <RewardCardDisplay reward={reward} member={member} onOpen={() => setOpen(true)} />
        </div>
      </DialogTrigger>

      {/* DIALOG */}
      <RewardCardDialog reward={reward} member={member} setOpen={setOpen} isEditing={isEditing} setIsEditing={setIsEditing} />
    </Dialog>
  );
}
