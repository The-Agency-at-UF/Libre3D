import { svgShapesToPaths } from "../paths/svgImport";
import { useEditorStore } from "../store/useEditorStore";

export const isSvgFile = (file: File): boolean => /\.svg$/i.test(file.name);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// The single entry point for importing an .svg (notes/animation-plan.md, B3): parses it with three's
// SVGLoader, turns its shapes into paths (paths/svgImport.ts), and adds them in one undo step, named
// after the file. Says so when there's nothing to import, or when filled shapes came in as outlines,
// since lettering exported as text or outlines doesn't give the tube along each stroke people expect.
//
// SVGLoader is loaded on the first SVG import only, like GLTFLoader (createGltfLoader.ts).
export async function importSvgFile(file: File): Promise<void> {
  // View only and Play are for looking: the store would drop the paths anyway, so don't say anything.
  const { readOnlyReason, isPreviewMode } = useEditorStore.getState();
  if (readOnlyReason || isPreviewMode) return;

  const [{ SVGLoader }, text] = await Promise.all([import("three/examples/jsm/loaders/SVGLoader.js"), file.text()]);

  let paths;
  try {
    paths = svgShapesToPaths(new SVGLoader().parse(text).paths);
  } catch (error) {
    window.alert("This SVG couldn't be read.");
    throw error;
  }

  if (paths.length === 0) {
    window.alert(
      "No paths found in this SVG. Live text isn't imported: draw the lettering as a stroke (or convert the text to outlines) and export it again.",
    );
    return;
  }

  useEditorStore.getState().addImportedPaths(file.name.replace(/\.svg$/i, ""), paths);

  const outlines = paths.filter((path) => path.outline).length;
  if (outlines > 0) {
    window.alert(
      `${plural(outlines, "path")} came from filled shapes (such as text converted to outlines), so the tube follows their edges, ` +
        "not the middle of each stroke. For one tube along each stroke, draw the lettering as a stroke with no fill and export that.",
    );
  }
}
