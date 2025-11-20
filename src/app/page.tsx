import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-8 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={37}
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Next.js Project
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A modern Next.js application with TypeScript, Prisma, and more.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Tech Stack
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Frontend</h4>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>✓ Next.js (App Router)</li>
                <li>✓ TypeScript</li>
                <li>✓ TailwindCSS</li>
                <li>✓ shadcn/ui</li>
                <li>✓ React Query</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Backend</h4>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>✓ Prisma ORM</li>
                <li>✓ Redis Caching</li>
                <li>✓ Docker Support</li>
                <li>✓ Bun Runtime</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-900">
          <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            🚀 Next Steps
          </h3>
          <ol className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>1. Configure your <code className="rounded bg-white px-1.5 py-0.5 dark:bg-zinc-800">.env.local</code> file</li>
            <li>2. Run <code className="rounded bg-white px-1.5 py-0.5 dark:bg-zinc-800">bunx prisma migrate dev</code> to set up your database</li>
            <li>3. Start Redis server</li>
            <li>4. Check out the <code className="rounded bg-white px-1.5 py-0.5 dark:bg-zinc-800">README.md</code> for more details</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
