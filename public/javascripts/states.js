(function(exports){


    exports.states = ['All','Alabama','Alaska','Arizona','Arkansas','California','Colorado',
    'Connecticut','Delaware','DC','Florida','Georgia','Hawaii','Idaho','Illinois',
    'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
    'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana',
    'Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
    'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
    'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
    'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

    exports.abbrState = (input, to) => {

      var states = [
          ['Arizona', 'AZ'],
          ['Alabama', 'AL'],
          ['Alaska', 'AK'],
          ['Arizona', 'AZ'],
          ['Arkansas', 'AR'],
          ['California', 'CA'],
          ['Colorado', 'CO'],
          ['Connecticut', 'CT'],
          ['Delaware', 'DE'],
          ['Florida', 'FL'],
          ['Georgia', 'GA'],
          ['Hawaii', 'HI'],
          ['Idaho', 'ID'],
          ['Illinois', 'IL'],
          ['Indiana', 'IN'],
          ['Iowa', 'IA'],
          ['Kansas', 'KS'],
          ['Kentucky', 'KY'],
          ['Louisiana', 'LA'],
          ['Maine', 'ME'],
          ['Maryland', 'MD'],
          ['Massachusetts', 'MA'],
          ['Michigan', 'MI'],
          ['Minnesota', 'MN'],
          ['Mississippi', 'MS'],
          ['Missouri', 'MO'],
          ['Montana', 'MT'],
          ['Nebraska', 'NE'],
          ['Nevada', 'NV'],
          ['New Hampshire', 'NH'],
          ['New Jersey', 'NJ'],
          ['New Mexico', 'NM'],
          ['New York', 'NY'],
          ['North Carolina', 'NC'],
          ['North Dakota', 'ND'],
          ['Ohio', 'OH'],
          ['Oklahoma', 'OK'],
          ['Oregon', 'OR'],
          ['Pennsylvania', 'PA'],
          ['Rhode Island', 'RI'],
          ['South Carolina', 'SC'],
          ['South Dakota', 'SD'],
          ['Tennessee', 'TN'],
          ['Texas', 'TX'],
          ['Utah', 'UT'],
          ['Vermont', 'VT'],
          ['Virginia', 'VA'],
          ['Washington', 'WA'],
          ['West Virginia', 'WV'],
          ['Wisconsin', 'WI'],
          ['Wyoming', 'WY'],
      ];

      if (to == 'abbr'){
          input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
          for(i = 0; i < states.length; i++){
              if(states[i][0] == input){
                  return(states[i][1]);
              }
          }
      } else if (to == 'name'){
          input = input.toUpperCase();
          for(i = 0; i < states.length; i++){
              if(states[i][1] == input){
                  return(states[i][0]);
              }
          }
      }
    }

    exports.genreKeywords = [ 'Psych','Rock','Americana','Indie','Blues','Bluegrass',
    'Zombie','Death','Polka','Prog','Lo-fi','Pop','Indie','Shoe-Gaze','Glam',
    'Experimental','Slow','Eclectic','Orchestral','Cello', 'Freak', 'Folk',
    'Ambient','Classic','Rap','R&B','Hip-hop','Dark','Dream','Electro','Power',
    'Rock & Roll','Surf','Vintage','Country','Swing','Blues','Experimental','Punk',
    'Metal', 'Hardcore', 'Noise', 'Electronic', 'Jam', 'Classical',
    'Singer-songwriter', 'Jazz', 'Math', 'Synth', 'Goth', 'Opera', 'Rockabilly',
    'Swing', 'Ragtime', 'Post-rock', 'Steampunk', 'Avant', 'World', 'Emo' ]



})(typeof exports === 'undefined'? this['usStates']={}: exports);
