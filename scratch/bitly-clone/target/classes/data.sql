-- Seed User (Password is 'Password@123')
INSERT INTO users (id, name, email, password, role)
VALUES (1, 'Jane Doe', 'jane@gmail.com', '$2a$10$vD0F2Wc27Jt8D/4lG4WjOe9V1lT1vEaF33pG0147vVj2kH3bM3m8K', 'USER')
ON DUPLICATE KEY UPDATE id=id;

-- Seed URLs
INSERT INTO urls (id, long_url, short_code, custom_alias, title, created_at, is_active, click_count, user_id)
VALUES (1, 'https://www.google.com', '1', NULL, 'Google Search', NOW(), TRUE, 12, 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO urls (id, long_url, short_code, custom_alias, title, created_at, is_active, click_count, user_id)
VALUES (2, 'https://github.com', 'my-github', 'my-github', 'GitHub Profile', NOW(), TRUE, 8, 1)
ON DUPLICATE KEY UPDATE id=id;

-- Seed Click Analytics
INSERT INTO clicks (url_id, browser, operating_system, device, ip_address, country, city, referer, clicked_at)
VALUES (1, 'Chrome', 'Windows', 'Desktop', '127.0.0.1', 'Local Loopback', 'Localhost', 'Direct', NOW()),
       (1, 'Firefox', 'macOS', 'Desktop', '127.0.0.1', 'Local Loopback', 'Localhost', 'Direct', NOW()),
       (1, 'Safari', 'iOS', 'Mobile', '127.0.0.1', 'Local Loopback', 'Localhost', 'Direct', NOW()),
       (2, 'Chrome', 'Android', 'Mobile', '127.0.0.1', 'Local Loopback', 'Localhost', 'Direct', NOW());
