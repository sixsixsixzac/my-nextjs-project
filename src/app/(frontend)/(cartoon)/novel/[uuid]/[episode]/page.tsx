export default async function NovelReadingPage({
  params,
}: {
  params: Promise<{ uuid: string; episode: string }>;
}) {
  const { uuid, episode } = await params;

  // Novel reading page - Coming soon
  return (
    <div className="max-w-6xl mx-auto">
      <div>Novel reading page - Coming soon</div>
    </div>
  );
}

