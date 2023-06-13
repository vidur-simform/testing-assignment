const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

describe("User Tests", () => {
  let testUser;

  beforeAll(async () => {
    testUser = {
      name: "vaibhav",
      email: "vaibhav123@gmail.com",
      password: "vaibhav123",
    };
    await User.create(testUser);
  });

  afterAll(async () => {
    await User.deleteOne({ name: "vaibhav" });
    await User.deleteOne({ name: "Harsh" });
  });

  describe("SignUp Functionalities", () => {
    it("Should create a new User", () => {
      const newUser = {
        name: "Harsh",
        email: "harsh123@gmail.com",
        password: "harsh123",
      };

      return request(app)
        .post("/auth/signUp")
        .send(newUser)
        .expect("Content-type", /json/)
        .expect(201)
        .then((response) => {
          expect(response.body.name).toEqual("Harsh");
          expect(response.body.email).toEqual("harsh123@gmail.com");
          expect(response.body).toHaveProperty("password");
        });
    });

    it("Should return an error if enough data is not provided", () => {
      const inCompleteData = {
        email: "harsh123@gmail.com",
        password: "harsh123",
      };
      return request(app)
        .post("/auth/signUp")
        .send(inCompleteData)
        .expect("Content-type", /json/)
        .expect((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: "Please provide all the necessary fileds.",
            })
          );
        });
    });

    it("Should return an error if user with that email already exist. ", () => {
      const alreadyExist = {
        name: "vaibhav",
        email: "vaibhav123@gmail.com",
        password: "vaibhav123",
      };
      return request(app)
        .post("/auth/signUp")
        .send(alreadyExist)
        .expect("Content-type", /json/)
        .expect((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: "User with this email already exist.",
            })
          );
        });
    });
  });

  describe("Login Functionalities", () => {
    it("Should login a User", () => {
      const credentials = {
        email: "harsh123@gmail.com",
        password: "harsh123",
      };
      return request(app)
        .post("/auth/login")
        .send(credentials)
        .expect("Content-type", /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty("token");
          expect(response.body.user.name).toEqual("Harsh");
          expect(response.body.user.email).toEqual("harsh123@gmail.com");
        });
    });

    it("Should return an error for incomplete data", () => {
      const imcompleteCredentials = {
        email: "harsh123@gmail.com",
      };

      return request(app)
        .post("/auth/login")
        .send(imcompleteCredentials)
        .expect("Content-type", /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: "Please provide all the necessary fileds.",
            })
          );
        });
    });

    it("Should return an error for incorrect credentials", () => {
      const imcompleteCredentials = {
        email: "harsh123@gmail.com",
        password: "harsh456",
      };

      return request(app)
        .post("/auth/login")
        .send(imcompleteCredentials)
        .expect("Content-type", /json/)
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              error: "Invalid credentials",
            })
          );
        });
    });
  });
});
