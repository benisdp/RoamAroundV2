// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  pointsOfInterestPrompt: any;
  itinerary: any;
};

type Error = {
  message: string;
};

const GPT_KEY = process.env.GPT_API_KEY;

const headers = {
  'Content-Type': 'application/json',
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

  const parts = city.split(' ');

  if (parts.length > 5) {
    throw new Error('please reduce size of request');
  }

  if (days > 10) {
    days = 10;
  }
  let basePrompt = `You are a travel guide that knows everything about ${city}. I am a tourist who has never visited ${city}. What is an ideal itinerary for ${days} days starting on ${startDate} in ${city} that includes all the city's main attractions, some historic and some adventerous? Break out your receommendation for each day into morning, afternoon and evening activities and recommend top rated restaurants. Always keep itineraries to under 500 words.`;
  try {
    if (!block) {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: basePrompt,
          temperature: 0,
          max_tokens: 550,
        }),
      });
      const itinerary = await response.json();
      const pointsOfInterestPrompt =
        'Extract the points of interest out of this text, with no additional words, separated by commas: ' +
        itinerary.choices[0].text;

      res.status(200).json({
        message: 'success',
        pointsOfInterestPrompt,
        itinerary: itinerary.choices[0].text,
      });
    } else {
      res.status(404).json({
        message: 'failure',
      });
    }
  } catch (err) {
    console.log('error: ', err);
  }
}
