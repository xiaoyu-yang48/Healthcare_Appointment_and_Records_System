// scripts/restore-db.js
// 从 JSON 文件恢复所有集合

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const models = {
  Appointment: require('../models/Appointment'),
  DoctorSchedule: require('../models/DoctorSchedule'),
  MedicalRecord: require('../models/MedicalRecord'),
  Message: require('../models/Message'),
  Task: require('../models/Task'),
  User: require('../models/User'),
};

const BACKUP_DIR = process.argv[2] || path.join(__dirname, '../db-backup');

async function restore() {
  await connectDB();
  for (const [name, Model] of Object.entries(models)) {
    const file = path.join(BACKUP_DIR, `${name}.json`);
    if (!fs.existsSync(file)) {
      console.warn(`⚠️ ${file} not found, skip.`);
      continue;
    }
    const docs = JSON.parse(fs.readFileSync(file, 'utf-8'));
    await Model.deleteMany({});
    if (docs.length > 0) await Model.insertMany(docs);
    console.log(`✅ ${name} restored: ${docs.length} documents`);
  }
  mongoose.connection.close();
  console.log('✅ All collections restored from', BACKUP_DIR);
}

restore();
