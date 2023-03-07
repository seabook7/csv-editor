/*jslint browser*/
const editableTree = (function () {
    const elementType = (function () {
        function create(name, defaultValue, isCollection, editable) {
            return {defaultValue, editable, isCollection, name};
        }
        return [
            create("object", "{}", true, false),
            create("array", "[]", true, false),
            create("string", "\"\"", false, true),
            create("number", "0", false, true),
            create("\"true\"", "true", false, false),
            create("\"false\"", "false", false, false),
            create("\"null\"", "null", false, false)
        ];
    }());
    function getTypeIndex(value) {
        const type = typeof value;
        switch (type) {
        case "string":
            return 2;
        case "number":
            return 3;
        case "boolean":
            return (
                value
                ? 4
                : 5
            );
        case "object":
            if (value === null) {
                return 6;
            } else if (Array.isArray(value)) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    function getObjectText(length) {
        switch (length) {
        case 0:
            return "{}";
        case 1:
            return "{1 member}";
        default:
            return "{" + length + " members}";
        }
    }
    function getArrayText(length) {
        switch (length) {
        case 0:
            return "[]";
        case 1:
            return "[1 element]";
        default:
            return "[" + length + " elements]";
        }
    }
    function createTreeIcon(valueSpan, parentNode, level) {
        const icon = document.createElement("i");
        const isObject = valueSpan.dataset.typeIndex === "0";
        if (level > 0) {
            const length = parentNode.childNodes.length - 2;
            icon.className = "bi-caret-right";
            valueSpan.append(
                isObject
                ? getObjectText(length)
                : getArrayText(length)
            );
            parentNode.hidden = true;
        } else {
            icon.className = "bi-caret-down";
            valueSpan.append(
                isObject
                ? "{"
                : "["
            );
        }
        icon.setAttribute("role", "button");
        if (level > 0) {
            icon.style.marginInlineStart = level + "rem";
        }
        icon.addEventListener("click", function () {
            parentNode.hidden = !parentNode.hidden;
            if (parentNode.hidden) {
                const newLength = parentNode.childNodes.length - 2;
                icon.className = "bi-caret-right";
                valueSpan.firstChild.nodeValue = (
                    isObject
                    ? getObjectText(newLength)
                    : getArrayText(newLength)
                );
            } else {
                icon.className = "bi-caret-down";
                valueSpan.firstChild.nodeValue = (
                    isObject
                    ? "{"
                    : "["
                );
            }
        });
        return icon;
    }
    function createBlankIcon(level) {
        const icon = document.createElement("i");
        icon.className = "blank-icon";
        if (level > 0) {
            icon.style.marginInlineStart = level + "rem";
        }
        return icon;
    }
    function createDiv(className) {
        const div = document.createElement("div");
        div.className = className;
        return div;
    }
    function createLabel(htmlFor, text) {
        const label = document.createElement("label");
        label.htmlFor = htmlFor;
        label.append(text);
        return label;
    }
    function createOKButton(clickFunction) {
        const button = document.createElement("button");
        const icon = document.createElement("i");
        button.className = "btn btn-outline-success px-0";
        button.type = "button";
        icon.className = "bi-check2-square";
        button.append(icon, " OK");
        button.addEventListener("click", clickFunction);
        return button;
    }
    const closeButton = (function () {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn-close float-end";
        button.addEventListener("click", function () {
            editingCard.remove();
        });
        return button;
    }());
    const editingCardHeader = createDiv("card-header user-select-none");
    const nameInput = (function () {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "name-input";
        input.className = "form-control mb-3";
        return input;
    }());
    const nameLabel = createLabel(nameInput.id, "Name:");
    const indexLabel = createLabel(nameInput.id, "Index:");
    const valueInput = (function () {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "value-input";
        input.className = "form-control";
        input.addEventListener("change", function () {
            input.dataset.changed = "";
        });
        return input;
    }());
    const valueLabel = createLabel(valueInput.id, "Value:");
    const typeSelect = (function () {
        const select = document.createElement("select");
        select.id = "type-select";
        select.className = "form-select mb-3";
        select.append(...elementType.map(function (type) {
            const option = document.createElement("option");
            option.append(type.name);
            return option;
        }));
        select.addEventListener("change", function () {
            const type = elementType[select.selectedIndex];
            valueInput.value = type.defaultValue;
            valueInput.disabled = !type.editable;
            valueInput.dataset.changed = "";
        });
        return select;
    }());
    const typeLabel = createLabel(typeSelect.id, "Type:");
    const editingCardBody = createDiv("card-body");
    let okButton;
    const editingCardFooter = createDiv("card-footer text-end");
    const editingCard = (function () {
        const div = document.createElement("div");
        let offsetX;
        let offsetY;
        let isMousedown;
        div.className = "card position-fixed shadow glass-background";
        editingCardHeader.addEventListener("mousedown", function (event) {
            if (event.button === 0) {
                isMousedown = true;
                offsetX = event.offsetX;
                offsetY = event.offsetY;
            }
        });
        editingCardHeader.addEventListener("mousemove", function (event) {
            if (isMousedown) {
                div.style.left = event.x - offsetX + "px";
                div.style.top = event.y - offsetY + "px";
            }
        });
        editingCardHeader.addEventListener("mouseup", function () {
            isMousedown = false;
        });
        editingCardHeader.addEventListener("mouseout", function () {
            isMousedown = false;
        });
        div.addEventListener("click", function (event) {
            event.stopPropagation();
        });
        div.append(editingCardHeader, editingCardBody, editingCardFooter);
        return div;
    }());
    const body = document.body;
    function showEditingCard(
        title,
        {name, typeIndex, value},
        clickOKFunction,
        {x, y}
    ) {
        const type = elementType[typeIndex];
        // header
        editingCardHeader.replaceChildren(title, closeButton);
        // body
        editingCardBody.replaceChildren();
        // name input
        if (name === undefined) {
            nameInput.value = "";
        } else {
            nameInput.value = name;
            if (typeof JSON.parse(name) === "string") {
                nameInput.disabled = false;
                editingCardBody.append(nameLabel);
            } else {
                nameInput.disabled = true;
                editingCardBody.append(indexLabel);
            }
            editingCardBody.append(nameInput);
        }
        // type select
        typeSelect.selectedIndex = typeIndex;
        // value input
        valueInput.value = value ?? type.defaultValue;
        valueInput.disabled = !type.editable;
        delete valueInput.dataset.changed;
        editingCardBody.append(typeLabel, typeSelect, valueLabel, valueInput);
        // footer
        okButton = createOKButton(clickOKFunction);
        editingCardFooter.replaceChildren(okButton);
        // show
        editingCard.style.left = x + "px";
        editingCard.style.top = y + "px";
        body.append(editingCard);
    }
    function parseName(json) {
        const name = JSON.parse(json);
        if (getTypeIndex(name) !== 2) {
            throw new TypeError("Name must be a string.");
        }
        return name;
    }
    function resetIndexes(parentNode) {
        let valueSpan = parentNode.previousSibling;
        while (valueSpan.nodeName !== "SPAN") {
            valueSpan = valueSpan.previousSibling;
        }
        if (valueSpan.dataset.typeIndex === "1") {
            const children = parentNode.childNodes;
            let index = 0;
            const length = children.length - 2;
            while (index < length) {
                children[index].childNodes[1].nodeValue = index + ": ";
                index += 1;
            }
        }
    }
    function createEditIcon() {
        const title = "Edit";
        const icon = document.createElement("i");
        icon.className = "bi-pencil-square text-success";
        icon.title = title;
        icon.setAttribute("role", "button");
        icon.style.marginInline = ".5rem";
        icon.addEventListener("click", function (event) {
            const span = icon.parentNode;
            const nodeList = span.childNodes;
            const {name, valueSpan} = (function (node) {
                if (node.nodeType === 3) {
                    const keyText = node.nodeValue;
                    return {
                        name: keyText.substring(0, keyText.length - 2),
                        valueSpan: nodeList[2]
                    };
                }
                return {valueSpan: node};
            }(nodeList[1]));
            const typeIndex = valueSpan.dataset.typeIndex;
            let value;
            if (elementType[typeIndex].isCollection) {
                const length
                = nodeList[nodeList.length - 1].childNodes.length - 2;
                value = (
                    typeIndex === "0"
                    ? getObjectText(length)
                    : getArrayText(length)
                );
            } else {
                value = valueSpan.firstChild.nodeValue;
            }
            showEditingCard(
                title,
                {name, typeIndex, value},
                function () {
                    try {
                        const level = JSON.parse(span.dataset.level);
                        if (valueInput.dataset.changed === "") {
                            if (level === 0) {
                                span.parentNode.replaceChild(from(
                                    JSON.parse(valueInput.value)
                                ), span);
                            } else {
                                span.parentNode.replaceChild(from(
                                    JSON.parse(valueInput.value),
                                    (
                                        nameInput.disabled
                                        ? JSON.parse(nameInput.value)
                                        : parseName(nameInput.value)
                                    ),
                                    level
                                ), span);
                            }
                        } else {
                            if (level > 0 && !nameInput.disabled) {
                                nodeList[1].nodeValue
                                = JSON.stringify(parseName(nameInput.value))
                                + ": ";
                            }
                        }
                        editingCard.remove();
                    } catch (error) {
                        window.alert(error.message);
                    }
                },
                event
            );
            event.stopPropagation();
        });
        return icon;
    }
    function createInsertIcon() {
        const title = "Insert";
        const icon = document.createElement("i");
        icon.className = "bi-plus-square text-primary";
        icon.title = title;
        icon.setAttribute("role", "button");
        icon.addEventListener("click", function (event) {
            const span = icon.parentNode;
            const nodeList = span.childNodes;
            const keyText = nodeList[1].nodeValue;
            let name = keyText.substring(0, keyText.length - 2);
            const typeIndex = nodeList[2].dataset.typeIndex;
            if (typeof JSON.parse(name) === "string") {
                name = elementType[2].defaultValue;
            }
            showEditingCard(
                title,
                {name, typeIndex},
                function () {
                    try {
                        span.parentNode.insertBefore(from(
                            JSON.parse(valueInput.value),
                            (
                                nameInput.disabled
                                ? JSON.parse(nameInput.value)
                                : parseName(nameInput.value)
                            ),
                            JSON.parse(span.dataset.level)
                        ), span);
                        editingCard.remove();
                        resetIndexes(span.parentNode);
                    } catch (error) {
                        window.alert(error.message);
                    }
                },
                event
            );
            event.stopPropagation();
        });
        return icon;
    }
    function createAddIcon() {
        const title = "Add";
        const icon = document.createElement("i");
        icon.className = "bi-plus-square text-primary";
        icon.title = title;
        icon.setAttribute("role", "button");
        icon.addEventListener("click", function (event) {
            const span = icon.parentNode;
            let name;
            let typeIndex;
            const previousSpan = span.previousSibling;
            if (previousSpan === null) {
                const endSpan = span.nextSibling;
                name = (
                    endSpan.childNodes[1].nodeValue === "}\n"
                    ? elementType[2].defaultValue
                    : elementType[3].defaultValue
                );
                typeIndex = "2";
            } else {
                const nodeList = previousSpan.childNodes;
                const keyText = nodeList[1].nodeValue;
                const key = JSON.parse(
                    keyText.substring(0, keyText.length - 2)
                );
                name = (
                    typeof key === "string"
                    ? elementType[2].defaultValue
                    : JSON.stringify(key + 1)
                );
                typeIndex = nodeList[2].dataset.typeIndex;
            }
            showEditingCard(
                title,
                {name, typeIndex},
                function () {
                    try {
                        span.parentNode.insertBefore(from(
                            JSON.parse(valueInput.value),
                            (
                                nameInput.disabled
                                ? JSON.parse(nameInput.value)
                                : parseName(nameInput.value)
                            ),
                            JSON.parse(span.dataset.level)
                        ), span);
                        editingCard.remove();
                    } catch (error) {
                        window.alert(error.message);
                    }
                },
                event
            );
            event.stopPropagation();
        });
        return icon;
    }
    function createDeleteIcon() {
        const icon = document.createElement("i");
        icon.className = "bi-dash-square text-danger";
        icon.title = "Delete";
        icon.setAttribute("role", "button");
        icon.style.marginInlineStart = ".5rem";
        icon.addEventListener("click", function () {
            const span = icon.parentNode;
            span.remove();
            resetIndexes(span.parentNode);
        });
        return icon;
    }
    function createAddSpan(level) {
        const span = document.createElement("span");
        span.dataset.level = level;
        span.append(createBlankIcon(level), createAddIcon(), "\n");
        return span;
    }
    function createEndSpan(typeName, isObject, level) {
        const span = document.createElement("span");
        span.title = typeName;
        span.append(createBlankIcon(level), (
            isObject
            ? "}"
            : "]"
        ) + "\n");
        return span;
    }
    function from(value, key, level = 0) {
        const span = document.createElement("span");
        const valueSpan = document.createElement("span");
        const typeIndex = getTypeIndex(value);
        const type = elementType[typeIndex];
        const typeName = type.name;
        const isCollection = type.isCollection;
        const isObject = typeIndex === 0;
        let parentNode;
        span.dataset.level = level;
        valueSpan.title = typeName;
        valueSpan.dataset.typeIndex = typeIndex;
        if (isCollection) {
            parentNode = document.createElement("span");
            level += 1;
            if (isObject) {
                Object.entries(
                    value
                ).forEach(function ([objectKey, objectValue]) {
                    parentNode.append(from(objectValue, objectKey, level));
                });
            } else {
                value.forEach(function (element, index) {
                    parentNode.append(from(element, index, level));
                });
            }
            parentNode.append(createAddSpan(level));
            level -= 1;
            parentNode.append(createEndSpan(typeName, isObject, level));
            // createTreeIcon also set value's text
            span.append(createTreeIcon(valueSpan, parentNode, level));
        } else {
            span.append(createBlankIcon(level));
            // set value's text
            valueSpan.append(JSON.stringify(value));
        }
        if (key === undefined) {
            span.append(
                valueSpan,
                createEditIcon()
            );
        } else {
            span.append(
                // set key's text
                JSON.stringify(key) + ": ",
                valueSpan,
                createEditIcon(),
                createInsertIcon(),
                createDeleteIcon()
            );
        }
        span.append("\n");
        if (isCollection) {
            span.append(parentNode);
        }
        return span;
    }
    function toValue(span) {
        const nodeList = span.childNodes;
        const {key, valueSpan} = (function (node) {
            if (node.nodeType === 3) {
                const keyText = node.nodeValue;
                return {
                    key: JSON.parse(keyText.substring(0, keyText.length - 2)),
                    valueSpan: nodeList[2]
                };
            }
            return {valueSpan: node};
        }(nodeList[1]));
        const typeIndex = valueSpan.dataset.typeIndex;
        let value;
        if (elementType[typeIndex].isCollection) {
            const children = nodeList[nodeList.length - 1].childNodes;
            let index = 0;
            const length = children.length - 2;
            if (typeIndex === "0") {
                value = {};
                while (index < length) {
                    const result = toValue(children[index]);
                    value[result.key] = result.value;
                    index += 1;
                }
            } else {
                value = new Array(length);
                while (index < length) {
                    value[index] = toValue(children[index]).value;
                    index += 1;
                }
            }
        } else {
            value = JSON.parse(valueSpan.firstChild.nodeValue);
        }
        return {key, value};
    }
    window.addEventListener("click", function () {
        editingCard.remove();
    });
    body.addEventListener("keypress", function (event) {
        if (body.contains(editingCard) && event.key === "Enter") {
            okButton.click();
        }
    });
    return {
        create({x, y}) {
            return new Promise(function (resolve) {
                function cancel() {
                    closeButton.removeEventListener("click", cancel);
                    window.removeEventListener("click", cancel);
                    resolve();
                }
                closeButton.addEventListener("click", cancel);
                window.addEventListener("click", cancel);
                showEditingCard("New", {typeIndex: "0"}, function () {
                    try {
                        resolve(from(JSON.parse(valueInput.value)));
                        editingCard.remove();
                    } catch (error) {
                        window.alert(error.message);
                    }
                }, {x, y});
            });
        },
        from,
        toValue
    };
}());
