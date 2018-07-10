(function(exports){

  exports.handleErrorsAndReturnJson = async response => {
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

  exports.clear = (el) => {
    if (el) {
        el.innerHTML = ''
    }
  }

  exports.enable = (el) => {
    el.disabled = false
  }

  exports.disable = (el) => {
    el.disabled = true
  }

  exports.hideEl = (el) => el.classList.add('hidden')
  exports.showEl = (el) => el.classList.remove('hidden')

  exports.getById = (el) => document.getElementById(el);

  exports.makeQuery = (obj) => {
    var k = Object.keys(obj);
    var s = "";
    for(var i=0;i<k.length;i++) {
        s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
        if (i != k.length -1) s += "&";
    }
    return s;
  }

  // export {handleErrorsAndReturnJson, disable, enable, hideEl, showEl, clear, getById}

})(typeof exports === 'undefined'? this['sharedFunctions']={}: exports);
