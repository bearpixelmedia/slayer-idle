import { useState } from "react";

export default function useQuests(state, unlockedZoneIds) {
  const [questProgress, setQuestProgress] = useState({});

  const claimReward = (questId) => {};
  const resetQuestForRepeat = (questId) => {};

  return { questProgress, claimReward, resetQuestForRepeat };
}