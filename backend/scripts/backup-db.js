// scripts/backup-db.js
// 备份所有集合到 JSON 文件

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

async function backup() {
  await connectDB();
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  for (const [name, Model] of Object.entries(models)) {
    const docs = await Model.find().lean();
    fs.writeFileSync(path.join(BACKUP_DIR, `${name}.json`), JSON.stringify(docs, null, 2), 'utf-8');
    console.log(`✅ ${name} backed up: ${docs.length} documents`);
  }
  mongoose.connection.close();
  console.log('✅ All collections backed up to', BACKUP_DIR);
}

backup();
