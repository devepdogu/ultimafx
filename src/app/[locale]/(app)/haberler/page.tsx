import { getNewsFeed } from "@/lib/news/feed";
import { NewsList } from "@/components/news/NewsList";

export default async function NewsPage() {
  const items = await getNewsFeed();
  return <NewsList items={items} />;
}
