export function deleteElement(id, elements) {
    return elements.filter(el => el.id !== id)
}