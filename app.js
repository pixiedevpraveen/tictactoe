let tilesCount = 9;
let rcCount = Math.sqrt(tilesCount);
let activeImg = document.querySelector(".tile.active img");
const mapSelect = document.getElementsByClassName("map-select")[0];
const map = document.getElementsByClassName("map")[0];

let clearActiveTiles = () => {
    document.querySelectorAll(".map-select .tile").forEach(element => {
        if (element.classList.contains("active"))
            element.classList.remove("active");
    });
}

let mArr;
let createEmptyArray = () => {
    mArr = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
}
createEmptyArray();

/** 
* @development
* This method will run at every user's turn to check
* is any user has won the game or is game is end
 */
let isEnd = () => {

    let tiles = document.querySelectorAll(".map .tile");
    let index = 0;

    for (let idx = 0; idx < rcCount; idx++) {
        for (let idx2 = 0; idx2 < rcCount; idx2++) {
            if (tiles[index].firstElementChild) {
                if (tiles[index].firstElementChild.classList.contains("circle"))
                    mArr[idx][idx2] = 1;
                else if (tiles[index].firstElementChild.classList.contains("cross"))
                    mArr[idx][idx2] = 2;
            }
            index++;
        }
    }

    mArr.forEach(element => {
        element.forEach(e => {
            console.log(e);
        });
    });
}

let createNewMap = () => {
    let tile = document.createElement("div");
    tile.classList.add("tile");
    map.innerHTML = '';
    for (let index = 0; index < 9 /* 15 */; index++) {
        map.innerHTML += tile.outerHTML;
    }
    createEmptyArray();
    localStorage.mapState = '';
}

let addImg = (target) => {
    if (!activeImg.classList.contains("remove")) {
        target.innerHTML = activeImg.outerHTML;
    }
}

mapSelect.addEventListener('click', function (e) {
    e = e || window.event;
    let target = e.target;
    if (target.classList.contains("tile-img")) {
        let parent = target.parentElement;
        clearActiveTiles();
        if (!parent.classList.contains("active"))
            parent.classList.toggle("active");
        activeImg = target;
    }

}, false);

map.addEventListener('click', function (e) {
    e = e || window.event;
    let target = e.target;
    if (target.classList.contains("tile")) {
        addImg(target);
        isEnd();
    }
    saveState();

}, false);


function saveState() {
    if (localStorage.mapState)
        localStorage.undoMapState = localStorage.mapState;
    localStorage.mapState = map.innerHTML;
}
function getState() {
    if (localStorage.mapState)
        map.innerHTML = localStorage.mapState;
}
function undoState() {
    if (localStorage.undoMapState)
        map.innerHTML = localStorage.undoMapState;
}

document.getElementById("newMap").addEventListener("click", createNewMap);
document.getElementById("getstate").addEventListener("click", getState);
document.getElementById("undostate").addEventListener("click", undoState);
