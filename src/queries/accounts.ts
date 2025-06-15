
import { supabase } from "@/integrations/supabase/client";
import { Account } from "@/types/account";

export async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, code, name, type, balance, nature, level, status, parent_id, sat_code, description")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching accounts:", error);
    throw new Error("No se pudieron cargar las cuentas.");
  }

  return data.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      balance: a.balance,
      nature: a.nature,
      level: a.level,
      status: a.status,
      parentId: a.parent_id,
      satCode: a.sat_code,
      description: a.description
  })) as Account[];
}
