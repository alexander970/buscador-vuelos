"use strict";

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
  try {
    if (code.length !== 3) {
      throw new Error("El código debe tener tres letras");
    }
    if (code in airports) {
      return true;
    }
    if (code !== NaN) {
      throw new Error("El código solo puede tener letras");
    } else {
      throw new Error(
        "El código introducido no corresponde a ningún aeropueto"
      );
    }
    if (code !== NaN) {
      throw new Error("El código solo puede tener letras");
    } else {
      throw new Error(
        "El código introducido no corresponde a ningún aeropueto"
      );
    }
  } catch (e) {
    console.error("Se ha producido un error " + e.message);
  }
}

fetch("./airports.json")
  .then((res) => res.json())
  .then((airports) => {
    console.log(validateIataCode(airports, "SCQ"));
    console.log(airports["SCQ"]);
    const code = "SCQ";
    const isCodeIataValid = validateIataCode(airports, "SCQ");

    if (isCodeIataValid === true) {
      console.log(airports[code]);
    }
  });

//Forms
function printAeropuertos(e) {
  e.preventDefault();
  console.log(origen.value);
  console.log(destino.value);
  this.reset();
}

const flightsForm = document.querySelector(".flightsForm");
const { origen, destino } = flightsForm.elements;

flightsForm.addEventListener("submit", printAeropuertos);