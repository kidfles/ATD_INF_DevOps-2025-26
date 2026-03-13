db = db.getSiblingDB('mydb');

db.users.drop();

db.users.insertMany([
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
  { name: 'Admin User', email: 'admin@example.com' }
]);

print('Database "mydb" seeded with initial users.');
