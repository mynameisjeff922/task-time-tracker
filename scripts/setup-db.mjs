// Sets up the database: creates the tables, then fills empty tables with starting data.
// Run with: npm run db:setup   (reads DATABASE_URL and DEMO_USER_* from .env.local)
// Safe to run again: it never changes tables that already have data.
import { existsSync, readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import postgres from "postgres";

// The remaining PITC Developer Training items (Section 6: ROMTech Policies), in order.
const STARTER_NOTES = "PITC Section 6: ROMTech Policies. Re-study in full, even if seen before.";
const STARTER_TASKS = [
  "Read policy: IT Department",
  "Read policy: DevOps and the IT Department",
  "Read policy: Agile",
  "Watch video: Agile Presentation",
  "Read policy: New Solutions Project Checklist",
  "Watch video: New Solutions Reporting App",
  "Read policy: Solutions Requirements Gathering Checklist",
  "Read policy: Project One-Sheets",
  "Read policy: Project Completion Checklist",
  "Watch video: The “Art” of Being a Product Owner",
  "Read policy: Software Releases, Versions and Sprints",
  "Watch video: How to Release Good Software",
  "Watch video: Software Releases, Versions and Sprints",
];

// Data from the earlier version of the app, which saved everything to this file.
const OLD_DATA_FILE = new URL("../data/db.json", import.meta.url);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add your Supabase connection string to .env.local first.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });

try {
  // 1. Tables
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(schema).simple(); // .simple() allows several statements in one go
  console.log("✓ Tables are ready");

  const oldData = existsSync(OLD_DATA_FILE) ? JSON.parse(readFileSync(OLD_DATA_FILE, "utf8")) : null;
  const [{ tasks: taskCount }] = await sql`select count(*)::int as tasks from tasks`;
  const [{ users: userCount }] = await sql`select count(*)::int as users from users`;

  // 2. Tasks and time entries
  if (taskCount > 0) {
    console.log(`• Tasks table already has ${taskCount} tasks, leaving it as is`);
  } else if (oldData?.tasks?.length) {
    await sql.begin(async (tx) => {
      for (const t of oldData.tasks) {
        await tx`insert into tasks (id, title, notes, category, status, created_at)
                 values (${t.id}, ${t.title}, ${t.notes}, ${t.category}, ${t.status}, ${t.createdAt})`;
      }
      for (const e of oldData.entries ?? []) {
        await tx`insert into time_entries (id, task_id, start_at, end_at, note)
                 values (${e.id}, ${e.taskId}, ${e.start}, ${e.end}, ${e.note ?? ""})`;
      }
    });
    console.log(`✓ Copied ${oldData.tasks.length} tasks and ${oldData.entries?.length ?? 0} time entries from data/db.json`);
  } else {
    const now = Date.now();
    await sql.begin(async (tx) => {
      // The list shows newest first, so the first item gets the latest timestamp to stay on top.
      for (const [i, title] of STARTER_TASKS.entries()) {
        await tx`insert into tasks (title, notes, category, created_at)
                 values (${title}, ${STARTER_NOTES}, 'training', ${new Date(now - i * 1000)})`;
      }
    });
    console.log(`✓ Added ${STARTER_TASKS.length} starter tasks`);
  }

  // 3. Login account
  if (userCount > 0) {
    console.log(`• Users table already has ${userCount} account(s), leaving it as is`);
  } else if (oldData?.users?.length) {
    for (const u of oldData.users) {
      await sql`insert into users (id, name, email, password_hash) values (${u.id}, ${u.name}, ${u.email}, ${u.passwordHash})`;
    }
    console.log(`✓ Copied login account ${oldData.users.map((u) => u.email).join(", ")} from data/db.json`);
  } else {
    const { DEMO_USER_NAME, DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = process.env;
    if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
      console.warn("! No account created: set DEMO_USER_EMAIL and DEMO_USER_PASSWORD in .env.local and run this again.");
    } else {
      const email = DEMO_USER_EMAIL.trim().toLowerCase();
      const hash = await bcrypt.hash(DEMO_USER_PASSWORD, 10); // only the hash is stored
      await sql`insert into users (name, email, password_hash) values (${DEMO_USER_NAME || "Demo user"}, ${email}, ${hash})`;
      console.log(`✓ Created login account ${email}`);
    }
  }

  if (oldData) console.log("\nYour old data is now in the database. You can delete the data/ folder.");
  console.log("\nDone. Start the app with: npm run dev");
} catch (error) {
  console.error("\nSetup failed:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
