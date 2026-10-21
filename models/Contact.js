// models/Contact.js
const db = require('../config/db');

class Contact {

  static async create(contact) {
    const [result] = await db.query(
      'INSERT INTO contacts (name, email, contact_no, message) VALUES (?, ?, ?, ?)',
      [
        contact.name,
        contact.email,
        contact.contact_no || null,
        contact.message
      ]
    );
    return { id: result.insertId, status: 'new', ...contact };
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM contacts WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return rows;
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
  }

  static async countByStatus(status) {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM contacts WHERE status = ?', [status]);
    return rows[0].count;
  }

  static async count() {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM contacts');
    return rows[0].count;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    return result;
  }

}

module.exports = Contact;
