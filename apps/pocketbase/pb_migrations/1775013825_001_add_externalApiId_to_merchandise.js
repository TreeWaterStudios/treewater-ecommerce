/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise");

  const existing = collection.fields.getByName("externalApiId");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("externalApiId"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "externalApiId",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("merchandise");
  collection.fields.removeByName("externalApiId");
  return app.save(collection);
})
