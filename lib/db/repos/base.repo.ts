import { getServiceClient } from "@/lib/db/supabase/server-client";

export abstract class BaseRepo {
  protected db = getServiceClient();
}




