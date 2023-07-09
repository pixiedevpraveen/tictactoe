const logs = false
const CONSTANTS = {
    aiModes: ['easy', 'medium', 'hard'],
}

const store = PetiteVue.reactive({
    state: {
        currPlayer: 0,
        me: null,
        ai: { _id: 2, mode: "hard" },
        gameEnd: true,
        gamePaused: false,
        winner: null,
        tiles: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ],
        msg: null,
        msgColor: null,
        players: [{ _id: 1, name: 'Player O', img: "assets/circle.png", alt: "circle", key: 'O' }, { _id: 2, name: 'Player X', img: "assets/remove.png", alt: "cross", key: 'X' }],
    },
    gameHistory: [],
    session: {
        scene: 'game'
    },
})

const methods = {
    store: {
        getState() {
            try {
                if (localStorage.storeState) {
                    store.state = JSON.parse(localStorage.storeState)
                } else { throw new Error() }
            } catch {
                localStorage.storeState = ''
                methods.setMsg("Can't restore last game.", { timeout: 5000, color: red })
            }
        },
        saveState(_state) {
            if (localStorage.storeState)
                localStorage.undoState = localStorage.storeState
            localStorage.storeState = JSON.stringify(_state)
        },
        undoState(el) {
            store.state = JSON.parse(localStorage.undoState)
        },
        init() {
            localStorage.undoState = ''
            if (localStorage.gameHistory) {
                store.gameHistory = JSON.parse(localStorage.gameHistory)
            }
        }
    },
    initAI(toggle) {
        logs && console.log("initAI", { toggle })

        if (toggle) {
            store.state.ai = null
            return
        }
        if (!store.state.ai) {
            store.state.ai = { _id: null }
            document.getElementById("ai-mode-select--modal").showModal()
        } else store.state.ai._id = null
    },
    selectAIMode(el, _mode = 'easy') {
        logs && console.log("selectAIMode", { _mode })
        store.state.ai.mode = _mode
        el.parentElement.close()
    },
    togglePlayer() {
        logs && console.log("togglePlayer", {})
        store.state.currPlayer = (store.state.currPlayer == 1 ? 2 : 1)
    },
    getWinner() {
        return store.state.winner
    },
    setWinner(_winner = null) {
        store.state.winner = _winner
    },
    getGameEnd() {
        return store.state.gameEnd
    },
    setGameEnd(_end = false) {
        store.state.gameEnd = _end
    },
    getGamePaused() {
        return store.state.gamePaused
    },
    setGamePaused(_paused) {
        store.state.gamePaused = _paused
    },
    setMsg(msg = null, { timeout, color } = { timeout: null, color: null }) {
        store.state.msg = msg ?? ''
        store.state.msgColor = color
        if (timeout) setTimeout(() => {
            store.state.msg = null
            store.state.msgColor = null
        }, timeout);
    },
    runChecks() {
        _checkWinner(store.state.tiles, this)

        if (this.getWinner()) {
            this.setGameEnd(true)
            setTimeout(() => {
                this.setMsg(store.state.players[this.getWinner() - 1].name + " won the Game", { color: "green" })
                store.gameHistory.push({ tiles: store.state.tiles, winner: this.getWinner(), players: store.state.players })
                store.gameHistory.slice(-50)
                localStorage.gameHistory = JSON.stringify(store.gameHistory)
            }, 200);
        } else if (this.getGameEnd()) {
            this.setGameEnd(true)
            setTimeout(() => {
                this.setMsg("Game finished!", { color: "red" })
                store.gameHistory.push({ tiles: store.state.tiles, winner: null, players: store.state.players })
                store.gameHistory.slice(-20)
                localStorage.gameHistory = JSON.stringify(store.gameHistory)
            }, 200);
        }
    },
    getAIMove() {
        const board = []
        store.state.tiles.forEach(r => {
            board.push(r.map(c => c))
        });

        switch (store.state.ai.mode) {
            case "hard":
                // Check if the computer can win in the next move.
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[i][j] === 0) {
                            board[i][j] = store.state.ai._id;
                            if (_checkWinner(board)) {
                                return [i, j];
                            }
                            board[i][j] = 0;
                        }
                    }
                }

            case "medium":
                // Check if the human player can win in the next move.
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[i][j] === 0) {
                            board[i][j] = store.state.me;
                            if (_checkWinner(board)) {
                                return [i, j];
                            }
                            board[i][j] = 0;
                        }
                    }
                }

            default:
                // Otherwise, just choose a random empty square.
                const blankMoves = []

                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[i][j] === 0) {
                            blankMoves.push([i, j])
                        }
                    }
                }
                if (blankMoves.length) {
                    return randomFromElement(blankMoves);
                }
        }

        this.setGameEnd(true)
    },
    playerSelectClick(el, _playerKey) {
        store.state.currPlayer = _playerKey
        store.state.gameEnd = false
        store.state.gamePaused = false
        store.state.me = _playerKey
        if (store.state.ai) {
            store.state.ai._id = 3 - _playerKey
            store.state.players[2 - _playerKey].name = 'AI: '.concat(store.state.ai.mode)
        }
    },
    tileClick(el, { r, c }) {
        if (this.getGamePaused() || this.getGameEnd()) { return }
        logs && console.log(store.state.currPlayer, store.state.ai?._id, { r, c });

        if (store.state.ai && store.state.currPlayer === store.state.ai._id) {
            store.state.tiles[r][c] = store.state.currPlayer
        } else if (store.state.currPlayer === store.state.me) {
            if (c < 3) { r = 0 }
            else if (c < 6) { r = 1; c -= 3 }
            else if (c < 9) { r = 2; c -= 6 }
            store.state.tiles[r][c] = store.state.currPlayer
        }

        this.runChecks()
        this.togglePlayer()
        this.setGamePaused(true)
        setTimeout(() => {
            this.setGamePaused(false)
            if (store.state.ai && store.state.currPlayer === store.state.ai._id) {
                const [_r, _c] = this.getAIMove() ?? [0, 0]
                this.tileClick(null, { r: _r, c: _c })
            }
        }, 100);

        setTimeout((_state) => {
            methods.store.saveState(_state)
        }, 200, store.state);
    },
    createNewMap() {
        this.initAI()
        store.state.currPlayer = 0
        store.state.tiles = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        this.setWinner()
        this.setMsg()
        this.setGameEnd(false)
        localStorage.undoState = ''
    },
    toggleFullScreen(el = document.getElementById("game")) {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullScreen()
        }
    }
}

