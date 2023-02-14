/*jslint browser*/
/*global fileIO, editableTree*/
const fileName = document.getElementById("file-name");
const newButton = document.getElementById("new-button");
const openButton = document.getElementById("open-button");
const saveButton = document.getElementById("save-button");
const spaceCheckbox = document.getElementById("space-checkbox");
const spaceInput = document.getElementById("space-input");
const tree = document.getElementById("tree");
function getBlob(value) {
    let space = spaceInput.value;
    const int = (
        space === ""
        ? 4
        : parseInt(space)
    );
    return (
        spaceCheckbox.checked
        ? new Blob([JSON.stringify(value, null, (
            Number.isNaN(int)
            ? space
            : int
        ))])
        : new Blob([JSON.stringify(value)])
    );
}
spaceInput.disabled = !spaceCheckbox.checked;
newButton.addEventListener("click", function (event) {
    const {left, top} = newButton.getBoundingClientRect();
    editableTree.newJSON(tree, left, top + newButton.clientHeight + 4);
    event.stopPropagation();
});
openButton.addEventListener("click", async function () {
    const file = await fileIO.open("application/json");
    fileName.value = file.name;
    try {
        const value = JSON.parse(await file.text());
        tree.replaceChildren(editableTree.from(value));
    } catch (error) {
        window.alert(error.message);
    }
});
saveButton.addEventListener("click", function () {
    const {value} = editableTree.toValue(tree.firstChild);
    fileIO.download(getBlob(value), fileName.value);
});
spaceCheckbox.addEventListener("click", function () {
    spaceInput.disabled = !spaceCheckbox.checked;
    spaceInput.value = (
        spaceCheckbox.checked
        ? ""
        : "disabled"
    );
});
