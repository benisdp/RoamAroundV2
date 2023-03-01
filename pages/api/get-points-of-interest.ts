// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  pointsOfInterest?: any;
  message?: string;
};

const GPT_KEY = process.env.GPT_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${GPT_KEY}`,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { pointsOfInterestPrompt, block } = JSON.parse(req.body);

  try {
    if (!block) {
      const response2 = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: pointsOfInterestPrompt,
          temperature: 0,
          max_tokens: 300,
        }),
      });

      let pointsOfInterest = await response2.json();

      pointsOfInterest = pointsOfInterest.choices[0].text.split('\n');
      pointsOfInterest = pointsOfInterest[pointsOfInterest.length - 1];
      pointsOfInterest = pointsOfInterest.split(',');
      const pointsOfInterestArray = pointsOfInterest.map((i) => i.trim());

      res.status(200).json({
        pointsOfInterest: JSON.stringify(pointsOfInterestArray),
      });
    } else {
      res.status(404).json({
        message: 'failure',
      });
    }
  } catch (err) {
    console.log(err);
  }
}
