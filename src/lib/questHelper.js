import { supabase } from './supabase';

export const checkQuestProgress = async (userId, actionType, metadata = {}) => {
  try {
    // 1. Only fetch quests whose title contains the actionType keyword (case-insensitive)
    const { data: quests } = await supabase
      .from('quests')
      .select('*')
      .ilike('title', `%${actionType}%`);

    if (!quests || quests.length === 0) return;

    const hour = new Date().getHours();

    for (const quest of quests) {
      let shouldUpdate = true;

      // Special Case: "Level 2 Stories"
      if (quest.title.includes("Level 2") && metadata.level < 2) {
        shouldUpdate = false;
      }

      // Special Case: "Night Owl" — only counts after 8 PM (20:00)
      if (quest.title.includes("Night Owl") && hour < 20) {
        shouldUpdate = false;
      }

      if (!shouldUpdate) continue;

      // Get current progress for this quest
      const { data: progressData } = await supabase
        .from('user_quests')
        .select('progress, is_claimed')
        .eq('user_id', userId)
        .eq('quest_id', quest.id)
        .maybeSingle();

      const current = progressData?.progress ?? 0;
      const claimed = progressData?.is_claimed ?? false;

      if (!claimed && current < quest.target_count) {
        await supabase.from('user_quests').upsert(
          { user_id: userId, quest_id: quest.id, progress: Math.min(current + 1, quest.target_count) },
          { onConflict: 'user_id,quest_id' }
        );
      }
    }
  } catch (error) {
    // Quest update failed silently — non-critical background task
  }
};