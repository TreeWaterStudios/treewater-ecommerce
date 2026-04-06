import pb from '@/lib/pocketbaseClient.js';

export async function getMockupsForProduct(productId) {
  const records = await pb.collection('mockups').getFullList({
    filter: `productId="${productId}"`,
    sort: '+displayOrder',
    $autoCancel: false
  });
  
  return records.map(record => ({
    ...record,
    imageUrl: pb.files.getUrl(record, record.image)
  }));
}

export async function uploadMockups(productId, files, labels) {
  const createdRecords = [];
  
  // Get current max display order to append new ones at the end
  let nextOrder = 0;
  try {
    const existing = await pb.collection('mockups').getFullList({
      filter: `productId="${productId}"`,
      sort: '-displayOrder',
      $autoCancel: false
    });
    if (existing.length > 0) {
      nextOrder = existing[0].displayOrder + 1;
    }
  } catch (e) {
    console.warn("Could not fetch existing mockups for ordering", e);
  }

  for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('image', files[i]);
    formData.append('label', labels[i] || `View ${nextOrder + i + 1}`);
    formData.append('displayOrder', nextOrder + i);

    const record = await pb.collection('mockups').create(formData, { $autoCancel: false });
    createdRecords.push(record);
  }
  
  return createdRecords;
}

export async function deleteMockup(mockupId) {
  return await pb.collection('mockups').delete(mockupId, { $autoCancel: false });
}

export async function reorderMockups(mockupId, newDisplayOrder) {
  return await pb.collection('mockups').update(mockupId, { 
    displayOrder: newDisplayOrder 
  }, { $autoCancel: false });
}