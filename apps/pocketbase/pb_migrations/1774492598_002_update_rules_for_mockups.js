/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("mockups");
  collection.createRule = "@request.auth.id != \"\" && productId != \"\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("mockups");
  collection.createRule = "@request.auth.id != \"\"";
  return app.save(collection);
})
