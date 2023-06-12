const request = require("supertest");
const app = require("../app");
const Todo = require("../models/todo");
const User = require("../models/user");

describe("Todos API", () => {
  let testingId, authToken;

  beforeAll(async () => {
    const testUser = {
      name: "test",
      email: "test123@gmail.com",
      password: "test123",
    };

    await request(app).post("/auth/signUp").send(testUser);

    const response = await request(app).post("/auth/login").send({
      email: "test123@gmail.com",
      password: "test123",
    });

    authToken = response.body.token;

    const todo = new Todo({
      name: "Finish Test cases",
    });
    const insertedTodo = await todo.save();
    testingId = insertedTodo._id;
  });

  afterAll(async () => {
    await Todo.findByIdAndDelete(testingId);
    await User.deleteOne({ name: "test" });
  });

  it("GET /todos --> array todos", async () => {
    return await request(app)
      .get("/todos")
      .expect("Content-type", /json/)
      .expect(200)
      .then((reponse) => {
        expect(reponse.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              completed: expect.any(Boolean),
            }),
          ])
        );
      });
  });

  describe("it will create and delete", () => {
    let id;
    it("POST /todos --> create todos", () => {
      return request(app)
        .post("/todos")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          name: "Submit assignment",
        })
        .expect("Content-type", /json/)
        .expect(201)
        .then((reponse) => {
          id = reponse.body._id;
          expect(reponse.body).toEqual(
            expect.objectContaining({
              name: "Submit assignment",
              completed: false,
            })
          );
        });
    });

    afterEach(async () => {
      await Todo.deleteOne({ _id: id });
    });
  });

  it("should return an error if not logged in", async () => {
    const newTodo = {
      name: "Test Todo",
    };

    const response = await request(app)
      .post("/todos")
      .send(newTodo)
      .expect("Content-type", /json/)
      .expect(401);

    expect(response.body).toMatchObject({
      error: "Invalid Token",
    });
  });

  it("GET /todos/id --> find specific todo by id", () => {
    return request(app)
      .get(`/todos/${testingId}`)
      .expect("Content-type", /json/)
      .expect(200)
      .then((reponse) => {
        expect(reponse.body).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            completed: expect.any(Boolean),
          })
        );
      });
  });

  it("GET /todos/id --> 404 if not found", () => {
    return request(app)
      .get("/todos/64818a285f8742f91598de45")
      .expect("Content-type", /json/)
      .expect(404);
  });

  it("PUT /todos/id --> update specific todo by id", () => {
    return request(app)
      .put(`/todos/${testingId}`)
      .send({
        name: "Submit assignment2",
        completed: true,
      })
      .expect("Content-type", /json/)
      .expect(200)
      .then((reponse) => {
        expect(reponse.body).toEqual(
          expect.objectContaining({
            name: "Submit assignment2",
            completed: true,
          })
        );
      });
  });

  it("DELETE /todos/id --> delete specific todo by id", () => {
    return request(app)
      .delete(`/todos/${testingId}`)
      .expect("Content-type", /json/)
      .expect(200)
      .then((reponse) => {
        expect(reponse.body).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            completed: expect.any(Boolean),
          })
        );
      });
  });

  it("POST /todos --> validates request body", () => {
    return request(app)
      .post("/todos")
      .send({ name: 123 })
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-type", /json/)
      .expect(422);
  });
});