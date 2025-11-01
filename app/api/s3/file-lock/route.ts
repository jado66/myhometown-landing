import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST - Lock a file (set status to 'locked')
export async function POST(request: NextRequest) {
  try {
    const { fileKey } = await request.json();

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert or update the file status to 'locked'
    const { data, error } = await supabase
      .from("file_statuses")
      .upsert(
        {
          file_key: fileKey,
          status: "locked",
        },
        {
          onConflict: "file_key",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error locking file:", error);
      return NextResponse.json(
        { error: "Failed to lock file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in lock file API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Unlock a file (remove from table)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete the file status (unlock)
    const { error } = await supabase
      .from("file_statuses")
      .delete()
      .eq("file_key", fileKey);

    if (error) {
      console.error("Error unlocking file:", error);
      return NextResponse.json(
        { error: "Failed to unlock file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in unlock file API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update file status (hide or unhide)
export async function PATCH(request: NextRequest) {
  try {
    const { fileKey, status } = await request.json();

    if (!fileKey || !status) {
      return NextResponse.json(
        { error: "File key and status are required" },
        { status: 400 }
      );
    }

    if (!["locked", "hidden"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'locked' or 'hidden'" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the file status
    const { data, error } = await supabase
      .from("file_statuses")
      .update({ status })
      .eq("file_key", fileKey)
      .select()
      .single();

    if (error) {
      console.error("Error updating file status:", error);
      return NextResponse.json(
        { error: "Failed to update file status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in update file status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get all files with status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all files with status
    const { data, error } = await supabase.from("file_statuses").select("*");

    if (error) {
      console.error("Error fetching file statuses:", error);
      return NextResponse.json(
        { error: "Failed to fetch file statuses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ files: data || [] });
  } catch (error) {
    console.error("Error in get file statuses API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
