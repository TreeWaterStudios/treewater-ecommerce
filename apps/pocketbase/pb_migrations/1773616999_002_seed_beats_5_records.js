/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("beats");

  const record0 = new Record(collection);
    record0.set("name", "Neon Dreams");
    record0.set("artist", "TREEWATER Beats");
    record0.set("genre", "Hip-Hop");
    record0.set("price", 29.99);
    record0.set("description", "A vibrant hip-hop beat with neon-inspired synths and crisp drums. Perfect for rap vocals and modern hip-hop production.");
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
    record1.set("name", "Water Flow");
    record1.set("artist", "TREEWATER Beats");
    record1.set("genre", "Trap");
    record1.set("price", 24.99);
    record1.set("description", "Smooth trap beat with flowing melodies and heavy bass. Ideal for trap artists and producers looking for that signature sound.");
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
    record2.set("name", "Forest Vibes");
    record2.set("artist", "TREEWATER Beats");
    record2.set("genre", "Electronic");
    record2.set("price", 34.99);
    record2.set("description", "Atmospheric electronic beat with nature-inspired sounds and ambient textures. Great for experimental and electronic music.");
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
    record3.set("name", "Electric Pulse");
    record3.set("artist", "TREEWATER Beats");
    record3.set("genre", "R&B");
    record3.set("price", 27.99);
    record3.set("description", "Smooth R&B beat with soulful chords and groovy rhythm. Perfect for R&B singers and smooth vocal performances.");
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
    record4.set("name", "Tree House");
    record4.set("artist", "TREEWATER Beats");
    record4.set("genre", "Pop");
    record4.set("price", 22.99);
    record4.set("description", "Catchy pop beat with uplifting melodies and infectious rhythm. Ideal for pop artists and mainstream music production.");
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