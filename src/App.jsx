import React, {useState} from 'react'
import {battleShip} from './Battleship'
import IncrementButton from './IncrementButton'

export default function App() {
  const [count, setCount] = useState(0)

  const globalIncrement = () => setCount(currentState => currentState + 1)
  const globalCount = () => count

  const handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    console.log(e.target.textContent)
  }

  battleShip()

  return (
    <>
      <h1 onClick={handleClick}>Increments: {count}</h1>
      <IncrementButton setter={globalIncrement} getter={globalCount} />
      <IncrementButton setter={globalIncrement} getter={globalCount} />
    </>
  )
}
