export function battleShip() {
  const boardSize = 8
  const areaSize = new Map([
    ['hit', 0],
    ['hot', 2],
    ['warm', 4],
    ['cold', boardSize - 1],
  ])
  const maxGuesses = 20

  // concidering the board as a 1D array
  const board1D = new Array(boardSize * boardSize).fill(0).map((_, i) => i)

  // Convert an index of the 1D board to a [Row,Col] position on a 2D board
  function getPositionFromIndex(number) {
    // out of board range
    if (number < 0 || number > board1D.length - 1) {
      return null
    }
    return [Math.floor(number / boardSize), number % boardSize]
  }
  // Convert a [Row,Col] position on the 2D board to an index of the 1D board
  function getIndexFromPosition([row, col]) {
    // out of board range
    if (row < 0 || row > boardSize - 1 || col < 0 || col > boardSize - 1) {
      return null
    }
    return row * boardSize + col
  }

  // Randomly place the ship on the 1D board
  function randomIndex(forbiddenIndex = -1) {
    const index = Math.floor(Math.random() * board1D.length)

    // if the index is the same as the forbidden index, try again
    if (index === forbiddenIndex) {
      return randomIndex(forbiddenIndex)
    }

    return index
  }

  class Ship {
    constructor(hit) {
      this.isSunk = false
      this.hit = [hit || randomIndex(hit)]
      this.hot = this.calculateArea(areaSize.get('hot'))
      this.warm = this.calculateArea(areaSize.get('warm'), this.hot)
      this.cold = this.calculateArea(areaSize.get('cold'), [
        ...this.hot,
        ...this.warm,
      ])
      this.fullBoard = this.fullBoardGeneration()
    }

    // calculate one cell area around the hit spot in the board
    calculateArea(areaSize, excludedIndexList = []) {
      const hitSpotPosition = getPositionFromIndex(this.hit[0])
      const hitSpotRow = hitSpotPosition[0]
      const hitSpotCol = hitSpotPosition[1]

      // loop through the area around the hit spot using array reduce to avoid using nested loops
      return board1D.reduce((acc, _, i) => {
        // exclude the more precise area
        if (excludedIndexList.includes(i) || i === this.hit[0]) {
          return acc
        }

        // get the position of the current index to make the calculation easier
        const [row, col] = getPositionFromIndex(i)
        if (
          row >= hitSpotRow - areaSize &&
          row <= hitSpotRow + areaSize &&
          col >= hitSpotCol - areaSize &&
          col <= hitSpotCol + areaSize
        ) {
          acc.push(i)
        }

        return acc
      }, [])
    }

    // inverse the index of the area to get the full board filled with answers to the user
    fullBoardGeneration() {
      return board1D.reduce(
        (acc, i) => (
          [...areaSize.keys()].forEach(key => {
            if (this[key].includes(i)) {
              acc[i] = key
              return
            }
          }),
          acc
        ),
        []
      )
    }

    // Warning return
    guessWarning(index) {
      return this.fullBoard[index]
    }
  }

  // Initialize the game
  function initgame() {
    const shipOne = new Ship(54) //randomIndex())
    const shipTwo = new Ship(29) //randomIndex(shipOne.hit[0]))
    const ships = [shipOne, shipTwo]

    // Guesses list
    let guesses = []

    // Html elements
    const guessesSubmit = document.getElementById('guessesSubmit')
    const guessesInput = document.getElementById('guessesInput')
    const guessesError = document.getElementById('guessesError')
    const guessesAnswer = document.getElementById('guessesAnswer')
    const guessesHistory = document.getElementById('guessesHistory')

    function resolveGuess(shipList, guessIndex) {
      const warningOfAllShips = [
        ...new Set(shipList.map(ship => ship.guessWarning(guessIndex))),
      ]

      return [...areaSize.keys()].filter(warning =>
        warningOfAllShips.includes(warning)
      )[0]
    }

    // handle submit
    guessesSubmit.addEventListener('click', e => {
      e.preventDefault()

      guessesError.innerHTML = ''
      guessesAnswer.innerHTML = ''

      const guess = guessesInput.value?.split(',').map(Number)

      // early return if the input is not valid
      if (guess.length !== 2 || guess.some(isNaN)) {
        guessesError.innerHTML = 'Please enter a valid guess'
        return
      }

      // Get the hotest guess
      const guessIndex = getIndexFromPosition(guess)
      const hotestGuess = resolveGuess(
        ships.filter(ship => ship.isSunk === false),
        guessIndex
      )

      // Sunk a ship if the guess is a hit
      if (hotestGuess === 'hit') {
        ships
          .filter(ship => ship.isSunk === false)
          .find(ship => ship.hit === guessIndex).isSunk = true
      }

      // Add the guess to the guesses list
      guesses.push({
        index: guesses.length + 1,
        guess: guess,
        guessIndex: guessIndex,
        result: hotestGuess,
        shipsLeft: ships.filter(ship => ship.isSunk === false).length,
      })

      // Display the history
      guessesHistory.innerHTML = `<ul>Your guesses (${maxGuesses - guesses.length} left):${guesses
        .reverse()
        .map(
          ({index, guess, result, shipsLeft}) =>
            `<li>${index} => ${guess}: ${result}${result === 'hit' ? `${shipsLeft} Ships Left` : ''}</li>`
        )}</ul>`

      // End of the game: You win
      if (ships.every(ship => ship.isSunk === true)) {
        guessesAnswer.innerHTML = 'You win'
        return
      }

      // End of the round: You sunk a ship
      if (hotestGuess === 'hit') {
        guessesAnswer.innerHTML = 'You sunk a ship!'
        return
      }

      // End of the game: You lose
      if (guesses.length === maxGuesses) {
        guessesAnswer.innerHTML = 'You lose, too many guesses'
        return
      }

      // Display the answer
      guessesAnswer.innerHTML = hotestGuess

      //54 [6,6]
      //29 [3,5]
    })
  }

  document.body.innerHTML = ` 
  <div id="guessesWrapper">
    <fieldset>
        <legend><h2>BattleShip - Make your guess</h2></legend>
        <p>The board is 8x8<br>
        Enter your guess in the form of [Row,Col] (e.g. 5,8)</p>
        <input id="guessesInput" type="text" placeholder="5,8" size="3" maxlength="3" pattern="[0-8]{1},[0-8]{1}" required autofocus>
        <input id="guessesSubmit" type="button" value="Submit your guesses"/>
    </fieldset>
    <h6 id="guessesError" style="color:red"></h6>
    <h1 id="guessesAnswer"></h1>
    <div id="guessesHistory"/>
  </div>
  `

  initgame()
}
