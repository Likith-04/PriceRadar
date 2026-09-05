import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
	console.error("Supabase client env missing:", {
		NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
	});
}

export const createClient = () => {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Supabase client is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
	}

	return createBrowserClient(supabaseUrl, supabaseKey);
};
