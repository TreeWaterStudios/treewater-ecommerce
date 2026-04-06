/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise");

  const record0 = new Record(collection);
    record0.set("name", "Classic Vinyl");
    record0.set("description", "Standard vinyl record pressing");
    record0.set("price", 29.99);
    record0.set("stock", 100);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Limited Edition Vinyl");
    record1.set("description", "Limited edition colored vinyl with exclusive artwork");
    record1.set("price", 49.99);
    record1.set("stock", 50);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Deluxe Box Set");
    record2.set("description", "Complete deluxe box set with vinyl, CD, and merchandise");
    record2.set("price", 99.99);
    record2.set("stock", 25);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Merchandise Bundle");
    record3.set("description", "Bundle of t-shirt, hoodie, and hat");
    record3.set("price", 79.99);
    record3.set("stock", 40);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Signed Album");
    record4.set("description", "Officially signed album with certificate of authenticity");
    record4.set("price", 59.99);
    record4.set("stock", 15);
  try {
    app.save(record4);
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
