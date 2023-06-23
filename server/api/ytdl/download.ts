import ytdl from "ytdl-core";
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  // Fetch query params
  let { url, filePath, fileName, fileType } = getQuery(event);

  // Throw error if any query params are empty
  if (url === null) throw new Error('Empty Url');
  if (filePath === null) throw new Error('Empty filePath');
  if (fileName === null) throw new Error('Empty fileName');
  if (fileType === null) throw new Error('Empty fileType');

  // Replace backward slashes with forward slashes
  filePath = filePath?.replace(/\\/g, "/");
  
  // Removes any illegal characters in fileName
  fileName = fileName?.replace(/[/\\?%*:|"<>]/g, '-');

  // File Path to store audio
  const fullFilePath = `${filePath}/${fileName}.${fileType}`;

  // Youtube Extraction
  const stream = ytdl(url, {
    filter: 'audioonly',
    format: fileType
  })
  .pipe(fs.createWriteStream(fullFilePath));

  // Create promise for stream
  const end = new Promise(function(resolve, reject) {
    stream.on('finish', () => resolve({ path: fullFilePath }));
    stream.on('error', reject);
  });

  return await end;
});