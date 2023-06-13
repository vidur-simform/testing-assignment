const request = require("supertest");
const path = require('path');
const app = require("../app");
const User = require("../models/user");


describe("Feed APIs", () => {
    let  userId;

    afterAll(async () => {
        await User.findByIdAndDelete(userId);
    });

    //TC 1.1
    it('POST /auth/signup --> 201', async () => {

        const response = await request(app).post('/auth/signup')
            .send({
                email: "dummyuser1@dummy.com",
                name: "dummyname1",
                password: "dummypassword1"
            })
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String),
                userId: expect.any(String)
            })
        )
        userId = response.body.userId;
    })

    //TC 2.1
    it('POST /auth/signin --> 200', async () => {

        const response = await request(app).post('/auth/signin')
            .send({
                email: "dummyuser1@dummy.com",
                name: "dummyname1",
                password: "dummypassword1"
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                userId: expect.any(String)
            })
        )
    })
})