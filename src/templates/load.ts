import { TEMPLATE_LOADERS } from "./loaders.generated";
import { resolveTemplateId } from "./index";

/** A template's component. Import this only where a site is rendered (see loaders.generated.ts). */
export async function loadTemplate(id: string) {
  return (await TEMPLATE_LOADERS[resolveTemplateId(id)]()).default;
}
