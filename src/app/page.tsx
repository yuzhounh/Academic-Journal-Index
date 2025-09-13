import CategoryPage from '@/components/search/CategoryPage';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <CategoryPage />
      </div>
    </main>
  );
}
