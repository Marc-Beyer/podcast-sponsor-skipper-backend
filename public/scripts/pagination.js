/* eslint-disable */
"use strict";

const paginationElement = document.getElementById("pagination");

function createPagination(currentPage, nrOfPages) {
    paginationElement.innerHTML = "";
    for (let index = 0; index < nrOfPages; index++) {
        paginationElement.append(createPage(index, currentPage === index));
    }
}

function createPage(number, isActive) {
    const li = document.createElement("li");
    li.className = "page-item" + (isActive ? " active" : "");

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = `?page=${number}`;
    a.textContent = number + 1;
    li.append(a);

    return li;
}
