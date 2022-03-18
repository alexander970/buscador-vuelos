"use strict";

function convertDateToApiFormat(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthPadded = month.toString().padStart(2, "0");
  const day = date.getDate();
  const apiDate = `${year}-${monthPadded}-${day}`;

  return apiDate;
}

function convertDateFromApiFormat(rawDate) {
  const date = new Date(rawDate);
  const options = {
    month: "numeric",
    year: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const localDate = date.toLocaleString("es-ES", options);

  return localDate;
}

async function getFlightOffers(
  accessToken,
  originAirportIata,
  destinationAirportIata,
  departureDate
) {
  try {
    const departureDateFormatted = convertDateToApiFormat(departureDate);

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originAirportIata}&destinationLocationCode=${destinationAirportIata}&departureDate=${departureDateFormatted}&adults=1&nonStop=false&max=250`,

      {
        method: "GET",
        headers: {
          accept: "application/vnd.amadeus+json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw "Ha ocurrido un error al intentar obtener las ofertas de los vuelos.";
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw "Ha ocurrido un error al intentar obtener las ofertas de los vuelos.";
  }
}

async function getAmadeusApiToken() {
  try {
    const response = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(
          "2GWP7ADgQGQ4iyFZWi1XwaINtedn96PK"
        )}&client_secret=${encodeURIComponent("qkCP4skIgwt5s7AD")}`,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      throw "Ha ocurrido un error al intentar obtener el token.";
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw "Ha ocurrido un error al intentar obtener el token.";
  }
}

Date.prototype.nextDay = function () {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + 1);
  return date;
};

function getNextDayDate() {
  const currentDate = new Date();
  const nextDayDate = currentDate.nextDay();
  return nextDayDate;
}

async function getFlightOffersWithToken(
  originAirportIata,
  destinationAirportIata
) {
  //Autorizacion de API buscador de vuelos de Amadeus
  const tokenData = await getAmadeusApiToken();
  const accessToken = tokenData["access_token"];

  //Obtener la fecha de mañana
  const departureDate = getNextDayDate();

  //Obtener ofertas de vuelo desde la API
  const flightOffers = await getFlightOffers(
    accessToken,
    originAirportIata,
    destinationAirportIata,
    departureDate
  );

  return flightOffers.data;
}

function displayError(message) {
  const offer = document.querySelector(".offer");
  offer.innerText = message;
}

async function getAirports() {
  try {
    const response = await fetch("./airports.json");

    if (!response.ok) {
      throw "Ha ocurrido un error al intentar obtener los aeropuertos.";
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw "Ha ocurrido un error al intentar obtener los aeropuertos.";
  }
}

async function getAirlines() {
  try {
    const response = await fetch("./airlines.json");

    if (!response.ok) {
      throw "Ha ocurrido un error al intentar obtener las aerolíneas.";
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw "Ha ocurrido un error al intentar obtener las aerolíneas.";
  }
}

function displayCheapestFlight(
  originAirportName,
  destinationAirportName,
  airlineName,
  price,
  departureDate
) {
  const offer = document.querySelector(".offer");
  const timeElement = document.querySelector(".time");
  const airlineElement = document.querySelector(".airline");
  const priceElement = document.querySelector(".price");

  offer.innerText = `El vuelo más económico para mañana entre ${originAirportName} y ${destinationAirportName} es:`;
  airlineElement.innerText = `Aerolinea: ${airlineName}`;
  priceElement.innerText = `Precio: ${price} €`;
  timeElement.innerText = `Horario: ${departureDate}`;
}

function clearCheapestFlight() {
  const offer = document.querySelector(".offer");
  const timeElement = document.querySelector(".time");
  const airlineElement = document.querySelector(".airline");
  const priceElement = document.querySelector(".price");

  offer.innerText = "";
  airlineElement.innerText = "";
  priceElement.innerText = "";
  timeElement.innerText = "";
}

function getAndDisplayCheapestFlight(
  airlines,
  originAirport,
  destinationAirport
) {
  getFlightOffersWithToken(originAirport.IATA, destinationAirport.IATA)
    .then((flightOffers) => {
      if (flightOffers.length > 0) {
        const flightOffersSorted = [...flightOffers];
        flightOffersSorted.sort(
          (offerA, offerB) => offerA.price.grandTotal - offerB.price.grandTotal
        );
        const cheapestFlightOffer = flightOffersSorted[0];

        const airlineCode =
          cheapestFlightOffer.validatingAirlineCodes[0].toUpperCase();
        const airlineName =
          airlineCode in airlines ? airlines[airlineCode] : airlineCode;
        const price = cheapestFlightOffer.price.grandTotal;
        const departureDate =
          cheapestFlightOffer.itineraries[0].segments[0].departure.at;
        const localDepartureDate = convertDateFromApiFormat(departureDate);

        displayCheapestFlight(
          originAirport.Name,
          destinationAirport.Name,
          airlineName,
          price,
          localDepartureDate
        );
      } else {
        offer.innerText = `No hay vuelos para mañana entre ${originAirport.Name} y ${destinationAirport.Name}`;
      }
    })
    .catch(displayError);
}

//Función de validación
function validateIataCodes(
  airports,
  originAirportIata,
  destinationAirportIata
) {
  const isOriginAirportIataValid = originAirportIata in airports;
  const isDestinationAirportIataValid = destinationAirportIata in airports;

  return { isOriginAirportIataValid, isDestinationAirportIataValid };
}

function displayCheapestFlightIfValid(
  airports,
  airlines,
  originAirportIata,
  destinationAirportIata
) {
  const { isOriginAirportIataValid, isDestinationAirportIataValid } =
    validateIataCodes(airports, originAirportIata, destinationAirportIata);

  if (isOriginAirportIataValid && isDestinationAirportIataValid) {
    const originAirport = {
      IATA: originAirportIata,
      Name: airports[originAirportIata],
    };

    const destinationAirport = {
      IATA: destinationAirportIata,
      Name: airports[destinationAirportIata],
    };

    getAndDisplayCheapestFlight(airlines, originAirport, destinationAirport);
  } else {
    if (isOriginAirportIataValid) {
      displayError(
        `El código de aeropuerto "${destinationAirportIata}" no es válido.`
      );
    } else {
      displayError(`El código aeropuerto "${originAirportIata}" no es válido.`);
    }
  }
}

//Forms
function handleFlightsFormSubmit(e) {
  e.preventDefault();

  const originAirportIata = origenInput.value.toUpperCase();
  const destinationAirportIata = destinoInput.value.toUpperCase();

  clearCheapestFlight();

  getAirports()
    .then((airports) => {
      getAirlines().then((airlines) => {
        displayCheapestFlightIfValid(
          airports,
          airlines,
          originAirportIata,
          destinationAirportIata
        );
      });
    })
    .catch((error) => {
      displayError(error);
    });
}

const flightsForm = document.querySelector(".flightsForm");
const { origen: origenInput, destino: destinoInput } = flightsForm.elements;

flightsForm.addEventListener("submit", handleFlightsFormSubmit);
