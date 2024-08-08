import { promises as fs } from 'fs';
import { Readable } from 'stream';
import path from 'path';

export default defineEventHandler(async (event) => {
  const modelsPath = path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents', 'eiko', 'models');

  // Ensure the directory exists
  try {
    await fs.access(modelsPath);
  } catch {
    await fs.mkdir(modelsPath, { recursive: true });
  }

  const { method } = event.req;

  if (method === 'GET') {
    return getInstalledModels(modelsPath);
  } else if (method === 'POST') {
    return installModel(event, modelsPath);
  } else {
    return { error: 'Unsupported method' };
  }
});

async function getInstalledModels(modelsPath: any) {
  try {
    const modelFolders = await fs.readdir(modelsPath, { withFileTypes: true });
    const installedModels = modelFolders
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return { models: installedModels };
  } catch (error) {
    return { error: 'Could not retrieve models.' };
  }
}

async function* generateProgressUpdates(name: string) {
  const totalSteps = 10;
  for (let i = 1; i <= totalSteps; i++) {
    yield JSON.stringify({
      status: 'downloading',
      progress: (i / totalSteps) * 100,
      message: `Downloading ${name}: ${i * 10}% complete`
    });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  }
  yield JSON.stringify({
    status: 'complete',
    progress: 100,
    message: `Model ${name} installed successfully.`
  });
}

async function installModel(event: any, modelsPath: any) {
  try {
    const body = await readBody(event);
    const { name } = body;

    // Create a readable stream from the generator function
    const stream = Readable.from(generateProgressUpdates(name));

    // Simulate model installation by creating a directory
    const modelDir = path.join(modelsPath, name);
    await fs.mkdir(modelDir, { recursive: true });

    return stream;
  } catch (error) {
    return { error: 'Could not install model.' };
  }
}