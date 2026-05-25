import { supabaseDataProvider } from "ra-supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../lib/types/supabase";
import { ROLES } from "@/lib/role";

export const createDataProvider = (
  supabaseClient: SupabaseClient<Database>,
  instanceUrl: string,
  apiKey: string,
  // Instead of getter functions that may return stale values,
  // we accept a function that returns a Promise — this forces
  // fresh identity resolution on every getList call.
  getIdentity: () => Promise<{ id: string; roles: string[] } | null>,
) => {
  const baseDataProvider = supabaseDataProvider({
    instanceUrl,
    apiKey,
    supabaseClient,
  });

  return new Proxy(baseDataProvider, {
    get(target, prop) {
      if (prop === "getList") {
        return async (resource: string, params: any) => {
          // Always await fresh identity — never rely on pre-populated variables
          const identity = await getIdentity();
          const userRoles: string[] = identity?.roles ?? [];
          const currentUserId: string | null = identity?.id ?? null;

          if (userRoles.includes(ROLES.SUPER_EDUCATOR)) {
            if (resource === "exam_session") {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, created_by: currentUserId },
              });
            }

            if (resource === "questions") {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, created_by: currentUserId },
              });
            }

            if (resource === "profiles") {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, id: currentUserId },
              });
            }

            // exams and subjects — visible to super-educator, no filter
            if (resource === "exams" || resource === "subjects") {
              return target.getList(resource, params);
            }

            // everything else — deny
            return { data: [], total: 0 };
          }

          // admin — full access
          return target.getList(resource, params);
        };
      }

      if (prop === "createMany") {
        return async (resource: string, params: any) => {
          const { data } = params;
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

      return target[prop as keyof typeof target];
    },
  });
};
