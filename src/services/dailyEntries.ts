import { supabase } from "../supabaseClient";

export type DailyEntry = {
  date: string;
  pnl: number | null;
  trades: number | null;
  followedRules: "yes" | "no" | "";
  forcedTrade: "yes" | "no" | "";
  studyTopic: string;
  studyMinutes: number | null;
  achievement: string;
  mistake: string;
  tomorrowPriority: string;
};

function toBoolean(value: "yes" | "no" | ""): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function toChoice(value: boolean | null): "yes" | "no" | "" {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

export async function getDailyEntries(): Promise<DailyEntry[]> {
  const { data, error } = await supabase
    .from("daily_entries")
    .select(`
      entry_date,
      pnl,
      trades,
      followed_rules,
      forced_trade,
      study_topic,
      study_minutes,
      achievement,
      mistake,
      tomorrow_priority
    `)
    .order("entry_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((entry) => ({
    date: entry.entry_date,
    pnl: entry.pnl,
    trades: entry.trades,
    followedRules: toChoice(entry.followed_rules),
    forcedTrade: toChoice(entry.forced_trade),
    studyTopic: entry.study_topic ?? "",
    studyMinutes: entry.study_minutes,
    achievement: entry.achievement ?? "",
    mistake: entry.mistake ?? "",
    tomorrowPriority: entry.tomorrow_priority ?? "",
  }));
}

export async function saveDailyEntry(entry: DailyEntry) {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("You must be signed in to save entries.");
  }

  const { error } = await supabase
    .from("daily_entries")
    .upsert(
      {
        user_id: authData.user.id,
        entry_date: entry.date,
        pnl: entry.pnl,
        trades: entry.trades,
        followed_rules: toBoolean(entry.followedRules),
        forced_trade: toBoolean(entry.forcedTrade),
        study_topic: entry.studyTopic || null,
        study_minutes: entry.studyMinutes,
        achievement: entry.achievement || null,
        mistake: entry.mistake || null,
        tomorrow_priority: entry.tomorrowPriority || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_date",
      }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteDailyEntry(date: string) {
  const { error } = await supabase
    .from("daily_entries")
    .delete()
    .eq("entry_date", date);

  if (error) {
    throw new Error(error.message);
  }
}