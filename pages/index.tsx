import {
  Button,
  Container,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
  Dialog,
  DialogTitle,
} from '@material-ui/core';
import axios from 'axios';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import * as Yup from 'yup';
import TextField from '../components/form/TextField/TextField';

interface DataRow {
  Turno: number;
  Tavolo: string;
  Judge: string;
  'ID Giocatore': string;
  'Nome completo': string;
  Infrazione: string;
  Penalità: string;
  Descrizione: string;
}

const fetcher = (url: string) =>
  axios.get<{ rows: DataRow[] }>(url).then((res) => res.data);

const Home: NextPage = () => {
  const { data } = useSWR('/api/getPenalties', fetcher);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const playerPenalties = useMemo(
    () =>
      data?.rows.filter((row) => row['ID Giocatore'] === currentPlayerId) ?? [],
    [currentPlayerId, data?.rows],
  );

  useEffect(() => {
    if (playerPenalties.length > 0) setDialogOpen(true);
  }, [playerPenalties]);

  return (
    <Container fixed>
      <Head>
        <title>MTG Penalties</title>
        <meta name="description" content="Handle penalties for your event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>4 Season Summer 2021</h1>
        <h2>Penalità</h2>
        <Formik
          initialValues={{
            round: 0,
            table: '',
            judge: '',
            playerId: '',
            playerName: '',
            infraction: '',
            penalty: '',
            description: '',
          }}
          onSubmit={async (values, helpers) => {
            try {
              const res = await axios.post(
                '/api/addPenalty',
                { values },
                {
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                },
              );
              if (res.status === 200) {
                toast.success('Penalità inserita');
                helpers.resetForm();
                setCurrentPlayerId('');
              } else {
                console.error(res.data.error);
                toast.error("Errore durante l'inserimento della penalità");
                helpers.setSubmitting(false);
              }
            } catch (error) {
              console.error(error);
              toast.error("Errore durante l'inserimento della penalità");
              helpers.setSubmitting(false);
            }
          }}
          validationSchema={Yup.object({
            round: Yup.number()
              .min(1)
              .required('Il numero del turno è obbligatorio.'),
            table: Yup.string().required(
              'Il numero del tavolo è obbligatorio.',
            ),
            judge: Yup.string().required('Inserisci il tuo nome.'),
            playerId: Yup.string().required(
              'Inserisci numero DCI o un altro ID.',
            ),
            infraction: Yup.string().required("Inserisci l'infrazione."),
            penalty: Yup.string().required('Inserisci la penalità.'),
          })}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    id="round"
                    name="round"
                    type="number"
                    label="Turno"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="table"
                    name="table"
                    label="Tavolo"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="judge"
                    name="judge"
                    label="Nome del Judge"
                    required={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="playerId"
                    name="playerId"
                    label="ID del giocatore"
                    required={true}
                    onBlur={(e) => {
                      setCurrentPlayerId(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="playerName"
                    name="playerName"
                    label="Nome del giocatore"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="infraction"
                    name="infraction"
                    label="Infrazione"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="penalty"
                    name="penalty"
                    label="Penalità"
                    required={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="description"
                    name="description"
                    label="Descrizione"
                    multiline={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    Aggiungi
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
        <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen}>
          <DialogTitle>Attenzione</DialogTitle>
          <Box p={3}>
            Il giocatore indicato ha già ricevuto altre penalità oggi. Scorri la
            pagina fino in fondo per vederle.
          </Box>
        </Dialog>
        {playerPenalties.length > 0 && (
          <Box mb={4}>
            <h2>Penalità del giocatore</h2>
            <p>ID: {currentPlayerId}</p>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Turno</TableCell>
                    <TableCell>Infrazione</TableCell>
                    <TableCell>Penalità</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {playerPenalties.map((penalty, index) => (
                    <TableRow key={index}>
                      <TableCell>{penalty.Turno}</TableCell>
                      <TableCell>{penalty.Infrazione}</TableCell>
                      <TableCell>{penalty['Penalità']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </main>
    </Container>
  );
};

export default Home;
