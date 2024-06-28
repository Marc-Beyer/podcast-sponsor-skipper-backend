/* eslint-disable */
"use strict";

const paginationElement = document.getElementById("pagination");

function createPagination(currentPage, nrOfPages) {
    if (currentPage > nrOfPages) setPage("");
    paginationElement.innerHTML = "";

    if (currentPage >= 1) paginationElement.append(createPage(currentPage - 1, false, "Previous"));
    let addedFiller = false;
    for (let index = 0; index < nrOfPages; index++) {
        if (index < 1 || (index > currentPage - 2 && index < currentPage + 3) || index >= nrOfPages - 1) {
            paginationElement.append(createPage(index, currentPage === index));
            addedFiller = false;
        } else if (!addedFiller) {
            paginationElement.append(createFiller());
            addedFiller = true;
        }
    }
    if (currentPage < nrOfPages - 1) paginationElement.append(createPage(currentPage + 1, false, "Next"));
}

function createFiller() {
    const li = document.createElement("li");
    li.className = "page-item disabled";

    const span = document.createElement("span");
    span.className = "page-link";
    span.textContent = "...";
    li.append(span);

    return li;
}

function createPage(number, isActive, text = undefined) {
    const li = document.createElement("li");
    li.className = "page-item" + (isActive ? " active" : "");

    const a = document.createElement("a");
    a.className = "page-link";
    a.addEventListener("click", (e) => {
        e.preventDefault();
        setPage(number);
    });

    a.href = "#";
    a.textContent = text ? text : number + 1;
    li.append(a);

    return li;
}

function setPage(pageNr = "") {
    const urlParams = new URLSearchParams(window.location.search);
    if (pageNr === "") {
        urlParams.delete("page");
    } else {
        urlParams.set("page", pageNr);
    }
    window.location.search = urlParams;
}
