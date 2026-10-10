import { Unpublished, unpublishedMetadata } from "../unpublished";

export const metadata = unpublishedMetadata("Terms");

export default function TermsPage() {
  return <Unpublished title="Terms" />;
}
