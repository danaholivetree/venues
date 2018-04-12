// $(document).ready( () => {
//
//   window.fbAsyncInit = function() {
//     FB.init({
//       appId      : '188770131749358',
//       cookie     : true,
//       xfbml      : true,
//       version    : 'v2.12'
//     });
//
//     FB.AppEvents.logPageView();
//     FB.getLoginStatus( (response) => {
//       console.log('response.status ', response.status);
//       console.log('response.authResponse ', response.authResponse);
//       statusChangeCallback(response)
//     })
//   };
//
//
//   const loginUser = () => {
//     console.log('in loginUser');
//     // FB.getLoginStatus( (response) => {
//     //   console.log('response.status ', response.status);
//     //   console.log('response.authResponse ', response.authResponse);
//     //   statusChangeCallback(response)
//     // })
//   }
//
//   const statusChangeCallback = ({status, authResponse}) => {
//     console.log('status', status);
//     if (status = 'connected') {
//       console.log('was logged in');
//       console.log('authResponse ', authResponse);
//       document.cookie = `fbAccessToken=${authResponse.accessToken}`
//       console.log('document.cookie.fbAccessToken ', document.cookie.fbAccessToken);
//     } else {
//       console.log('status wasnt connected ');
//       FB.login( ({status, authResponse}) => {
//         console.log('did login');
//         console.log('status', status);
//         if (authResponse) {
//           console.log(authResponse.accessToken);
//           console.log(authResponse.userId);
//         }
//
//       }, {scope: 'email,public_profile'})
//     }
//   }
//
//
//
//
//   // let tries = 0
//   // $('#loginForm').submit( e => {
//   //   e.preventDefault()
//   //   $.post(`/auth/login`, {email: $('#emailInput').val(), password: $('#pwInput').val()}, data => {
//   //     window.location = data.redirectURL
//   //   }).fail((err) => {
//   //     tries++
//   //     if (tries === 3) {
//   //       $('#errorMessage').html(`<div>Email tourpopsicle@gmail.com if you are having trouble logging in to your account.</div>`)
//   //     }
//   //     // if (tries > 5) {
//   //     //   $.post(`/auth/login/block`, {email: $('#emailInput').val()}, data => {
//   //     //     window.location = data.redirectURL
//   //     //   }
//   //     // }
//   //     $('#errorMessage').html(`<div class="alert alert-danger" role="alert">
//   //       ${err.responseText}</div>`)
//   //   })
//   // })
// })
