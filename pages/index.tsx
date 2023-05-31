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
} from '@material-ui/core';
import axios from 'axios';
import { Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import * as Yup from 'yup';
import { orderBy, omit } from 'lodash';
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

type Penalty = Omit<DataRow, 'ID Giocatore'>;

const fetcher = (url: string) =>
  axios.get<{ rows: DataRow[] }>(url).then((res) => res.data);

const Home: NextPage = () => {
  const { data, mutate } = useSWR('/api/getPenalties', fetcher, {
    refreshInterval: 5000,
  });
  // const [currentPlayerId, setCurrentPlayerId] = useState('');
  // const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<Penalty | null>(null);

  // const playerPenalties = useMemo(
  //   () =>
  //     data?.rows.filter((row) => row['ID Giocatore'] === currentPlayerId) ?? [],
  //   [currentPlayerId, data?.rows],
  // );

  // useEffect(() => {
  //   if (playerPenalties.length > 0) setDialogOpen(true);
  // }, [playerPenalties]);

  const penalties: Penalty[] = useMemo(() => {
    const noId = data?.rows.map((row) => omit(row, 'ID Giocatore')) ?? [];
    return orderBy(noId, ['Nome completo'], ['asc']);
  }, [data?.rows]);

  const dialogDataKeys: (keyof Penalty)[] =
    dialogData !== null ? (Object.keys(dialogData) as (keyof Penalty)[]) : [];

  return (
    <Container fixed>
      <Head>
        <title>Penalties - 4 Season</title>
        <meta name="description" content="Handle penalties for your event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Penalties - 4 Season</h1>
        <h2>New penalty</h2>
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
                toast.success('Penalty added');
                mutate();
                helpers.resetForm();
                // setCurrentPlayerId('');
              } else {
                console.error(res.data.error);
                toast.error('There was an error adding the penalty');
                helpers.setSubmitting(false);
              }
            } catch (error) {
              console.error(error);
              toast.error('There was an error adding the penalty');
              helpers.setSubmitting(false);
            }
          }}
          validationSchema={Yup.object({
            round: Yup.number()
              .min(1, 'Round must be greater than or equal to 1')
              .required('Round number is required'),
            table: Yup.string().required('Table number is required'),
            judge: Yup.string().required('Insert judge name'),
            // playerId: Yup.string().required(
            //   'Inserisci numero DCI o un altro ID.',
            // ),
            infraction: Yup.string().required('Insert infraction'),
            penalty: Yup.string().required('Insert penalty'),
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
                    label="Round"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="table"
                    name="table"
                    label="Table"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="judge"
                    name="judge"
                    label="Judge name"
                    required={true}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <TextField
                    id="playerId"
                    name="playerId"
                    label="ID del giocatore"
                    required={true}
                    onBlur={(e) => {
                      setCurrentPlayerId(e.target.value);
                    }}
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <TextField
                    id="playerName"
                    name="playerName"
                    label="Player name"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="infraction"
                    name="infraction"
                    label="Infraction"
                    required={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="penalty"
                    name="penalty"
                    label="Penalty"
                    required={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="description"
                    name="description"
                    label="Description"
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
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
        {penalties.length > 0 && (
          <Box mb={4}>
            <h2>Penalties sorted by player name</h2>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell padding="none">Round</TableCell>
                    <TableCell>Infraction</TableCell>
                    <TableCell>Penalty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {penalties.map((penalty, index) => (
                    <TableRow
                      key={index}
                      onClick={() => setDialogData(penalty)}
                    >
                      <TableCell>{penalty['Nome completo']}</TableCell>
                      <TableCell padding="none">{penalty.Turno}</TableCell>
                      <TableCell>{penalty.Infrazione}</TableCell>
                      <TableCell>{penalty['Penalità']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {dialogData !== null && (
          <Dialog onClose={() => setDialogData(null)} open={true}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableBody>
                  {dialogDataKeys.map((key) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row">
                        {columnNames[key] ?? key}
                      </TableCell>
                      <TableCell>{dialogData[key as keyof Penalty]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Dialog>
        )}
      </main>
    </Container>
  );
};

export default Home;

const columnNames: Record<keyof Penalty, string> = {
  Turno: 'Round',
  Tavolo: 'Table',
  Judge: 'Judge',
  // 'ID Giocatore': 'Player ID',
  'Nome completo': 'Player name',
  Infrazione: 'Infraction',
  Penalità: 'Penalty',
  Descrizione: 'Description',
};
