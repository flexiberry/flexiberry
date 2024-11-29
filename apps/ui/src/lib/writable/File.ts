import { db } from "../db/db";

// Function to save a file
export async function saveFile(fileName: string, fileBlob: Blob) {
  try {
    await db.fileStore.add({
      id: fileName, // Unique identifier for the file
      data: fileBlob,
      name: fileName,
      createdAt: new Date(),
    });
    console.log("File saved successfully!");
  } catch (err) {
    console.error("Error saving file:", err);
  }
}

// Example usage
// const blob = new Blob(['Hello, Dexie!'], { type: 'text/plain' });
// saveFile('example.txt', blob);

export async function getFile(name: string) {
  const data = await db.fileStore.where("name").equals(name).first();

  if (data?.data) {
    const text = await blobToString(data.data); // Convert Blob to string
    return text;
  }
  return "";
}

// Helper function to convert Blob to string
async function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}
