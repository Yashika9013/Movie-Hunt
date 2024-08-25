# Movie-Hunt 

Welcome to the Movie Hunt! This project leverages the TMDB (The Movie Database) API to fetch movie data, stream it in real time using Fluvio, and handle various backend operations. The application is designed to provide users with real-time updates and a seamless experience when exploring movies.

## Table of Contents

- [Project Overview](#project-overview)
- [API Integration](#api-integration)
- [Fluvio Streaming](#fluvio-streaming)
  - [Movie Stream Producer](#movie-stream-producer)
  - [Movie Stream Consumer](#movie-stream-consumer)
- [Configuration Files](#configuration-files)
  - [movie-stream-connector.yml](#movie-stream-connector.yml)
  - [transform.yml](#transform.yml)
- [Running the Project](#running-the-project)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Movie-Hunt is a backend service that integrates with the TMDB API to fetch and manage movie data. It uses Fluvio for real-time data streaming and provides a robust interface for movie-related operations.

## API Integration

### TMDB API

- **Base URL:** `https://api.themoviedb.org/3`
- **API Key:** [Obtain your API key from TMDB](https://www.themoviedb.org/settings/api)
- **Endpoints Used:**
  - `/movie/popular` - Fetch popular movies
  - `/movie/search/?query=movie_name` - get search with query

## Fluvio Streaming

Movie-Hunt utilizes Fluvio to handle real-time streaming of movie data.

### Movie Stream Producer

The `movie-stream-producer` produces movie data from the TMDB API and sends it to the Fluvio topic.

### Movie Stream Consumer

The `movie-stream-consumer` listens to the Fluvio topic and processes the movie data, performing necessary transformations and updates.

## Configuration Files

### `movie-stream-connector.yml`

