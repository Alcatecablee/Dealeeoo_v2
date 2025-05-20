import { useRouter } from 'next/router';
import DealDetail from '../DealDetail';

export default function DealPage() {
  const { query: { id } } = useRouter();

  if (!id) return <p>Loading…</p>;

  // Pass id as a prop for Next.js compatibility
  return <DealDetail dealId={id as string} />;
} 