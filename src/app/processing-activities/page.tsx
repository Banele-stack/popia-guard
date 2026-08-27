import ProcessingActivitiesPageClient from "@/components/processing-activities/ProcessingActivitiesPageClient";
import { getProcessingActivities } from "@/lib/api";

export default async function ProcessingActivitiesPage() {
  const activities = await getProcessingActivities();
  return <ProcessingActivitiesPageClient activities={activities} />;
}
