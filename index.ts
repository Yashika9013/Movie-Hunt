require("dotenv").config();
import Fluvio, { Offset, TopicProducer } from "@fluvio/client";
import axios from "axios";
import express, { Request, Response } from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";

const FLUVIO_TOPIC = "movie-stream";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

let producer: TopicProducer;

const initializeFluvio = async () => {
  try {
    const fluvio = new Fluvio();
    await fluvio.connect();

    producer = await fluvio.topicProducer(FLUVIO_TOPIC);
    console.log("Fluvio initialized and producer ready");
  } catch (error) {
    console.error("Failed to initialize Fluvio:", error);
  }
};

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
}

app.get("/popular", async (req: Request, res: Response) => {
  try {
    const url = 'https://api.themoviedb.org/3/movie/popular';
    const response = await axios.get(url, {
      params: {
        language: 'en-US',
        page: 1
      },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TOKEN_AUTH}`
      }
    });

    const movies = response.data.results.map((movie: Movie) => {
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      };
    });

    res.status(200).send(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send({ error: "Failed to fetch movies." });
  }
});

app.get("/search", async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send({ error: "Query parameter is required." });
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        query: query,
        include_adult: false,
        language: 'en-US',
        page: 1
      },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TOKEN_AUTH}`
      }
    });

    const movies = response.data.results.map((movie: Movie) => {
      const encodedTitle = encodeURIComponent(movie.title);
      const encodedId = encodeURIComponent(movie.id);

      return {
        id: movie.id,
        title: movie.title.substring(0, 50),
        description: movie.overview ? movie.overview.substring(0, 50) : "",
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        url: `https://www.themoviedb.org/movie/${encodedId}-${encodedTitle}`
      };
    });

    await producer.send("movie", JSON.stringify(movies[0]));

    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch movies." });
  }
});

const wss = new WebSocketServer({ server }); // Attach the WebSocket server to the HTTP server

wss.on("connection", (ws: any) => {
  console.log("WebSocket client connected");

  const streamMovies = async () => {
    try {
      const fluvio = new Fluvio();
      await fluvio.connect();

      const consumer = await fluvio.partitionConsumer("movie-stream", 0);

      // to discard old searches, we set offset from end
      await consumer.stream(Offset.FromEnd(), (record: any) => {
        const value = record.valueString();
        ws.send(value);
      });
    } catch (error) {
      console.error("Error consuming movies:", error);
    }
  };

  streamMovies();
});

server.listen(port, () => {
  console.log("Server running on port", port);
});

const startServer = async () => {
  await initializeFluvio();
};

startServer();
