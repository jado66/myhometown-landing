#!/usr/bin/env node

/**
 * MongoDB to Supabase Migration Script (Node.js)
 * Migrates class data from MongoDB to Supabase with proper relational structure
 */

import { MongoClient } from "mongodb";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DATABASE = process.env.MONGODB_DB || "MyHometown"; // Default to MyHometown database
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Classes"; // Default to Classes collection

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

class MongoToSupabaseMigration {
  constructor() {
    // Initialize MongoDB client
    this.mongoClient = new MongoClient(MONGODB_URI);

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment"
      );
    }
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Mapping objects to track ID conversions
    this.communityMap = {};
    this.categoryMap = {};
    this.classMap = {};
    this.studentMap = {};
  }

  async connect() {
    console.log("Connecting to MongoDB...");
    await this.mongoClient.connect();
    this.db = this.mongoClient.db(MONGODB_DATABASE);
    this.collection = this.db.collection(MONGODB_COLLECTION);
    console.log("✓ Connected to MongoDB\n");
  }

  async loadExistingCommunities() {
    console.log("Loading existing communities from Supabase...");
    try {
      const { data, error } = await this.supabase
        .from("communities")
        .select("id, mongo_id");

      if (error) throw error;

      // Build the mapping
      for (const community of data) {
        if (community.mongo_id) {
          this.communityMap[community.mongo_id] = community.id;
        }
      }

      console.log(
        `  ✓ Loaded ${
          Object.keys(this.communityMap).length
        } existing communities\n`
      );
    } catch (error) {
      console.log(`  ⚠ Warning: Could not load communities: ${error.message}`);
      console.log(
        `  Note: If your communities table doesn't have a 'mongo_id' column,`
      );
      console.log(
        `        you'll need to manually map MongoDB community IDs to Supabase UUIDs\n`
      );
    }
  }

  async migrateCommunities(classDocs) {
    console.log("Checking for new communities...");
    const uniqueCommunities = new Set();

    for (const doc of classDocs) {
      if (doc.communityId) {
        uniqueCommunities.add(doc.communityId);
      }
    }

    const newCommunities = [...uniqueCommunities].filter(
      (id) => !this.communityMap[id]
    );

    if (newCommunities.length === 0) {
      console.log("  ✓ All communities already exist\n");
      return;
    }

    console.log(`  Found ${newCommunities.length} new communities to create`);

    for (const mongoId of newCommunities) {
      try {
        const { data, error } = await this.supabase
          .from("communities")
          .insert({ mongo_id: mongoId })
          .select()
          .single();

        if (error) throw error;

        this.communityMap[mongoId] = data.id;
        console.log(`  ✓ Created community ${mongoId}`);
      } catch (error) {
        console.log(
          `  ✗ Error creating community ${mongoId}: ${error.message}`
        );
        console.log(`     You may need to manually create this community`);
      }
    }
    console.log();
  }

  async migrateCategories(classDocs) {
    console.log("Migrating categories...");
    const uniqueCategories = new Set();

    for (const doc of classDocs) {
      if (doc.categoryId) {
        uniqueCategories.add(doc.categoryId);
      }
    }

    for (const mongoId of uniqueCategories) {
      try {
        const { data, error } = await this.supabase
          .from("categories")
          .insert({ mongo_id: mongoId })
          .select()
          .single();

        if (error) throw error;

        this.categoryMap[mongoId] = data.id;
        console.log(`  ✓ Migrated category ${mongoId}`);
      } catch (error) {
        console.log(
          `  ✗ Error migrating category ${mongoId}: ${error.message}`
        );
      }
    }
    console.log();
  }

  async migrateClass(doc) {
    try {
      const classData = {
        mongo_id: doc.id,
        title: doc.title,
        description: doc.description || "",
        start_date: doc.startDate,
        end_date: doc.endDate,
        location: doc.location || "",
        capacity: parseInt(doc.capacity) || 0,
        show_capacity: doc.showCapacity !== undefined ? doc.showCapacity : true,
        icon: doc.icon || "",
        class_banner_url: doc.classBannerUrl || "",
        start_time: doc.startTime || "00:00",
        end_time: doc.endTime || "00:00",
        meeting_days: doc.meetingDays || [],
        is_waitlist_enabled: doc.isWaitlistEnabled || false,
        waitlist_capacity: parseInt(doc.waitlistCapacity) || 0,
        visibility: doc.visibility !== undefined ? doc.visibility : true,
      };

      // Add foreign keys if they exist
      if (doc.communityId && this.communityMap[doc.communityId]) {
        classData.community_id = this.communityMap[doc.communityId];
      }

      if (doc.categoryId && this.categoryMap[doc.categoryId]) {
        classData.category_id = this.categoryMap[doc.categoryId];
      }

      // Insert class
      const { data, error } = await this.supabase
        .from("classes")
        .insert(classData)
        .select()
        .single();

      if (error) throw error;

      this.classMap[doc.id] = data.id;
      console.log(`  ✓ Migrated class: ${doc.title}`);
      return data.id;
    } catch (error) {
      console.log(
        `  ✗ Error migrating class ${doc.title || "Unknown"}: ${error.message}`
      );
      return null;
    }
  }

  async migrateClassMeetings(doc, classId) {
    if (!doc.meetings || doc.meetings.length === 0) return;

    try {
      const meetingsData = doc.meetings.map((meeting) => ({
        class_id: classId,
        mongo_meeting_id: meeting.id?.toString() || "",
        day: meeting.day,
        start_time: meeting.startTime,
        end_time: meeting.endTime,
      }));

      const { error } = await this.supabase
        .from("class_meetings")
        .insert(meetingsData);

      if (error) throw error;

      console.log(`    ✓ Migrated ${meetingsData.length} meeting schedules`);
    } catch (error) {
      console.log(`    ✗ Error migrating meetings: ${error.message}`);
    }
  }

  async migrateSignupForm(doc, classId) {
    if (!doc.signupForm) return;

    try {
      const formData = {
        class_id: classId,
        form_config: doc.signupForm.formConfig || {},
        field_order: doc.signupForm.fieldOrder || [],
      };

      const { error } = await this.supabase
        .from("signup_form_configs")
        .insert(formData);

      if (error) throw error;

      console.log(`    ✓ Migrated signup form configuration`);
    } catch (error) {
      console.log(`    ✗ Error migrating signup form: ${error.message}`);
    }
  }

  async migrateStudents(doc, classId) {
    if (!doc.signups || doc.signups.length === 0) return;

    try {
      const studentsData = doc.signups.map((signup) => ({
        mongo_id: signup.id,
        class_id: classId,
        first_name: signup.firstName,
        last_name: signup.lastName,
        guardian_first_name: signup.guardianFirstName || null,
        guardian_last_name: signup.guardianLastName || null,
        email: signup.email || null,
        phone: signup.phone || null,
        communication_consent: signup.communicationConsent || false,
        photo_release: signup.photoRelease || false,
        terms_accepted: signup.termsAndConditions || false,
      }));

      const { data, error } = await this.supabase
        .from("students")
        .insert(studentsData)
        .select();

      if (error) throw error;

      // Map student IDs
      data.forEach((student, i) => {
        this.studentMap[studentsData[i].mongo_id] = student.id;
      });

      console.log(`    ✓ Migrated ${studentsData.length} students`);
    } catch (error) {
      console.log(`    ✗ Error migrating students: ${error.message}`);
    }
  }

  async migrateAttendance(doc, classId) {
    if (!doc.attendance || doc.attendance.length === 0) return;

    try {
      const attendanceData = [];

      for (const record of doc.attendance) {
        const studentMongoId = record.studentId;

        // Skip if student wasn't migrated
        if (!this.studentMap[studentMongoId]) continue;

        attendanceData.push({
          student_id: this.studentMap[studentMongoId],
          class_id: classId,
          date: record.date,
          present: record.present,
        });
      }

      if (attendanceData.length === 0) return;

      // Insert in batches to avoid payload limits
      const batchSize = 100;
      for (let i = 0; i < attendanceData.length; i += batchSize) {
        const batch = attendanceData.slice(i, i + batchSize);
        const { error } = await this.supabase.from("attendance").insert(batch);

        if (error) throw error;
      }

      console.log(`    ✓ Migrated ${attendanceData.length} attendance records`);
    } catch (error) {
      console.log(`    ✗ Error migrating attendance: ${error.message}`);
    }
  }

  async migrateAll() {
    console.log("=".repeat(60));
    console.log("Starting MongoDB to Supabase Migration");
    console.log("=".repeat(60));
    console.log();

    // Connect to MongoDB
    await this.connect();

    // Fetch all class documents from MongoDB
    console.log("Fetching documents from MongoDB...");
    const classDocs = await this.collection.find({}).toArray();
    console.log(`Found ${classDocs.length} class documents\n`);

    // Step 1: Load existing communities and check if we need to create new ones
    await this.loadExistingCommunities();
    await this.migrateCommunities(classDocs);

    // Step 2: Migrate categories
    await this.migrateCategories(classDocs);

    // Step 3: Migrate classes and related data
    console.log("Migrating classes and related data...");
    for (let i = 0; i < classDocs.length; i++) {
      const doc = classDocs[i];
      console.log(
        `\n[${i + 1}/${classDocs.length}] Processing: ${doc.title || "Unknown"}`
      );

      // Migrate the class
      const classId = await this.migrateClass(doc);
      if (!classId) continue;

      // Migrate related data
      await this.migrateClassMeetings(doc, classId);
      await this.migrateSignupForm(doc, classId);
      await this.migrateStudents(doc, classId);
      await this.migrateAttendance(doc, classId);
    }

    console.log("\n" + "=".repeat(60));
    console.log("Migration Complete!");
    console.log("=".repeat(60));
    console.log(`Classes migrated: ${Object.keys(this.classMap).length}`);
    console.log(`Students migrated: ${Object.keys(this.studentMap).length}`);
    console.log("=".repeat(60));
  }

  async cleanup() {
    await this.mongoClient.close();
    console.log("\n✓ Database connections closed");
  }
}

// Main execution
async function main() {
  try {
    const migrator = new MongoToSupabaseMigration();
    await migrator.migrateAll();
    await migrator.cleanup();
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
