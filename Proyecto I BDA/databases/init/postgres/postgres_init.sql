CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: web_pages_postgreSQL
CREATE TABLE IF NOT EXISTS page_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(64) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    content TEXT,
    crawled_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_web_pages_postgresql_crawled_at ON page_index(crawled_at);