

  const { states, abbrState } = usStates

  for (let i = 0; i < states.length; i++ ) {
    document.querySelectorAll('.stateSelector').forEach(el => el.innerHTML += `<option value='${states[i]}'>${states[i]}</option>`)
  }
