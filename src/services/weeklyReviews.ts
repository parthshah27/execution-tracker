import { supabase } from "../supabaseClient";

export type WeeklyReview = {
  id: string;
  weekStart: string;
  wentWell: string;
  biggestMistake: string;
  upskillingAchievement: string;
  nextWeekFocus: string;
  selfRating: number | null;
  createdAt: string;
};

export type SaveWeeklyReviewInput = {
  weekStart: string;
  wentWell: string;
  biggestMistake: string;
  upskillingAchievement: string;
  nextWeekFocus: string;
  selfRating: number | null;
};

function mapWeeklyReview(
  review: {
    id: string;
    week_start: string;
    went_well: string | null;
    biggest_mistake: string | null;
    upskilling_achievement: string | null;
    next_week_focus: string | null;
    self_rating: number | null;
    created_at: string;
  }
): WeeklyReview {
  return {
    id: review.id,
    weekStart: review.week_start,
    wentWell: review.went_well ?? "",
    biggestMistake: review.biggest_mistake ?? "",
    upskillingAchievement:
      review.upskilling_achievement ?? "",
    nextWeekFocus:
      review.next_week_focus ?? "",
    selfRating: review.self_rating,
    createdAt: review.created_at,
  };
}

async function getAuthenticatedUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    if (error.message.toLowerCase().includes("jwt issued at future")) {
      await supabase.auth.signOut();
      return null;
    }

    throw new Error(error.message);
  }

  return session?.user ?? null;
}

export async function getWeeklyReviews(): Promise<
  WeeklyReview[]
> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("weekly_reviews")
    .select(`
      id,
      week_start,
      went_well,
      biggest_mistake,
      upskilling_achievement,
      next_week_focus,
      self_rating,
      created_at
    `)
    .order("week_start", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWeeklyReview);
}

export async function getWeeklyReview(
  weekStart: string
): Promise<WeeklyReview | null> {
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select(`
      id,
      week_start,
      went_well,
      biggest_mistake,
      upskilling_achievement,
      next_week_focus,
      self_rating,
      created_at
    `)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapWeeklyReview(data) : null;
}

export async function saveWeeklyReview(
  input: SaveWeeklyReviewInput
): Promise<WeeklyReview> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to save a weekly review."
    );
  }

  const { data, error } = await supabase
    .from("weekly_reviews")
    .upsert(
      {
        user_id: user.id,
        week_start: input.weekStart,
        went_well: input.wentWell.trim() || null,
        biggest_mistake:
          input.biggestMistake.trim() || null,
        upskilling_achievement:
          input.upskillingAchievement.trim() ||
          null,
        next_week_focus:
          input.nextWeekFocus.trim() || null,
        self_rating: input.selfRating,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,week_start",
      }
    )
    .select(`
      id,
      week_start,
      went_well,
      biggest_mistake,
      upskilling_achievement,
      next_week_focus,
      self_rating,
      created_at
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapWeeklyReview(data);
}

export async function deleteWeeklyReview(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("weekly_reviews")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}