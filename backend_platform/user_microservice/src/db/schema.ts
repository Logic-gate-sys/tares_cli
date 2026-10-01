import { pgTable, bytea, serial, varchar, text, integer,doublePrecision, timestamp } from 'drizzle-orm/pg-core';

//Users entity
export const Users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(), // hashed password
  playerLevel: varchar('p_level', { length: 50 }).default('1').notNull(),
  rank: varchar('rank', { length: 50 }).default('unranked').notNull(),
  bio: text('bio').default('').notNull(),
  totalScore: integer('total_score').default(0).notNull(),
  wins: doublePrecision('wins').default(0.0).notNull(),
  accuracy: integer('accuracy').default(0).notNull(),
  avatarUrl: text('avatar_url').default('').notNull(),
  bgClass: varchar('bg_class', { length: 250 }).default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login').defaultNow().notNull(),
});

export const Tokens = pgTable('tokens', {
  tokenHash: bytea('token_hash').primaryKey(),
  userId: integer('user_id').notNull().references(() => Users.id, { onDelete: 'cascade' }),
  expiry: timestamp('expiry', { precision: 0, withTimezone: true }).notNull(),
  scope: text('scope').notNull().default('authentication'), //  'authentication', 'password-reset'
});



// Schemas 
export type Token = typeof Tokens.$inferSelect;
export type NewToken = typeof Tokens.$inferInsert;

// 3. Strongly-typed TypeScript interfaces from Drizzle
export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;
