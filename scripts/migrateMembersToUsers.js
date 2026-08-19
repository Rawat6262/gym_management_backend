// One-time migration: the old "members" collection becomes users with role "user".
// - Backs up users/members/payments/attendances to ./backup_<timestamp>/ first
// - Members whose email already has a user account get their membership fields merged in
// - Payments and attendance records are re-pointed from the old member id to the user id
// - The old members collection is left untouched (safe to re-run)
//
// Run:  node scripts/migrateMembersToUsers.js

require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/user");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // ── Backup ──
    const backupDir = path.join(__dirname, "..", `backup_${Date.now()}`);
    fs.mkdirSync(backupDir);

    for (const [name, model] of [
      ["users", User],
      ["members", Member],
      ["payments", Payment],
      ["attendances", Attendance]
    ]) {
      const docs = await model.find().lean();
      fs.writeFileSync(
        path.join(backupDir, `${name}.json`),
        JSON.stringify(docs, null, 2)
      );
      console.log(`Backed up ${docs.length} ${name} -> ${backupDir}`);
    }

    // ── Migrate ──
    const members = await Member.find().lean();

    let created = 0;
    let merged = 0;
    let paymentsRemapped = 0;
    let attendanceRemapped = 0;

    for (const m of members) {

      const membershipFields = {
        phone: m.phone != null ? String(m.phone) : undefined,
        age: m.age,
        gender: m.gender,
        address: m.address,
        joinDate: m.joinDate,
        membershipEndDate: m.membershipEndDate,
        plan: m.plan || null,
        photo: m.photo,
        pending_amount: m.pending_amount || 0
      };

      let user = await User.findOne({ email: m.email });

      if (user) {
        // Same email already signed up — merge membership data into that account
        Object.assign(user, membershipFields);
        if (!user.name) user.name = m.name;
        await user.save();
        merged++;
      } else {
        // Placeholder password; the member claims the account via signup + OTP
        const hashed = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
        user = await User.create({
          name: m.name,
          email: m.email,
          password: hashed,
          role: "user",
          isVerified: false,
          ...membershipFields
        });
        created++;
      }

      const p = await Payment.updateMany({ member: m._id }, { member: user._id });
      paymentsRemapped += p.modifiedCount;

      const a = await Attendance.updateMany({ member: m._id }, { member: user._id });
      attendanceRemapped += a.modifiedCount;
    }

    console.log("──────────────────────────────────");
    console.log(`Members processed:    ${members.length}`);
    console.log(`New users created:    ${created}`);
    console.log(`Merged into existing: ${merged}`);
    console.log(`Payments remapped:    ${paymentsRemapped}`);
    console.log(`Attendance remapped:  ${attendanceRemapped}`);
    console.log("Done. Old members collection was NOT deleted.");

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
