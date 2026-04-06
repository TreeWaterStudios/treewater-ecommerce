/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise");

  const record0 = new Record(collection);
    record0.set("name", "Classic Logo T-Shirt");
    record0.set("description", "Premium quality cotton t-shirt featuring our iconic logo. Perfect for everyday wear with a comfortable fit.");
    record0.set("price", 24.99);
    record0.set("sizes", "M");
    record0.set("colors", "Black");
    record0.set("stock", 150);
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
    record1.set("name", "Signature Hoodie");
    record1.set("description", "Cozy and stylish hoodie made from premium blend fabric. Features kangaroo pocket and adjustable drawstrings. Great for layering or wearing solo.");
    record1.set("price", 54.99);
    record1.set("sizes", "L");
    record1.set("colors", "Navy");
    record1.set("stock", 85);
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
    record2.set("name", "Snapback Cap");
    record2.set("description", "Classic snapback cap with embroidered logo. Adjustable fit for all head sizes. Perfect for outdoor activities and casual style.");
    record2.set("price", 19.99);
    record2.set("sizes", "M");
    record2.set("colors", "White");
    record2.set("stock", 200);
  try {
    app.save(record2);
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
