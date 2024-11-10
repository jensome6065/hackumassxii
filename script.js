var msg;
function getText() {
  msg = document.getElementById("myInput").value;
  //console.log(msg)
  const q = encodeURIComponent(msg);
  const uri = 'https://api.wit.ai/message?v=20241109&q=' + q;
  const auth = 'Bearer ' + 'PCPZTOQEMZCHUIGVC6S3MUWQQEF7OTIA';
  var obj;
  fetch(uri, {headers: {Authorization: auth}}).then(res => res.json()).then(res => workWithJSON(res));
}

function workWithJSON(x) {
  console.log(x);
  var intent = "simply talk to bibi, but not use its functions";
  var bibisays = "something was typed";
  
  if (x.intents.length>0 && x.intents[0].confidence>0.8) {
    intent = x.intents[0].name;
  }
  console.log("this person wants to " + intent)
  
  var entity = "no entity";
  if (x.entities!=null) {
    if (intent == "add_activity") {
      entity = x.entities['activity:activity'][0].value
      
    } else { 
      entity = x.entities['meal:meal'][0].value;
    }
  } //gets entity
  
  if (intent == "add_meal") {
    if (entity != "no entity") {
    bibisays = "I'll let Trax know that you ate " + entity + " today -- hope it was tasty!";
    } else {
      bibisays = "Alright, Trax will be adding that food to today's records";
    }
  } else if (intent == "add_activity") {
    if (entity != "no entity") {
      bibisays = "Looks like you exercised " + entity + " today! Trax will be sure to log that <3";
    } else {
      bibisays = "Hmm... can you clarify if your activity was none, slight, moderate, or high for the day?";
    }
  } else if (intent == "get_calories") {
    if (entity == "no entity") {
      bibisays = "Well, based on your activity for the day, as well as what you already told me you ate, I think that you should have between x and y more calories today.";
    } else {
      bibisays = "Hungry for some " + entity + "? Trax says that you've already fulfilled this much of your nutrients today, and " + entity + " has this much of each macro, so use your judgment to decide if it's a good idea!";
    } 
  } else {
    bibisays = "Thanks for telling me! Remember, I can keep track of your daily nutrition and activity, as well as give you meal planning advice, but that's about the extent of my ability. Also, always stay hydrated";
  }
 
  document.getElementById("bibiresponse").innerHTML = bibisays;
  
}