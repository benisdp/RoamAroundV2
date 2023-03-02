// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import destinations from "../../destinations.json";

type Data = {
  message: string;
  pointsOfInterestPrompt: any;
  itinerary: any;
  products: any;
};

type Error = {
  message: string;
};

const GPT_KEY = process.env.GPT_API_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${GPT_KEY}`,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  let days, city, startDate, block;
  if (req.body) {
    let body = JSON.parse(req.body);
    days = body.days;
    city = body.city;
    startDate = body.startDate;
    block = body.block;
  }

  const lowercaseCity = city.toLowerCase();

  // const destination = destinations.find(city);
  const destination = destinations.find(
    (element) => element.destinationName.toLowerCase() == lowercaseCity
  );

  const parts = city.split(" ");

  if (parts.length > 5) {
    throw new Error("please reduce size of request");
  }

  if (days > 10) {
    days = 10;
  }

  let basePrompt = `You are a travel guide that knows everything about ${city}. I am a tourist who has never visited ${city}. What is an ideal itinerary for ${days} days starting on ${startDate} in ${city} that includes all the city's main attractions, some historic and some adventerous? Break out your receommendation for each day into morning, afternoon and evening activities and recommend top rated restaurants. Always keep itineraries to under 500 words.`;

  try {
    if (!block) {
      const chatGPTBasePrompt = await fetch(
        "https://api.openai.com/v1/completions",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: basePrompt,
            temperature: 0,
            max_tokens: 550,
          }),
        }
      );

      let products;

      if (destination) {
        const productsResponse = await axios.post(
          "https://api.viator.com/partner/products/search",
          {
            filtering: {
              destination: destination?.destinationId,
              highestPrice: 500,
              startDate: "2023-03-25",
              endDate: "2023-03-28",
              includeAutomaticTranslations: true,
              confirmationType: "INSTANT",
              rating: {
                from: 2,
                to: 5,
              },
            },
            sorting: {
              sort: "TRAVELER_RATING",
              order: "DESCENDING",
            },
            pagination: {
              start: 1,
              count: 100,
            },
            currency: "USD",
          },
          {
            headers: {
              "exp-api-key": "b84aaf4c-cb81-4fd0-92f9-814575de4553",
              "Accept-Language": "en-US",
              Accept: "application/json;version=2.0",
              "Content-Type": "application/json",
            },
          }
        );

        products = productsResponse.data;
      }

      const itinerary = await chatGPTBasePrompt.json();

      console.log(itinerary.choices);

      console.log({ products });

      // const productsJSON = await products.json();

      const pointsOfInterestPrompt =
        "Extract the points of interest out of this text, with no additional words, separated by commas: " +
        itinerary.choices[0].text;

      res.status(200).json({
        message: "success",
        pointsOfInterestPrompt,
        itinerary: itinerary.choices[0].text,
        products: products,
      });
    } else {
      res.status(404).json({
        message: "failure",
      });
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
