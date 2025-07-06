import ForecastForm from '@/components/forecast/ForecastForm';

export default function NewForecastPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新規トレード予想</h1>
      <ForecastForm />
    </div>
  );
}
