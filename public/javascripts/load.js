// $(document).ready(function() {
//
//   function abbrState(input, to){
//
//       var states = [
//           ['Arizona', 'AZ'],
//           ['Alabama', 'AL'],
//           ['Alaska', 'AK'],
//           ['Arizona', 'AZ'],
//           ['Arkansas', 'AR'],
//           ['California', 'CA'],
//           ['Colorado', 'CO'],
//           ['Connecticut', 'CT'],
//           ['Delaware', 'DE'],
//           ['Florida', 'FL'],
//           ['Georgia', 'GA'],
//           ['Hawaii', 'HI'],
//           ['Idaho', 'ID'],
//           ['Illinois', 'IL'],
//           ['Indiana', 'IN'],
//           ['Iowa', 'IA'],
//           ['Kansas', 'KS'],
//           ['Kentucky', 'KY'],
//           ['Louisiana', 'LA'],
//           ['Maine', 'ME'],
//           ['Maryland', 'MD'],
//           ['Massachusetts', 'MA'],
//           ['Michigan', 'MI'],
//           ['Minnesota', 'MN'],
//           ['Mississippi', 'MS'],
//           ['Missouri', 'MO'],
//           ['Montana', 'MT'],
//           ['Nebraska', 'NE'],
//           ['Nevada', 'NV'],
//           ['New Hampshire', 'NH'],
//           ['New Jersey', 'NJ'],
//           ['New Mexico', 'NM'],
//           ['New York', 'NY'],
//           ['North Carolina', 'NC'],
//           ['North Dakota', 'ND'],
//           ['Ohio', 'OH'],
//           ['Oklahoma', 'OK'],
//           ['Oregon', 'OR'],
//           ['Pennsylvania', 'PA'],
//           ['Rhode Island', 'RI'],
//           ['South Carolina', 'SC'],
//           ['South Dakota', 'SD'],
//           ['Tennessee', 'TN'],
//           ['Texas', 'TX'],
//           ['Utah', 'UT'],
//           ['Vermont', 'VT'],
//           ['Virginia', 'VA'],
//           ['Washington', 'WA'],
//           ['West Virginia', 'WV'],
//           ['Wisconsin', 'WI'],
//           ['Wyoming', 'WY'],
//       ];
//
//       if (to == 'abbr'){
//           input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
//           for(i = 0; i < states.length; i++){
//               if(states[i][0] == input){
//                   return(states[i][1]);
//               }
//           }
//       } else if (to == 'name'){
//           input = input.toUpperCase();
//           for(i = 0; i < states.length; i++){
//               if(states[i][1] == input){
//                   return(states[i][0]);
//               }
//           }
//       }
//   }
// $.get(`/api/venues`, (data, status) => {
// console.log(data);
//
//     $('#venuesList').empty()
//     data.forEach( venue => {
//       let urlText = (venue.url.split('/')[2] === 'www.facebook.com') ? 'facebook' : 'website'
//       let capText = venue.capacity ? venue.capacity : ''
//       let venueText = `${venue.venue}`
//       if (venue.diy) {
//         venueText = venueText + '*'
//       }
//
//       $('#venuesList').append($(`
//         <tr>
//           <td>${abbrState(venue.state, 'abbr')}</td>
//           <td>${venue.city}</td>
//           <td>${venueText}</td>
//           <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
//           <td>${capText}</td>
//           <td id=upVote${venue.id}>${venue.up} <button class='btn btn-default'> <i class="material-icons md-18">thumb_up</i></button></td>
//           <td id=downVote${data.id}>${venue.down}<button class='btn btn-default'><i class="material-icons md-18">thumb_down</i></button></td>
//         </tr>
//       `))
//     })
//   })
// })
