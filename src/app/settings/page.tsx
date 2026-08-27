import { getOwnOrganization } from "@/lib/api";
import SettingsPageClient from "@/components/settings/SettingsPageClient";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage() {
  const [organization, user] = await Promise.all([getOwnOrganization(), getCurrentUser()]);
  return <SettingsPageClient organization={organization} isAdmin={user?.role === "admin"} />;
}
