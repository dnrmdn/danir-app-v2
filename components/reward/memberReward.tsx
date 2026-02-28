"use client";

import HorizontalCards from "../shared/horizontalCard";
import MemberRewardContent from "./memberRewardContent";

export default function MemberReward() {
  return <HorizontalCards>{(member) => <MemberRewardContent member={member} />}</HorizontalCards>;
}
