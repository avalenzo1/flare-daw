import ytdl from "ytdl-core";
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  let { url, filePath, fileName, fileType } = getQuery(event);

  if (url === null) throw new Error('Empty Url');
  if (filePath === null) throw new Error('Empty directory');
  if (fileName === null) throw new Error('Empty directory');
  if (fileType === null) throw new Error('Empty directory');

  fileName = fileName?.replace(/[/\\?%*:|"<>]/g, '-');

  const fullFilePath = `${filePath}\\${fileName}.${fileType}`;

  const stream = ytdl(url, {
    filter: 'audioonly',
    format: fileType
  })
  .pipe(fs.createWriteStream(fullFilePath));

  var end = new Promise(function(resolve, reject) {
    stream.on('finish', () => resolve({ path: fullFilePath }));
    stream.on('error', reject);
  });

  console.log(end);

  return await end;
});