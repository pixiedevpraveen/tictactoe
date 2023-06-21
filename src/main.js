const store = PetiteVue.reactive({
    state: {
        players: [{ _id: 1, name: 'Player O', img: "assets/circle.png", alt: "circle", key: 'O' }, { _id: 2, name: 'Player X', img: "assets/remove.png", alt: "cross", key: 'X' }],
        currPlayer: 0,
        me: 1,
        gameEnd: false,
        gamePaused: false,
        winner: null,
        tiles: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ],
        msg: null,
        msgColor: null,
    },
    gameHistory: [],
    getters: {
        playerWithKey(_key) {
            return store.state.players.filter(p => p.key == key)
        }
    },
    session: {
    },
    getState() {
        try {
            if (localStorage.storeState) {
                this.state = JSON.parse(localStorage.storeState)
            } else { throw new Error() }
        } catch {
            localStorage.storeState = ''
            methods.setMsg("Can't restore last game.", { timeout: 5000, color: red })
        }
    },
    saveState() {
        if (localStorage.storeState)
            localStorage.undoState = localStorage.storeState
        localStorage.storeState = JSON.stringify(this.state)
    },
    undoState(el) {
        this.state = JSON.parse(localStorage.undoState)
    },
    init() {
        localStorage.undoState = ''
        if (localStorage.gameHistory) {
            this.gameHistory = JSON.parse(localStorage.gameHistory)
        }
    }
})

const methods = {
    togglePlayer() {
        this.setGamePaused(true)

        store.state.currPlayer = (store.state.currPlayer == 1 ? 2 : 1)

        setTimeout(() => {
            this.setGamePaused(false)
        }, 100);
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
    setMsg(msg = null, { timeout, color }) {
        store.state.msg = msg
        store.state.msgColor = color
        if (timeout) setTimeout(() => {
            store.state.msg = null
            store.state.msgColor = null
        }, timeout);
    },
    runChecks() {
        checkWinner(store.state.tiles, this)

        if (this.getWinner()) {
            this.setGameEnd(true)
            setTimeout(() => {
                this.setMsg(store.state.players[this.getWinner() - 1].name + " won the Game", { color: "green" })
            }, 200);
        } else if (this.getGameEnd()) {
            this.setGameEnd(true)
            setTimeout(() => {
                this.setMsg("Game finished!", { color: "red" })
            }, 200);
        }
    },
    playerSelectClick(el, _playerKey) {
        store.state.currPlayer = _playerKey
    },
    tileClick(el, { r, c }) {
        if (this.getGamePaused() || this.getGameEnd()) { return }

        if (c < 3) { r = 0 }
        else if (c < 6) { r = 1; c -= 3 }
        else if (c < 9) { r = 2; c -= 6 }

        store.state.tiles[r][c] = store.state.currPlayer

        this.runChecks()
        this.togglePlayer()
        setTimeout(() => {
            store.saveState()
        }, 200);
    },
    createNewMap() {
        store.state.currPlayer = null
        store.state.tiles = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        this.setWinner()
        this.setGameEnd(false)
    }
}

PetiteVue.
    createApp({
        store,
        methods
    }).mount("body");

store.init()

function checkWinner(a = [], methods) {
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
        methods.setWinner(_winner)
        return
    }

    if (!hasSpace) {
        methods.setGameEnd(true)
    }
}
