"use strict";

function loadFlightOffers(originAirportIata, destinationAirportIata) {
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
      const accessToken = data["access_token"];

      fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originAirportIata}&destinationLocationCode=${destinationAirportIata}&departureDate=2022-11-01&adults=1&nonStop=false&max=250`,
        {
          method: "GET",
          headers: {
            accept: "application/vnd.amadeus+json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
        .then(function (response2) {
          if (response2.ok) {
            return response2.json();
          }
          throw response2;
        })
        .then(function (flightOffers) {
          displayCheapestFlight(flightOffers.data);
        })
        .catch(function (error) {
          console.error(error);
        });
    });
}

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
  console.log(origenInput.value);
  console.log(destinoInput.value);

  const originAirportIata = origenInput.value.toUpperCase();
  const destinationAirportIata = destinoInput.value.toUpperCase();
  const originAirport = document.querySelector(".origin");
  const destinationAirport = document.querySelector(".destination");

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
      originAirport.innerText = `Aeropuerto de origen: ${airports[originAirportIata]}`;
      destinationAirport.innerText = `Aeropuerto de destino: ${airports[destinationAirportIata]}`;
      loadFlightOffers(originAirportIata, destinationAirportIata);
    });

  this.reset();
}

const flightsForm = document.querySelector(".flightsForm");
const { origen: origenInput, destino: destinoInput } = flightsForm.elements;

flightsForm.addEventListener("submit", printAeropuertos);

function displayCheapestFlight(flightOffers) {
  const flightOffersSorted = [...flightOffers];
  flightOffersSorted.sort(
    (offerA, offerB) => offerA.price.grandTotal - offerB.price.grandTotal
  );
  const cheapestFlightOffer = flightOffersSorted[0];
  console.log(cheapestFlightOffer);

  const airline = document.querySelector(".airline");
  const price = document.querySelector(".price");
  airline.innerText = `Aerolinea: ${cheapestFlightOffer.validatingAirlineCodes[0]}`;
  price.innerText = `Precio: ${cheapestFlightOffer.price.grandTotal} €`;
}
