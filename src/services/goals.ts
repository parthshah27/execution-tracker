import { supabase } from "../supabaseClient";

export type GoalCategory =
  | "trading"
  | "upskilling"
  | "personal";

export type GoalStatus =
  | "active"
  | "completed";

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  target: string;
  deadline: string | null;
  status: GoalStatus;
  createdAt: string;
};

export type CreateGoalInput = {
  title: string;
  category: GoalCategory;
  target: string;
  deadline: string | null;
};

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

export async function getGoals(): Promise<Goal[]> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("goals")
    .select(`
      id,
      title,
      category,
      target,
      deadline,
      status,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((goal) => ({
    id: goal.id,
    title: goal.title,
    category: goal.category as GoalCategory,
    target: goal.target ?? "",
    deadline: goal.deadline,
    status: goal.status as GoalStatus,
    createdAt: goal.created_at,
  }));
}

export async function createGoal(
  goal: CreateGoalInput
): Promise<Goal> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to create a goal."
    );
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: goal.title.trim(),
      category: goal.category,
      target: goal.target.trim() || null,
      deadline: goal.deadline || null,
      status: "active",
    })
    .select(`
      id,
      title,
      category,
      target,
      deadline,
      status,
      created_at
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category as GoalCategory,
    target: data.target ?? "",
    deadline: data.deadline,
    status: data.status as GoalStatus,
    createdAt: data.created_at,
  };
}

export async function updateGoal(
  id: string,
  updates: Partial<
    Pick<
      Goal,
      | "title"
      | "category"
      | "target"
      | "deadline"
      | "status"
    >
  >
): Promise<Goal> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    payload.title = updates.title.trim();
  }

  if (updates.category !== undefined) {
    payload.category = updates.category;
  }

  if (updates.target !== undefined) {
    payload.target =
      updates.target.trim() || null;
  }

  if (updates.deadline !== undefined) {
    payload.deadline =
      updates.deadline || null;
  }

  if (updates.status !== undefined) {
    payload.status = updates.status;
  }

  const { data, error } = await supabase
    .from("goals")
    .update(payload)
    .eq("id", id)
    .select(`
      id,
      title,
      category,
      target,
      deadline,
      status,
      created_at
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category as GoalCategory,
    target: data.target ?? "",
    deadline: data.deadline,
    status: data.status as GoalStatus,
    createdAt: data.created_at,
  };
}

export async function deleteGoal(
  id: string
) {
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}