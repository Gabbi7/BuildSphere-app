const { Expo } = require('expo-server-sdk');
const pool = require('../db');

const expo = new Expo();

let notificationSchemaReady = false;

async function resolveUserIdSqlType() {
  const { rows } = await pool.query(
    `SELECT data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
     LIMIT 1`
  );

  const dataType = rows[0]?.data_type;
  if (!dataType) return 'INTEGER';
  if (dataType === 'uuid') return 'UUID';
  if (dataType === 'bigint') return 'BIGINT';
  if (dataType === 'smallint') return 'SMALLINT';
  return 'INTEGER';
}

async function ensureNotificationTables() {
  if (notificationSchemaReady) return;

  const userIdType = await resolveUserIdSqlType();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_push_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id ${userIdType} NOT NULL,
      expo_push_token TEXT NOT NULL,
      device_type TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, expo_push_token)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id ${userIdType} NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT,
      data JSONB,
      is_read BOOLEAN DEFAULT FALSE,
      date TEXT,
      time TEXT,
      reference_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  notificationSchemaReady = true;
}

/**
 * Build a reference_url from notification data for mobile deep-linking.
 */
function buildReferenceUrl(data) {
  if (!data) return null;
  if (data.task_id) return `/tasks/${data.task_id}`;
  if (data.project_id && data.screen === 'Inventory') return `/inventory/${data.project_id}`;
  if (data.project_id) return `/projects/${data.project_id}`;
  return null;
}

/**
 * Format date/time strings in Manila timezone for legacy mobile UI support.
 */
function formatLegacyTimestamps() {
  const now = new Date();
  // Format in Asia/Manila timezone
  const manilaDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // YYYY-MM-DD
  const manilaTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }); // HH:mm AM/PM
  return { date: manilaDate, time: manilaTime };
}

async function saveNotificationHistory(userId, title, body, type, data) {
  try {
    const referenceUrl = buildReferenceUrl(data);
    const { date, time } = formatLegacyTimestamps();

    // Matching actual schema: user_id, title, message, type, is_read, date, time, reference_url, created_at
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, date, time, reference_url, created_at)
       VALUES ($1, $2, $3, $4, false, $5, $6, $7, NOW())`,
      [userId, title, body, type || null, date, time, referenceUrl]
    );
  } catch (err) {
    console.error('Failed to save notification history:', err.message);
  }
}

async function deactivateInvalidTokens(invalidTokens) {
  if (!invalidTokens.length) return;
  await pool.query(
    `UPDATE user_push_tokens
     SET is_active = false, updated_at = NOW()
     WHERE expo_push_token = ANY($1::text[])`,
    [invalidTokens]
  );
}

async function sendPushNotificationToUser(userId, title, body, data = {}) {
  try {
    await ensureNotificationTables();

    const tokenResult = await pool.query(
      `SELECT expo_push_token
       FROM user_push_tokens
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    const validMessages = [];
    const invalidTokens = [];

    for (const row of tokenResult.rows) {
      const token = row.expo_push_token;
      if (!Expo.isExpoPushToken(token)) {
        invalidTokens.push(token);
        continue;
      }
      validMessages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    if (invalidTokens.length) {
      await deactivateInvalidTokens(invalidTokens);
    }

    const chunks = expo.chunkPushNotifications(validMessages);
    const newInvalidTokens = [];

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, idx) => {
          if (
            ticket.status === 'error' &&
            (ticket.details?.error === 'DeviceNotRegistered' || ticket.details?.error === 'InvalidCredentials')
          ) {
            const badToken = chunk[idx]?.to;
            if (badToken) newInvalidTokens.push(badToken);
          }
        });
      } catch (err) {
        console.error('Push send error during chunk processing:', err.message || err);
      }
    }

    if (newInvalidTokens.length) {
      await deactivateInvalidTokens(newInvalidTokens);
    }

    await saveNotificationHistory(userId, title, body, data.type, data);

    return {
      sent: validMessages.length,
      invalid: invalidTokens.length + newInvalidTokens.length,
    };
  } catch (err) {
    console.error('FATAL ERROR in sendPushNotificationToUser:', err);
    throw err;
  }
}

module.exports = {
  ensureNotificationTables,
  sendPushNotificationToUser,
};
