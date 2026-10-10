import { Unpublished, unpublishedMetadata } from "../unpublished";

export const metadata = unpublishedMetadata("Privacy");

export default function PrivacyPage() {
  return <Unpublished title="Privacy" />;
}
