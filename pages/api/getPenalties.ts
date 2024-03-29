import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function getPenalties(req: VercelRequest, res: VercelResponse) {
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
    const rows = await sheet.getRows();
    const data = rows.map((row) => ({
      Turno: row.Turno,
      Tavolo: row.Tavolo,
      Judge: row.Judge,
      'ID Giocatore': row['ID Giocatore'],
      'Nome completo': row['Nome completo'],
      Infrazione: row.Infrazione,
      Penalità: row['Penalità'],
      Descrizione: row.Descrizione,
    }));
    return res.json({ status: 200, rows: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      error: 'Error while getting data from Google Spreadsheet',
    });
  }
}

export default getPenalties;