PetiteVue.
    createApp({
        CONSTANTS,
        store,
        methods
    }).mount("body");

methods.store.init()

function _checkWinner(a = [], _methods) {
    let _winner = null
    let hasSpace = false
    for (let index = 0; index < 3; index++) {
        if (a[index][0] != 0 && a[index][0] == a[index][1] && a[index][0] == a[index][2]) {
            _winner = a[index][0]
            break
        }
        if (a[0][index] != 0 && a[0][index] == a[1][index] && a[0][index] == a[2][index]) {
            _winner = a[0][index]
            break
        }
        if (!hasSpace && a[index][0] == 0 || a[index][1] == 0 || a[index][2] == 0) {
            hasSpace = true
        }
    }

    if (!_winner && a[0][0] != 0 && a[0][0] == a[1][1] && a[0][0] == a[2][2]) { _winner = a[0][0] }
    if (!_winner && a[0][2] != 0 && a[0][2] == a[1][1] && a[0][2] == a[2][0]) { _winner = a[0][2] }

    if (_winner) {
        if (_methods)
            _methods.setWinner(_winner)
        return true
    }

    if (!hasSpace) {
        if (_methods)
            _methods.setGameEnd(true)
    }
    return false
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromElement(_range = []) {
    return _range[randomNumber(0, _range.length - 1)]
}
