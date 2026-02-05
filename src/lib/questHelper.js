import { supabase } from './supabase';

export const checkQuestProgress = async (userId, actionType, metadata = {}) => {
  try {
    // 1. Get all quests
    const { data: quests } = await supabase.from('quests').select('*');
    if (!quests) return;

    for (const quest of quests) {
      let shouldUpdate = false;

      // --- LOGIC MATCHING ---
      
      // Standard Matching (e.g., "Read" matches "Read 1 Story")
      if (quest.title.toLowerCase().includes(actionType.toLowerCase())) {
        shouldUpdate = true;
      }

      // Special Case: "Level 2 Stories"
      if (quest.title.includes("Level 2") && metadata.level < 2) {
        shouldUpdate = false; // Don't count if story was too easy
      }

      // Special Case: "Night Owl"
      if (quest.title.includes("Night Owl")) {
        const hour = new Date().getHours();
        if (hour < 20) shouldUpdate = false; // Only counts after 8 PM (20:00)
      }

      // --- UPDATE DB IF MATCHED ---
      if (shouldUpdate) {
        // Get current progress
        const { data: progressData } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', userId)
          .eq('quest_id', quest.id)
          .single();

        let current = progressData ? progressData.progress : 0;
        let claimed = progressData ? progressData.is_claimed : false;

        if (!claimed && current < quest.target_count) {
          const newProgress = Math.min(current + 1, quest.target_count);
          
          await supabase.from('user_quests').upsert(
            { user_id: userId, quest_id: quest.id, progress: newProgress },
            { onConflict: 'user_id, quest_id' }
          );
          console.log(`Updated: ${quest.title}`);
        }
      }
    }
  } catch (error) {
    console.error("Quest Error:", error);
  }
};