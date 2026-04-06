/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merchandise");

  const record0 = new Record(collection);
    record0.set("name", "TREEWATER Logo T-Shirt");
    record0.set("description", "Classic cotton t-shirt featuring the iconic TREEWATER logo. Perfect for everyday wear and showing your support for the brand.");
    record0.set("price", 24.99);
    record0.set("sizes", "M");
    record0.set("colors", "Black");
    record0.set("stock", 50);
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
    record1.set("name", "Neon Vibes Hoodie");
    record1.set("description", "Comfortable and stylish hoodie with vibrant neon accents. Great for layering or wearing solo during cooler months.");
    record1.set("price", 54.99);
    record1.set("sizes", "L");
    record1.set("colors", "Navy");
    record1.set("stock", 35);
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
    record2.set("name", "Beat Maker Cap");
    record2.set("description", "Adjustable baseball cap perfect for music producers and beat enthusiasts. Lightweight and breathable.");
    record2.set("price", 19.99);
    record2.set("sizes", "M");
    record2.set("colors", "White");
    record2.set("stock", 75);
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
    record3.set("name", "Studio Sessions Sweatpants");
    record3.set("description", "Relaxed-fit sweatpants ideal for studio sessions or casual lounging. Premium fabric for maximum comfort.");
    record3.set("price", 44.99);
    record3.set("sizes", "L");
    record3.set("colors", "Gray");
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
    record4.set("name", "Electric Dreams Jacket");
    record4.set("description", "Premium lightweight jacket with modern design. Perfect for outdoor events and music festivals.");
    record4.set("price", 79.99);
    record4.set("sizes", "XL");
    record4.set("colors", "Black");
    record4.set("stock", 25);
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