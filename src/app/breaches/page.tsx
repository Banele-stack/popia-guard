import BreachesPageClient from "@/components/breaches/BreachesPageClient";
import { getBreaches } from "@/lib/api";

export default async function BreachesPage() {
  const breaches = await getBreaches();
  return <BreachesPageClient breaches={breaches} />;
}
