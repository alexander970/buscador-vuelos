"use strict";
console.log("hello world");

//Autorizacion de API buscador de vuelos de Amadeus
fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
  method: "POST",
  body: `grant_type=client_credentials&client_id=${encodeURIComponent(
    "2GWP7ADgQGQ4iyFZWi1XwaINtedn96PK"
  )}&client_secret=${encodeURIComponent("qkCP4skIgwt5s7AD")}`,
  headers: {
    "Content-type": "application/x-www-form-urlencoded",
  },
})
  .then(function (response) {
    if (response.ok) {
      return response.json();
    }
    throw response;
  })
  .then(function (data) {
    console.log(data);
    console.log(data["access_token"]);
  })
  .catch(function (error) {
    console.error(error);
  });



  //Validation function
function validateIataCode(airports, code) {
  if (code.length !== 3) {
    return false;
  }
  if (code in airports) {
    return true;
  } else {
    return false;
  }
}

fetch("./airports.json")
  .then((res) => res.json())
  .then((airports) => {
    console.log(validateIataCode(airports, "MAD"));
    console.log(airports["MAD"]);
    const code = "MAD";
    const isCodeIataValid = validateIataCode(airports,"MAD");
    if (isCodeIataValid ===true){
      console.log(airports[code]);
    }
    
  });