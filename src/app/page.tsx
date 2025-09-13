import CategoryPage from '@/components/search/CategoryPage';

export default function Home() {
  return (
    <div className="flex-grow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryPage />
      </div>
    </div>
  );
}
