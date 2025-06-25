
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createPetInputSchema, 
  updatePetInputSchema, 
  getPetInputSchema, 
  deletePetInputSchema 
} from './schema';
import { createPet } from './handlers/create_pet';
import { getPets } from './handlers/get_pets';
import { getPet } from './handlers/get_pet';
import { updatePet } from './handlers/update_pet';
import { deletePet } from './handlers/delete_pet';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new pet
  createPet: publicProcedure
    .input(createPetInputSchema)
    .mutation(({ input }) => createPet(input)),
  
  // Get all pets
  getPets: publicProcedure
    .query(() => getPets()),
  
  // Get a single pet by ID
  getPet: publicProcedure
    .input(getPetInputSchema)
    .query(({ input }) => getPet(input)),
  
  // Update an existing pet
  updatePet: publicProcedure
    .input(updatePetInputSchema)
    .mutation(({ input }) => updatePet(input)),
  
  // Delete a pet
  deletePet: publicProcedure
    .input(deletePetInputSchema)
    .mutation(({ input }) => deletePet(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
