import { supabaseDataProvider } from "ra-supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../lib/types/supabase";
import { ROLES } from "@/lib/role";

export const createDataProvider = (
  supabaseClient: SupabaseClient<Database>,
  instanceUrl: string,
  apiKey: string,
  getCurrentUserId: () => string | null,
  getUserRoles: () => string[],
) => {
  const baseDataProvider = supabaseDataProvider({
    instanceUrl,
    apiKey,
    supabaseClient,
  });

  return new Proxy(baseDataProvider, {
    get(target, prop) {
      // Intercept getList calls
      if (prop === "getList") {
        return async (resource: string, params: any) => {
          const userRoles = getUserRoles();
          const currentUserId = getCurrentUserId();

          // , filter exam_session and questions by user ID
          if (userRoles.includes(ROLES.SUPER_EDUCATOR)) {
            if (resource === "exam_session") {
              const filter = {
                ...params.filter,
                created_by: currentUserId,
              };
              return target.getList(resource, { ...params, filter });
            }

            if (resource === "questions") {
              const filter = {
                ...params.filter,
                created_by: currentUserId,
              };
              return target.getList(resource, { ...params, filter });
            }

            if (resource === "exams") {
              return target.getList(resource, params);
            }
            if (resource === "subjects") {
              return target.getList(resource, params);
            }

            if (resource === "profiles") {
              const filter = {
                ...params.filter,
                id: currentUserId,
              };
              return target.getList(resource, { ...params, filter });
            }

            // For all other resources - deny access
            return { data: [], total: 0 };
          }

          // For admin, return all data
          return target.getList(resource, params);
        };
      }
      // In your dataProvider proxy, add this handler:
      if (prop === "createMany") {
        return async (resource: string, params: any) => {
          const { data } = params;

          // Insert in batches of 50 to avoid timeouts
          const batchSize = 50;
          let allResults: any = [];

          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const results = await Promise.all(
              batch.map((record: any) =>
                target.create(resource, { data: record }),
              ),
            );
            allResults = [...allResults, ...results];
          }

          return { data: allResults };
        };
      }

      // For other methods (getOne, update, etc.), pass through
      return target[prop as keyof typeof target];
    },
  });
};
