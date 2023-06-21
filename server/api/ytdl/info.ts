import ytdl from "ytdl-core";

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event);

  if (url === null) throw 'Empty Url';
  // Parse Video Url
  const videoId = ytdl.getURLVideoID(url);

  return await ytdl.getInfo(videoId);
});