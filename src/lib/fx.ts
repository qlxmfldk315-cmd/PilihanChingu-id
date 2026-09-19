import { supabase } from "./supabase";

export async function getKrwToIdrRate(): Promise<number> {
  const { data, error } = await supabase
    .from("fx_rates")
    .select("rate")
    .eq("pair", "KRW_IDR")
    .single();

  if (error || !data) return 12;
  return data.rate;
}