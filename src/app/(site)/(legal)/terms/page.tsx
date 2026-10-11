import { LegalPage, legalMetadata } from "../unpublished";

export const metadata = legalMetadata("terms");

export default function TermsPage() {
  return <LegalPage id="terms" />;
}
