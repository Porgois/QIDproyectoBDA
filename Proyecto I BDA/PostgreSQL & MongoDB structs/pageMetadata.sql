CREATE TABLE PageMetadata (
    page_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    first_headers TEXT[], -- <h1> headers
    datetimes TEXT[], -- <time> elements
    created_at TIMESTAMP DEFAULT NOW()
);