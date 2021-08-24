import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>MTG Penalties</title>
        <meta name="description" content="Handle penalties for your event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>4 Season Summer 2021</h1>
        <h2>Penalità</h2>
        <Formik
          initialValues={{
            round: 0,
            table: 0,
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
          validationSchema={Yup.object({})}
        >
          {({ isSubmitting }) => (
            <Form>
              <div>
                <div>
                  <label htmlFor="round">
                    Numero del <strong>turno</strong>
                  </label>
                  <div>
                    <Field id="round" name="round" type="number" />
                    <p>
                      <ErrorMessage name="round" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="table">
                    Numero del <strong>tavolo</strong>
                  </label>
                  <div>
                    <Field id="table" name="table" type="number" />
                    <p>
                      <ErrorMessage name="table" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="judge">Nome del Judge</label>
                  <div>
                    <Field id="judge" name="judge" />
                    <p>
                      <ErrorMessage name="judge" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="playerId">ID del giocatore</label>
                  <div>
                    <Field id="playerId" name="playerId" />
                    <p>
                      <ErrorMessage name="playerId" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="playerName">Nome del giocatore</label>
                  <div>
                    <Field id="playerName" name="playerName" />
                    <p>
                      <ErrorMessage name="playerName" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="infraction">Infrazione</label>
                  <div>
                    <Field id="infraction" name="infraction" />
                    <p>
                      <ErrorMessage name="infraction" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="penalty">Penalità</label>
                  <div>
                    <Field id="penalty" name="penalty" />
                    <p>
                      <ErrorMessage name="penalty" />
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="description">Descrizione</label>
                  <div>
                    <Field id="description" name="description" />
                    <p>
                      <ErrorMessage name="description" />
                    </p>
                  </div>
                </div>
                <div>
                  <button type="submit" disabled={isSubmitting}>
                    Aggiungi
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
};

export default Home;
