// Lets Node load modules that import images (data/situations.ts imports photos for next/image).
import { registerHooks } from "node:module";

registerHooks({
  load(url, context, nextLoad) {
    if (/\.(jpe?g|png|webp|svg)$/i.test(url)) {
      return { format: "module", source: "export default { src: '', width: 0, height: 0 };", shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
