#!/usr/bin/env node

/**
 * CSV Import Utility for Classes
 * Helps import classes from a CSV file into the Supabase database
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Parse CSV content into array of objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;

    const values = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/"/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ""));

    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Map CSV row to database class format
 */
function mapCSVRowToClass(row, communityMap, categoryMap) {
  // Helper function to parse meeting days
  const parseMeetingDays = (daysString) => {
    if (!daysString) return [];
    const dayMap = {
      mon: "Monday",
      monday: "Monday",
      tue: "Tuesday",
      tuesday: "Tuesday",
      wed: "Wednesday",
      wednesday: "Wednesday",
      thu: "Thursday",
      thursday: "Thursday",
      fri: "Friday",
      friday: "Friday",
      sat: "Saturday",
      saturday: "Saturday",
      sun: "Sunday",
      sunday: "Sunday",
    };

    return daysString
      .toLowerCase()
      .split(/[,&\s]+/)
      .map((day) => dayMap[day.trim()])
      .filter(Boolean);
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return null;
    // Convert common time formats to HH:MM
    const time = timeString.replace(/\s*(AM|PM|am|pm)\s*/g, "");
    if (time.includes(":")) {
      return time;
    }
    return `${time}:00`;
  };

  return {
    mongo_id:
      row.mongo_id ||
      row.id ||
      `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: row.title || row.name || row.class_name,
    description: row.description || row.summary || "",
    start_date: row.start_date || row.startDate,
    end_date: row.end_date || row.endDate,
    location: row.location || row.room || "TBD",
    capacity: parseInt(row.capacity || row.max_participants || "20"),
    show_capacity: row.show_capacity !== "false",
    icon: row.icon || null,
    class_banner_url: row.class_banner_url || row.banner || null,
    start_time: formatTime(row.start_time || row.startTime),
    end_time: formatTime(row.end_time || row.endTime),
    meeting_days: parseMeetingDays(
      row.meeting_days || row.days || row.schedule
    ),
    is_waitlist_enabled:
      row.waitlist_enabled === "true" || row.waitlist === "yes",
    waitlist_capacity: parseInt(row.waitlist_capacity || "0"),
    visibility: row.visibility !== "false",
    community_id: communityMap[row.community_name || row.community] || null,
    category_id: categoryMap[row.category_name || row.category] || null,
  };
}

/**
 * Import classes from CSV file
 */
async function importFromCSV(csvFilePath) {
  try {
    console.log(`📂 Reading CSV file: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
      console.error("❌ CSV file not found:", csvFilePath);
      return;
    }

    const csvContent = fs.readFileSync(csvFilePath, "utf-8");
    const rows = parseCSV(csvContent);

    console.log(`📊 Found ${rows.length} rows in CSV`);

    // Load existing communities and categories
    console.log("🔍 Loading existing communities and categories...");

    const [{ data: communities }, { data: categories }] = await Promise.all([
      supabase.from("communities").select("id, name"),
      supabase.from("categories").select("id, name"),
    ]);

    const communityMap = {};
    const categoryMap = {};

    communities?.forEach((community) => {
      communityMap[community.name] = community.id;
    });

    categories?.forEach((category) => {
      categoryMap[category.name] = category.id;
    });

    console.log(
      `✅ Found ${Object.keys(communityMap).length} communities and ${
        Object.keys(categoryMap).length
      } categories`
    );

    // Transform CSV rows to database format
    const classesToInsert = rows
      .map((row) => mapCSVRowToClass(row, communityMap, categoryMap))
      .filter((classData) => {
        // Validate required fields
        if (!classData.title || !classData.start_date || !classData.end_date) {
          console.warn(
            `⚠️  Skipping row with missing required fields: ${
              classData.title || "Untitled"
            }`
          );
          return false;
        }
        return true;
      });

    console.log(`📝 Prepared ${classesToInsert.length} classes for import`);

    if (classesToInsert.length === 0) {
      console.log("❌ No valid classes to import");
      return;
    }

    // Insert classes in batches
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < classesToInsert.length; i += BATCH_SIZE) {
      const batch = classesToInsert.slice(i, i + BATCH_SIZE);

      console.log(
        `📤 Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          classesToInsert.length / BATCH_SIZE
        )}...`
      );

      const { data, error } = await supabase
        .from("classes")
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch:`, error.message);
        continue;
      }

      totalInserted += data.length;
      console.log(`✅ Inserted ${data.length} classes`);
    }

    console.log(
      `\n🎉 Import complete! Successfully imported ${totalInserted} out of ${classesToInsert.length} classes`
    );
  } catch (error) {
    console.error("❌ Import failed:", error.message);
  }
}

/**
 * Generate sample CSV template
 */
function generateSampleCSV() {
  const sampleCSV = `title,description,start_date,end_date,location,capacity,start_time,end_time,meeting_days,community_name,category_name
"ESL - Basic English","Learn basic English conversation skills","2024-12-01","2025-02-28","Room 101",20,"18:00","19:30","Monday,Wednesday","Salt Lake City","ESL"
"Computer Basics","Learn essential computer skills","2024-12-02","2025-02-28","Computer Lab",15,"10:00","12:00","Tuesday,Thursday","Salt Lake City","Technology"
"Citizenship Test Prep","Prepare for the U.S. citizenship exam","2024-12-01","2025-01-31","Main Hall",25,"14:00","16:00","Saturday","Ogden","Citizenship"`;

  const outputPath = path.join(__dirname, "sample-classes.csv");
  fs.writeFileSync(outputPath, sampleCSV);
  console.log(`📄 Sample CSV created: ${outputPath}`);
  console.log("\nExpected CSV columns:");
  console.log("- title (required)");
  console.log("- description");
  console.log("- start_date (YYYY-MM-DD, required)");
  console.log("- end_date (YYYY-MM-DD, required)");
  console.log("- location");
  console.log("- capacity (number)");
  console.log("- start_time (HH:MM)");
  console.log("- end_time (HH:MM)");
  console.log("- meeting_days (comma-separated: Monday,Wednesday)");
  console.log("- community_name (must match existing community)");
  console.log("- category_name (must match existing category)");
}

// Command line interface
const command = process.argv[2];
const csvPath = process.argv[3];

async function main() {
  switch (command) {
    case "import":
      if (!csvPath) {
        console.error("❌ Please provide a CSV file path");
        console.log(
          "Usage: node scripts/import-csv.js import path/to/your/file.csv"
        );
        process.exit(1);
      }
      await importFromCSV(csvPath);
      break;

    case "sample":
      generateSampleCSV();
      break;

    default:
      console.log("📚 CSV Import Utility for MyHometown Classes");
      console.log("");
      console.log("Commands:");
      console.log("  import <csv_file>  - Import classes from CSV file");
      console.log("  sample            - Generate a sample CSV template");
      console.log("");
      console.log("Examples:");
      console.log("  node scripts/import-csv.js sample");
      console.log("  node scripts/import-csv.js import classes.csv");
  }
}

main();
