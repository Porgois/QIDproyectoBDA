db.createCollection("page_content", {
    validator: {
        $jsonSchema: {
        bsonType: "object",
        required: ["paragraphs", "list-items", "image"],
        properties: {
                paragraphs: {
                    bsonType: "array",
                    items: { bsonType: "string" }
                },
                list_items: {
                    bsonType: "array",
                    items: { bsonType: "string" }
                },
                image: {
                    bsonType: "array",
                    items: { bsonType: "string" }
                },
                crawled_at: {
                    bsonType: "date",
                    description: "Timestamp when page was crawled - required"
                }
            }
        }
    }
});