const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const { DB_URI, DB_NAME, JWT_SECRET } = process.env;

const getToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30 days' });

const getUserFromToken = async (token, db) => {
  if (!token) {
    return null
  }
  
  const tokenData = jwt.verify(token, JWT_SECRET);
  if (!tokenData?.id) {
    return null;
  }

  const user = await db.collection('Users').findOne({ _id: ObjectId(tokenData.id) })
  return user
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Query {
    myFriends: [User!]!
    mySchedules: [Schedule!]!
    getSchedule(id: ID!): Schedule
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthUser!
    signIn(input: SignInInput!): AuthUser!

    addFriend(friendId: ID!): User!
    deleteFriend(friendId: ID!): User!

    createSchedule(title: String!, primary: String!) : Schedule!
    updateSchedule(id: ID!, title: String!) : Schedule
    deleteSchedule(id: ID!): Boolean!

    createPlan(start: String!, end: String!, scheduleId: ID!) : Plan!
    updatePlan(id: ID!, start: String!, end: String!) : Plan!
    deletePlan(id: ID!) : Boolean!
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String!
    avatar: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type AuthUser {
    user: User!
    token: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String

    friends: [ID!]!
  }

  type Schedule {
    id: ID!
    userId: String!
    title: String!
    isPrimary: String!
    lastUpdated: String!
    plans: [Plan!]!
  }

  type Plan {
    id: ID!
    start: String!
    end: String!

    schedule: Schedule!
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    myFriends: async (_, __, { db, user }) => {
      if (!user) {
        throw new Error('Invalid Credentials!');
      }

      const friends = await db.collection('Users').find({ friends: { $eq: ObjectId(user._id) } }).toArray()
      return friends
    },
    mySchedules: async (_, __, { db, user }) => {
      if (!user) {
        throw new Error('Invalid Credentials!');
      }

      const schedules = await db.collection('Schedules').find({ userId: ObjectId(user._id)}).toArray()
      return schedules
    },
    getSchedule: async (_, { id }, { db, user }) => {
      if (!user) {
        throw new Error('Invalid Credentials!');
      }
      
      return await db.collection('Schedules').findOne({ _id: ObjectId(id) });
    }
  },
  Mutation: {
    // C User / Auth
    signUp: async (_, { input }, { db }) => {
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = {
        ...input, 
        password: hashedPassword,
        friends: []
      }
      
      // save to database
      const result = await db.collection('Users').insertOne(newUser);
      const user = await db.collection('Users').findOne({ _id: result.insertedId });
      
      return {
        user,
        token: getToken(user)
      }
    },
    signIn: async (_, { input }, { db }) => {
      const user = await db.collection('Users').findOne({ email: input.email });
      if (!user) {
        throw new Error('Invalid Credentials!');
      }
      
      // check if password is correct
      const isPasswordCorrect = bcrypt.compareSync(input.password, user.password)
      if (!isPasswordCorrect) {
        throw new Error('Invalid Credentials!');
      }

      return {
        user,
        token: getToken(user)
      }
    },

    // RUD User
    addFriend: async (_, { friendId }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      if (!await db.collection('Users').findOne({ _id: ObjectId(friendId) })) {
        throw new Error('Invalid UserId');
      }
      
      //need to check if already friends
      //can do something similar to a comprehension in python any(generator) use ObjectId().str to convert the ObjectId into a string
      /*console.log(user.friends.includes(ObjectId(friendId)))
      if (user.friends.includes(ObjectId(friendId))) {
        throw new Error('Already Friends')
      }*/

      await db.collection('Users').updateOne({ _id: ObjectId(friendId) }, { $push: {friends: user._id}});
      await db.collection('Users').updateOne({ _id: ObjectId(user._id) }, { $push: {friends: ObjectId(friendId)}});

      const newFriend = await db.collection('Users').findOne({ _id: ObjectId(friendId) });

      return newFriend
    },
    deleteFriend: async (_, { friendId }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      if (!await db.collection('Users').findOne({ _id: ObjectId(friendId) })) {
        throw new Error('Invalid UserId');
      }
      
      //need to check if friends
      //can do something similar to a comprehension in python any(generator) use ObjectId().str to convert the ObjectId into a string
      /*console.log(user.friends.includes(ObjectId(friendId)))
      if (user.friends.includes(ObjectId(friendId))) {
        throw new Error('Already Friends')
      }*/

      await db.collection('Users').updateOne({ _id: ObjectId(friendId) }, { $pull: { friends: user._id } });
      await db.collection('Users').updateOne({ _id: ObjectId(user._id) }, { $pull: { friends: ObjectId(friendId) } });

      const oldFriend = await db.collection('Users').findOne({ _id: ObjectId(friendId) });

      return oldFriend
    },

    // CRUD Schedule
    createSchedule: async (_, { title, primary }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      const newSchedule = {
        title,
        isPrimary: primary,
        lastUpdated: new Date().toISOString(),
        userId: user._id
      }

      const result = await db.collection('Schedules').insertOne(newSchedule);
      const schedule = await db.collection('Schedules').findOne({ _id: result.insertedId });

      return schedule
    },
    updateSchedule: async(_, { id, title }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      //TODO add in changes for lastupdated and option to set primary schedule
      await db.collection('Schedules').updateOne({ _id: ObjectId(id) }, { $set: { title } })
      const updatedSchedule = await db.collection('Schedules').findOne({ _id: ObjectId(id) });

      return updatedSchedule
    },
    deleteSchedule: async(_, { id }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }
      
      // TODO only owner of this schedule should be able to delete
      await db.collection('Schedules').deleteOne({ _id: ObjectId(id) });

      return true;
    },

    // CRUD Plan
    createPlan: async (_, { start, end, scheduleId }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      const newPlan = {
        start: start,
        end: end,
        scheduleId: ObjectId(scheduleId)
      }

      //TODO make schedule of plan change its last updated
      const result = await db.collection('Plans').insertOne(newPlan)
      const plan = await db.collection('Plans').findOne({ _id: result.insertedId }); 

      return plan
    },
    updatePlan: async(_, { id, start, end }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }

      await db.collection('Plans').updateOne({ _id: ObjectId(id) }, { $set: { start: start, end: end } })
      const updatedPlan = await db.collection('Plans').findOne({ _id: ObjectId(id) });

      return updatedPlan
    },
    deletePlan: async(_, { id }, { db, user }) => {
      if (!user) {
        throw new Error('Authentication Error');
      }
      
      // TODO only owner of this plan should be able to delete
      await db.collection('Plans').deleteOne({ _id: ObjectId(id) });

      return true;
    },
  },
  User: {
    id: ( { _id, id } ) => _id || id
  },
  Schedule: {
    id: ( { _id, id } ) => _id || id,
    plans: async ({ _id }, _, { db }) => (
      await db.collection('Plans').find({ scheduleId: ObjectId(_id)}).toArray()
    ), 
  },
  Plan: {
    id: ( { _id, id } ) => _id || id,
    schedule: async ({ scheduleId }, _, { db }) => (
      await db.collection('Schedules').findOne({ _id: ObjectId(scheduleId) })
    )
  },
};

const start = async () => {
  const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  await client.connect();
  const db = client.db(DB_NAME);

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: async ({ req }) => {
      const user = await getUserFromToken(req.headers.authorization, db);
      
      return {
        db,
        user,
      }
  } });

  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`????  Server ready at ${url}`);
  }); 
}

start();