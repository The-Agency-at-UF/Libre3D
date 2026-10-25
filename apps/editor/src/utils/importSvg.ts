import { svgShapesToItems } from "../paths/svgImport";
import { useEditorStore } from "../store/useEditorStore";

export const isSvgFile = (file: File): boolean => /\.svg$/i.test(file.name);

// The single entry point for importing an .svg (notes/animation-plan.md, B3): parses it with three's
// SVGLoader, turns its filled shapes into shapes and its strokes into paths (paths/svgImport.ts), and
// adds them in one undo step, named after the file. Says so when there's nothing to import.
//
// SVGLoader is loaded on the first SVG import only, like GLTFLoader (createGltfLoader.ts).
export async function importSvgFile(file: File): Promise<void> {
  // View only and Play are for looking: the store would drop the import anyway, so don't say anything.
  const { readOnlyReason, isPreviewMode } = useEditorStore.getState();
  if (readOnlyReason || isPreviewMode) return;

  const [{ SVGLoader }, text] = await Promise.all([import("three/examples/jsm/loaders/SVGLoader.js"), file.text()]);

  let items;
  try {
    const shapes = new SVGLoader().parse(text).paths.map((shapePath) => ({
      subPaths: shapePath.subPaths,
      userData: shapePath.userData,
      // The filled areas, following the fill rule: each outline with its holes.
      fills: SVGLoader.createShapes(shapePath),
    }));
    items = svgShapesToItems(shapes);
  } catch (error) {
    window.alert("This SVG couldn't be read.");
    throw error;
  }

  if (items.length === 0) {
    window.alert("Nothing to import in this SVG. Live text isn't imported: convert the text to outlines and export it again.");
    return;
  }

  useEditorStore.getState().addImportedSvg(file.name.replace(/\.svg$/i, ""), items);
}
