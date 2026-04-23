
const store = {
  users: [],
  habits: [],
  expenses: [],
  goals: [],
};

let mongoAvailable = false;

const setMongoAvailable = (v) => { mongoAvailable = v; };
const isMongoAvailable = () => mongoAvailable;

const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

module.exports = { store, newId, setMongoAvailable, isMongoAvailable };
