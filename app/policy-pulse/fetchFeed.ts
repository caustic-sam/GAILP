import Parser from 'rss-parser';

const FEED_URL = 'http://malsicario.duckdns.org:8082/i/?a=global&rid=690833c97590d';

export async function getPolicyPulseFeed() {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(FEED_URL);
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
      creator: item.creator || item.author,
      categories: item.categories || [],
    }));
  } catch (error) {
    return [];
  }
}
