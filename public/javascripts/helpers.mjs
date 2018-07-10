// (function(exports){
  const fillStates = () => {
    for (let i = 0; i < states.length; i++ ) {
      document.querySelectorAll('.stateSelector').forEach(el => el.innerHTML += `<option value='${states[i]}'>${states[i]}</option>`)
    }
  }

  const makeUppercase = str => str.split(' ').map( word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

  // const checkUrl = url => {
  //   if (url.split('/')[0] !== 'http:') {
  //     if (url.split('.')[0] !== 'www') {
  //       return `http://www.${url}`
  //     }
  //     else return `http://${url}`
  //   }
  //   else return url
  // }
   const addHttp = url => `https://${url}`
   const checkUrl = url => {
    const addHttp = url => `https://${url}`
    const addWww = url => {
      return `${url.split('/').slice(0,2).join('/')}/www.${url.split('/').slice(2).join('')}`}
    if (url.split('/')[0] !== 'http:' && url.split('/')[0] !== 'https:') {
      url = addHttp(url)
    }
    if (url.split('/')[2].slice(0,3) !== 'www' && url.split('/')[2].split('.')[1] !== 'bandcamp' && url.split('/')[2].split('.')[1] !== 'spotify') {
      url = addWww(url)
    }
    return url
  }

   const checkEmail = email => {
    if (email.split('@').length !== 2 || email.split('@')[1].split('.').length !== 2) {
      alert('that\'s not an email!')
    } else {
      return email
    }
  }


   const endMessage  = () => {
    setTimeout(function() {
      $(".alert").alert('close')
     }, 2000)
  }

   const copyToClipboard = (text, el) => {
    var copyTest = document.queryCommandSupported('copy');
    var elOriginalText = el.getAttribute('data-original-title');

    if (copyTest === true) {
      var copyTextArea = document.createElement("textarea");
      copyTextArea.value = text;
      document.body.appendChild(copyTextArea);
      copyTextArea.select();
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'Copied!' : 'Unable to copy';
        el.setAttribute('data-original-title', msg)
        console.log(msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
      document.body.removeChild(copyTextArea);
      el.setAttribute('data-original-title', elOriginalText);
    } else {
      // Fallback if browser doesn't support .execCommand('copy')
      window.prompt("Copy to clipboard: Ctrl+C or Command+C, Enter", text);
    }
  }

export {fillStates, makeUppercase, addHttp, checkUrl, checkEmail, endMessage, copyToClipboard};
// })(typeof exports === 'undefined'? this['helpers']={}: exports);
