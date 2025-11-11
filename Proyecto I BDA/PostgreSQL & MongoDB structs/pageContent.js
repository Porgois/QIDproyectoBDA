
// Crea la coleccion de "page content"
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
        "list-items": {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        image: {
          bsonType: "array",
          items: { bsonType: "string" }
        }
      }
    }
  }
});

// Ejemplo agregar entrada
db.page_contet.insertOne({
  "paragraphs": ["Paragraph #1", "Paragraph #2", "Paragraph #3"],
  "list-items": ["LI #1", "LI #2"],
  "image": ["site.com/img1.jpg", "site.com/img2.png"]
});