import OperatorsPageClient from "@/components/operators/OperatorsPageClient";
import { getOperators } from "@/lib/api";

export default async function OperatorsPage() {
  const operators = await getOperators();
  return <OperatorsPageClient operators={operators} />;
}
