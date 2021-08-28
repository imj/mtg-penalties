import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function addPenalty(req: VercelRequest, res: VercelResponse) {
  try {
    req.body;
  } catch (error) {
    return res.status(400).json({ status: 400, error: 'Malformed json.' });
  }
  const {
    round,
    table,
    judge,
    playerId,
    playerName,
    infraction,
    penalty,
    description,
  } = req.body.values;

  if (!round || !table || !judge || !infraction || !penalty) {
    return res.status(422).json({ status: 422, error: 'Missing infos.' });
  }

  const {
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    SPREADSHEET_ID,
    SHEET_TITLE,
  } = process.env;

  if (!SPREADSHEET_ID) {
    return res
      .status(500)
      .json({ status: 500, error: 'Invalid Google Spreadsheet ID.' });
  }
  if (!SHEET_TITLE) {
    return res.status(500).json({ status: 500, error: 'Invalid Sheet Title.' });
  }
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return res
      .status(500)
      .json({ status: 500, error: 'Invalid Google Credentials.' });
  }

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
  try {
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    await sheet.addRow([
      round,
      table,
      judge,
      playerId,
      playerName,
      infraction,
      penalty,
      description,
    ]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      error: 'Error while posting to Google Spreadsheet',
    });
  }
  return res.json({ status: 200 });
}

export default addPenalty;
