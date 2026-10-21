// models/User.js
const db = require('../config/db');
class User {
  static async getById(id) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  static async findByEmail(email) {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  }

  static async findByGoogleIdOrEmail(googleId, email) {
    const [users] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
    return users;
  }

  static async create(profile) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [
        profile.name,
        profile.email,
        profile.password
      ]
    );
    return { id: result.insertId, ...profile };
  }

  static async createGoogleUser(profile) {
    const [result] = await db.query(
      'INSERT INTO users (google_id, name, email, profile_photo, email_verified) VALUES (?, ?, ?, ?, ?)',
      [
        profile.id,
        profile.displayName,
        profile.emails[0].value,
        profile.photos[0].value,
        true
      ]
    );
    return { id: result.insertId, ...profile };
  }

  static async updateUserGoogleData(profile, userId) {
    await db.query(
      'UPDATE users SET google_id = ?, profile_photo = ?, email_verified = TRUE WHERE id = ?',
      [profile.id, profile.photos[0].value, userId]
    );
  }

  static async getAll(role=null) {
    if (role) {
      const [rows] = await db.execute('SELECT * FROM users WHERE role = ?', [role]);
      return rows;
    }
    const [rows] = await db.execute('SELECT * FROM users ORDER BY id ASC');
    return rows;
  }

  static async count(role='customer') {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM users WHERE role = ?', [role]);
    return rows[0].count;
  }

  static async delete(id) {
    const result = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result;
  }

  static async updateUser(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.profile_photo !== undefined) {
      fields.push('profile_photo = ?');
      values.push(updates.profile_photo);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

}

module.exports = User;