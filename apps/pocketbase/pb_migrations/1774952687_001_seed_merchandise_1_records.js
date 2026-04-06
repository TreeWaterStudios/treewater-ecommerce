/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise");

  const record0 = new Record(collection);
    record0.set("name", "White TreeWater Hoodie");
    record0.set("price", 49.99);
    record0.set("stock", 100);
    record0.set("colors", "White");
    record0.set("sizes", "M");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
