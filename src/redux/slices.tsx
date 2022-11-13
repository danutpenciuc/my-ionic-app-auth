import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Movie } from '../movies/movie'
import { MovieExt } from '../movies/movieExt';


const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
          headers.set("authorization", `Bearer ${token.slice(1, -1)}`);
      }
      return headers;
  }
});

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: ['Movies'],
    endpoints: (builder) => ({
        getMovies: builder.query<Movie[], void>({
            query: () => '/api/movie',
            transformResponse: (res: Movie[])=> res.sort((a, b) => b.name.localeCompare(a.name)),
            providesTags: ['Movies']
        }),
        addMovies: builder.mutation({
            query: (movie: MovieExt) => ({
                url: '/api/movie',
                method: 'POST',
                body: movie
            }),
            invalidatesTags: ['Movies']
        }),
        updateMovies: builder.mutation({
            query: (movie: MovieExt) => ({
                url: `/api/movie/${movie._id}`,
                method: 'PUT',
                body: movie
            }),
            invalidatesTags: ['Movies']
        }),
        deleteMovie: builder.mutation({
            query: (id: string) => {
              return ({
                url: `/api/movie/${id}`,
                method: 'DELETE'
            })
          },
            invalidatesTags: ['Movies']
        }),
    })
})

export const {
    useGetMoviesQuery,
    useAddMoviesMutation,
    useUpdateMoviesMutation,
    useDeleteMovieMutation
} = apiSlice