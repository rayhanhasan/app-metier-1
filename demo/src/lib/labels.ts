// Calque d'étiquettes maison : les éléments DOM sont rendus dans l'arbre React
// principal et repositionnés à chaque frame par le projecteur (dans le Canvas).
// Remplace drei/Html, qui crée une racine React par étiquette.

export type Vec3 = [number, number, number]

export const labelEls = new Map<string, HTMLElement>()
export const labelPos = new Map<string, Vec3>()

export function registerLabel(id: string, pos: Vec3) {
  return (el: HTMLElement | null) => {
    if (el) {
      labelEls.set(id, el)
      labelPos.set(id, pos)
    } else {
      labelEls.delete(id)
      labelPos.delete(id)
    }
  }
}
