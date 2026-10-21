USE my_resume;
-- Disable FK checks
SET FOREIGN_KEY_CHECKS = 0;

-- Optional: clear tables before seeding
TRUNCATE TABLE contacts;
TRUNCATE TABLE users;
TRUNCATE TABLE settings;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- USERS (100)
-- =========================
DELIMITER $$

CREATE PROCEDURE seed_users()
BEGIN
  DECLARE i INT DEFAULT 1;

  -- Admin
  INSERT INTO users (name, email, password, role, email_verified, is_new)
  VALUES ('Admin User', 'admin@ibctankstore.com', '$2b$10$hashedpasswordexample', 'admin', 1, 0);

  WHILE i <= 99 DO
    INSERT INTO users (name, email, password, role, email_verified, is_new)
    VALUES (
      CONCAT('User ', i),
      CONCAT('user', i, '@example.com'),
      '$2b$10$hashedpasswordexample',
      'customer',
      1,
      0
    );
    SET i = i + 1;
  END WHILE;
END$$

DELIMITER ;

CALL seed_users();
DROP PROCEDURE seed_users;

-- =========================
-- CONTACTS (100)
-- =========================
DELIMITER $$

CREATE PROCEDURE seed_contacts()
BEGIN
  DECLARE i INT DEFAULT 1;

  WHILE i <= 100 DO
    INSERT INTO contacts (name, email, contact_no, message, status)
    VALUES (
      CONCAT('Customer ', i),
      CONCAT('customer', i, '@mail.com'),
      CONCAT('03', FLOOR(100000000 + RAND()*899999999)),
      CONCAT('Inquiry message number ', i),
      IF(RAND() > 0.5, 'new', 'read')
    );

    SET i = i + 1;
  END WHILE;
END$$

DELIMITER ;

CALL seed_contacts();
DROP PROCEDURE seed_contacts;

-- =========================
-- SETTINGS
-- =========================
INSERT INTO settings (`key`, `value`) VALUES
('notify_contact_submission', '1'),
('notification_method', 'email'),
('notification_endpoint', ''),
('contact_number', '03001234567'),
('price_currency', 'Rs. '),
('tinymce_api_key', '')
ON DUPLICATE KEY UPDATE value = VALUES(value);