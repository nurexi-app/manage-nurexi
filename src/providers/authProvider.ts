import { supabaseAuthProvider } from "ra-supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../lib/types/supabase";
import { ROLES } from "../lib/role";

export const createAuthProvider = (
  supabaseClient: SupabaseClient<Database>,
  instanceUrl: string,
  apiKey: string,
) => {
  const baseAuthProvider = supabaseAuthProvider(supabaseClient, {});

  let userRoles: string[] = [];
  let currentUserId: string | null = null;
  let full_name: string = "";

  // de-dupes concurrent fetches so canAccess + getIdentity firing
  // at the same time don't trigger two separate DB calls
  let profileFetchPromise: Promise<void> | null = null;

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (user) {
      currentUserId = user.id;
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("roles,full_name")
        .eq("id", user.id)
        .single();

      userRoles = profile?.roles || [];
      full_name = profile?.full_name ?? "";
    } else {
      currentUserId = null;
      userRoles = [];
      full_name = "";
    }
  };

  // call this at the START of canAccess / getIdentity — guarantees
  // userRoles is populated before any role check runs
  const ensureProfileLoaded = async () => {
    if (currentUserId && userRoles.length > 0) return;

    if (!profileFetchPromise) {
      profileFetchPromise = fetchUserProfile().finally(() => {
        profileFetchPromise = null;
      });
    }
    await profileFetchPromise;
  };

  return {
    login: async (params: any) => {
      const result = await baseAuthProvider.login(params);
      await fetchUserProfile();
      return result;
    },

    logout: async (params: any) => {
      userRoles = [];
      currentUserId = null;
      full_name = "";
      return baseAuthProvider.logout(params);
    },

    checkAuth: async (params: any) => {
      const result = await baseAuthProvider.checkAuth(params);
      await ensureProfileLoaded();
      return result;
    },

    checkError: baseAuthProvider.checkError,
    getPermissions: baseAuthProvider.getPermissions,

    getIdentity: async () => {
      await ensureProfileLoaded();

      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      return {
        id: currentUserId as string,
        fullName: full_name,
        roles: userRoles,
      };
    },

    canAccess: async (params: {
      action: string;
      resource: string;
      record?: any;
    }) => {
      // ← THE FIX — guarantee roles are loaded before checking anything
      await ensureProfileLoaded();

      const { resource, record } = params;

      if (userRoles.includes(ROLES.ADMIN)) {
        return true;
      }

      if (userRoles.includes(ROLES.SUPER_EDUCATOR)) {
        if (!record) {
          if (
            resource === "exam_session" ||
            resource === "exams" ||
            resource === "questions" ||
            resource === "subjects"
          ) {
            return true;
          }
          // don't return false here unconditionally — fall through
          // so a user who is ALSO a contributor can still pass below
        } else {
          if (resource === "exam_session" || resource === "questions") {
            return (
              record.created_by === currentUserId ||
              record.user_id === currentUserId
            );
          }
        }
      }

      // contributor — resources only — checked independently,
      // NOT as an else-if, so dual-role users aren't blocked
      if (userRoles.includes(ROLES.CONTRIBUTOR)) {
        if (resource === "resources") {
          if (!record) return true;
          return record.created_by === currentUserId;
        }
      }

      return false;
    },
  };
};
