(function(exports){


  exports.makeUppercase = str => str.split(' ').map( word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

  // const checkUrl = url => {
  //   if (url.split('/')[0] !== 'http:') {
  //     if (url.split('.')[0] !== 'www') {
  //       return `http://www.${url}`
  //     }
  //     else return `http://${url}`
  //   }
  //   else return url
  // }
  exports.addHttp = url => `http://${url}`
  exports.checkUrl = url => {
    const addHttp = url => `http://${url}`
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

  exports.checkEmail = email => {
    if (email.split('@').length !== 2 || email.split('@')[1].split('.').length !== 2) {
      alert('that\'s not an email!')
    } else {
      return email
    }
  }

  exports.endMessage  = () => {
    setTimeout(function() {
      $(".alert").alert('close')
     }, 2000)
  }


})(typeof exports === 'undefined'? this['helpers']={}: exports);
