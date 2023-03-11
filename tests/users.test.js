const app = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();
const User = require("../models/user");

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
  await mongoose.connection.close();
});

// Test signup and verify that database contains new user

describe("POST /api/users/signup", () => {
    it("should return a user", async () => {
      const res = await request(app).post("/api/users/signup").send({
        name: "testuser",
        email: "test3@test.com",
        password: "test12345",
      });
  
      expect(res.statusCode).toBe(201);
      const user = await User.findById(res.body.userId);
      expect(res.body).toMatchObject({
        userId: user._id.toString(),
        email: "test3@test.com",
        token: expect.any(String),
        name: "testuser"
      });
      expect(res.body.token.length).toBeGreaterThan(5);
    });
  });


  // Test logging in.
  describe("POST /api/users/login", () => {
    it("Should return a valid authentication token", async () => {
    
      // Then, send a login request with the user's email and password
      const res = await request(app).post("/api/users/login").send({
        email: "test3@test.com",
        password: "test12345",
      });
  
      // Verify that the response contains a valid authentication token
      expect(res.statusCode).toBe(200);
      const user = await User.findById(res.body.userId);
      expect(res.body).toMatchObject({
                userId: user._id.toString(),
                email: "test3@test.com",
                token: expect.any(String),
              });
      expect(res.body.token.length).toBeGreaterThan(5);
    });
  });
