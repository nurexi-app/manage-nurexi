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

  // Store user info
  let userRoles: string[] = [];
  let currentUserId: string | null = null;
  let full_name: string = "";

  // Function to fetch user profile data
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
      full_name = profile?.full_name!;
    }
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
      return baseAuthProvider.logout(params);
    },

    checkAuth: async (params: any) => {
      const result = await baseAuthProvider.checkAuth(params);
      await fetchUserProfile();
      return result;
    },

    checkError: baseAuthProvider.checkError,
    getPermissions: baseAuthProvider.getPermissions,

    getIdentity: async () => {
      if (!currentUserId) {
        await fetchUserProfile();

        if (!currentUserId) {
          throw new Error("User not authenticated");
        }
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
      const { action, resource, record } = params;

      // Admin has access to everything
      if (userRoles.includes(ROLES.ADMIN)) {
        return true;
      }

      if (userRoles.includes(ROLES.SUPER_EDUCATOR)) {
        // For listing resources (no record yet) - allow access but will filter in dataProvider
        if (!record) {
          // Allow access to exam_session, exams, and questions for listing
          if (
            resource === "exam_session" ||
            resource === "exams" ||
            resource === "questions" ||
            resource === "subjects"
          ) {
            return true;
          }
          return false;
        }

        // For specific records (edit, show, delete)
        if (resource === "exam_session") {
          return (
            record.created_by === currentUserId ||
            record.user_id === currentUserId
          );
        }

        if (resource === "questions") {
          return (
            record.created_by === currentUserId ||
            record.user_id === currentUserId
          );
        }

        return false;
      }

      return false;
    },
  };
};
