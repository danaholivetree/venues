// (function(exports){

  const handleErrorsAndReturnJson = async response => {
  console.log('response ', response);
  // console.log(response.ok ? 'response ok' : response.statusText);
  if (!response.ok || response.status != 200) {
    console.log('response.statusText', response.statusText);
    let err = await response.json()
    console.log('err' , err);
    throw new Error(err.message);
  } else {
    console.log('response.ok was true ', response.ok,' and response.status was 200 ', response.status);
    console.log('returning response.json() ');
    return response.json();
  }
}

  const clear = (el) => {
    if (el) {
        el.innerHTML = ''
    }
  }

  const enable = (el) => {
    el.disabled = false
  }

  const disable = (el) => {
    el.disabled = true
  }

  const hideEl = (el) => el.classList.add('hidden')
  const showEl = (el) => el.classList.remove('hidden')

  const getById = (el) => document.getElementById(el);

  export {handleErrorsAndReturnJson, disable, enable, hideEl, showEl, clear, getById}

// })(typeof exports === 'undefined'? this['sharedFunctions']={}: exports);
