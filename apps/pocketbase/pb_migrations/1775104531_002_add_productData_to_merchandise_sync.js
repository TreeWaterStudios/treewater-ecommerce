/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise_sync");

  const existing = collection.fields.getByName("productData");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("productData"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "productData",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("merchandise_sync");
  collection.fields.removeByName("productData");
  return app.save(collection);
})
