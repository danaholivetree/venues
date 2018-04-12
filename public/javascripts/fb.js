// (function(exports){
//
//
//   const getFbInfo = url => {
//     let fbid
//     if (url.split('.')[1] === 'facebook') {
//       fbid = url.split('/')[3]
//       if (fbid.split('-').length > 1) {
//         fbid = fbid.split('-')
//         fbid = fbid[fbid.length-1]
//       }
//       console.log('fbid ', fbid);
//     } else {
//       fbid = url.split('.')[1]
//       console.log('trying fbid ', fbid);
//     }
//     $.get(`/token/facebook/venues/${fbid}`, data => {
//       console.log('data' , data);
//       // getEvents(data.events.data)
//       // checkForBookingEmail(data.about)
//       // if (data.emails) {
//       //   data.emails.filter( email => checkForBookingEmail(email))
//       // }
//     })
//   }
//
//
//   const checkForBookingEmail = (field) => {
//     let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
//     let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
//     // let book = /(booking)/gi
//     let booking = clean.split(' ').find( el => el.match(em))
//     console.log('booking ', booking);
//     if (booking && venueData.email !== booking) {
//       $('#email').show().val(booking)
//       let thisButton = $('#email').closest('div').prev('div').children().first()
//       thisButton.text('Save').toggleClass('save').toggleClass('edit')
//       thisButton.next().attr( "style", "display: block;" )
//   }
// }
//
// })(typeof exports === 'undefined'? this['helpers']={}: exports);
