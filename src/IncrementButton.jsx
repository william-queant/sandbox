import React, {useState} from 'react'

const IncrementButton = props => {
  const [count, setCount] = useState(0)
  const {setter, getter} = props

  const increment = () => {
    if (setter) {
      setter()
    }
    setCount(currentState => currentState + (getter() ?? 1))
  }

  const label = `Increment me -> ${count}`

  return <button onClick={increment}>{label}</button>
}

export default IncrementButton
