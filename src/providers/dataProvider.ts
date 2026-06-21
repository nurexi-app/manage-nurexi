// src/providers/dataProvider.ts
// Fix: roles are no longer checked as mutually exclusive "first match wins"
// blocks. Instead, each RESOURCE checks whether the user has the role that
// applies to *it specifically*. A user with multiple roles (e.g. both
// super-educator and contributor) now gets correct access to both areas
// instead of being trapped in whichever role's block happens to come first.

import { supabaseDataProvider } from "ra-supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../lib/types/supabase";
import { ROLES } from "@/lib/role";

export const createDataProvider = (
  supabaseClient: SupabaseClient<Database>,
  instanceUrl: string,
  apiKey: string,
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
          const identity = await getIdentity();
          const userRoles: string[] = identity?.roles ?? [];
          const currentUserId: string | null = identity?.id ?? null;

          const isAdmin = userRoles.includes(ROLES.ADMIN);
          const isSuperEducator = userRoles.includes(ROLES.SUPER_EDUCATOR);
          const isContributor = userRoles.includes(ROLES.CONTRIBUTOR);

          // ── admin — full access, short-circuit everything else ────────────
          if (isAdmin) {
            return target.getList(resource, params);
          }

          // ── resources — contributor-owned resource ─────────────────────────
          // Checked independently of other roles. A user can be BOTH a
          // super-educator AND a contributor — this must not be an
          // either/or branch.
          if (resource === "resources") {
            if (isContributor) {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, created_by: currentUserId },
              });
            }
            return { data: [], total: 0 };
          }

          // ── exam_session — super-educator-owned resource ───────────────────
          if (resource === "exam_session") {
            if (isSuperEducator) {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, created_by: currentUserId },
              });
            }
            return { data: [], total: 0 };
          }

          // ── questions — super-educator-owned resource ──────────────────────
          if (resource === "questions") {
            if (isSuperEducator) {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, created_by: currentUserId },
              });
            }
            return { data: [], total: 0 };
          }

          // ── profiles — super-educator sees only their own profile ──────────
          if (resource === "profiles") {
            if (isSuperEducator) {
              return target.getList(resource, {
                ...params,
                filter: { ...params.filter, id: currentUserId },
              });
            }
            return { data: [], total: 0 };
          }

          // ── exams / subjects — visible to super-educators, unfiltered ──────
          if (resource === "exams" || resource === "subjects") {
            if (isSuperEducator) {
              return target.getList(resource, params);
            }
            return { data: [], total: 0 };
          }

          // ── anything else — deny by default ─────────────────────────────────
          return { data: [], total: 0 };
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
