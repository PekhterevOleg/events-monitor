/**
 * @type {HTMLDivElement[]}
 */
let gridSubContainers = Array.from(
    document.querySelectorAll('.grid-sub-container')
);

/**
 *
 * @type {Generator<HTMLDivElement, void, *>}
 */
const containerGen = nextContainerGen();

function* nextContainerGen() {
    for (let container of gridSubContainers) {
        while (container.children.length <= 35) {
            yield container;
        }
    }
}