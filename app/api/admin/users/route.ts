import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Service role client (server only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/admin/users -> list users with expanded city & community details
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("last_active_at", { ascending: false });
    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate unique city & community ids
    const cityIds = Array.from(
      new Set(
        users
          .flatMap((u: any) => (Array.isArray(u.cities) ? u.cities : []))
          .filter(Boolean)
      )
    );
    const communityIds = Array.from(
      new Set(
        users
          .flatMap((u: any) =>
            Array.isArray(u.communities) ? u.communities : []
          )
          .filter(Boolean)
      )
    );

    // Fetch details (ignore errors individually; empty arrays if fails)
    const [citiesRes, communitiesRes] = await Promise.all([
      cityIds.length
        ? supabase.from("cities").select("*").in("id", cityIds)
        : Promise.resolve({ data: [], error: null }),
      communityIds.length
        ? supabase.from("communities").select("*").in("id", communityIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const citiesById: Record<string, any> = {};
    (citiesRes.data || []).forEach((c: any) => (citiesById[c.id] = c));
    const communitiesById: Record<string, any> = {};
    (communitiesRes.data || []).forEach(
      (c: any) => (communitiesById[c.id] = c)
    );

    const enriched = users.map((u: any) => ({
      ...u,
      cities_details: (u.cities || [])
        .map((id: string) => citiesById[id])
        .filter(Boolean),
      communities_details: (u.communities || [])
        .map((id: string) => communitiesById[id])
        .filter(Boolean),
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users -> create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || randomUUID();
    const insertPayload = {
      id,
      email: body.email,
      contact_number: body.contact_number || null,
      permissions: body.permissions || {},
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      cities: Array.isArray(body.cities)
        ? body.cities.map((c: any) => c.id || c)
        : [],
      communities: Array.isArray(body.communities) ? body.communities : [],
    };

    const { data, error } = await supabase
      .from("users")
      .insert(insertPayload)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
