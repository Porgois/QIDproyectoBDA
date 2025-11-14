CREATE TABLE IF NOT EXISTS page_metadata (
    id BINARY(16) PRIMARY KEY,
    url VARCHAR(64) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    crawled_at DATETIME NOT NULL,
    INDEX idx_crawled_at (crawled_at)
);