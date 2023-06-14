const request = require("supertest");
const path = require('path');
const app = require("../app");
const User = require("../models/user");


describe("Feed APIs", function() {
    let postId, userId, authToken;

    beforeAll(async () => {

        //creating dummy user
        const responseSignup = await request(app).post('/auth/signup')
            .send({
                email: "dummyuser@dummy.com",
                name: "dummyname",
                password: "dummypassword"
            })
            .expect('Content-Type', /json/)
            .expect(201);

        userId = responseSignup.body.userId;

        const responseSignin = await request(app).post('/auth/signin')
            .send({
                email: "dummyuser@dummy.com",
                password: "dummypassword"
            })
            .expect('Content-Type', /json/)
            .expect(200);

        authToken = responseSignin.body.token;

    });

    afterAll(async () => {
        await User.findByIdAndDelete(userId);
    });

    //TC 1.1
    it('GET /posts --> array posts', async () => {
        const response = await request(app).get('/feed/posts')
            .set("authorization", `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String),
                posts: expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        title: expect.any(String),
                        imageUrl: expect.any(String),
                        content: expect.any(String),
                        creator: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        __v: expect.any(Number)
                    })
                ]),
                postsCount: expect.any(Number)
            })
        )
    })

    //TC 1.2
    it('GET /posts --> unauthenticated --> 401', async () => {
        const response = await request(app).get('/feed/posts')
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 2.1
    it('POST /addpost --> 201', async () => {
        const response = await request(app)
            .post('/feed/addpost')
            .set("authorization", `Bearer ${authToken}`)
            .field("title", "tmp title jest")
            .field("content", "tmp content jest")
            .attach('image', path.resolve(__dirname, `sample_image.png`))
            .expect('Content-Type', /json/)
            .expect(201);

        postId = response.body.post._id;

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String),
                post: expect.objectContaining({
                    _id: expect.any(String),
                    title: "tmp title jest",
                    imageUrl: expect.stringMatching(/sample_image.png$/),
                    content: "tmp content jest",
                    creator: `${userId}`,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(Number)
                }),
                creator: expect.objectContaining({
                    _id: `${userId}`,
                    name: "dummyname"
                })
            })
        )
    })

    //TC 2.2
    it('POST /addpost  --> unauthenticated --> 401', async () => {
        const response = await request(app)
            .post('/feed/addpost')
            .field("title", "tmp title jest")
            .field("content", "tmp content jest")
            .attach('image', path.resolve(__dirname, `sample_image.png`))
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })
    //TC 2.3
    it('POST /addpost  --> validation failure --> 422', async () => {
        const response = await request(app)
            .post('/feed/addpost')
            .set("authorization", `Bearer ${authToken}`)
            .field("title", "tmp")
            .field("content", "tmp")
            .attach('image', path.resolve(__dirname, `sample_image.png`))
            .expect('Content-Type', /json/)
            .expect(422);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 3.1 , depends on TC 2.1
    it('GET /feed/post/{postId} --> fetches post by id', async () => {
        const response = await request(app)
            .get(`/feed/post/${postId}`)
            .set("authorization", `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String),
                post: expect.objectContaining({
                    _id: `${postId}`,
                    title: "tmp title jest",
                    imageUrl: expect.stringMatching(/sample_image.png$/),
                    content: "tmp content jest",
                    creator: `${userId}`,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(Number)
                })
            })
        )
    })
    //TC 3.2 , depends on TC 2.1
    it('GET /feed/post/{postId} --> unauthenticated --> 401', async () => {
        const response = await request(app)
            .get(`/feed/post/${postId}`)
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })
    //TC 3.3 
    it('GET /feed/post/{postId} --> not found --> 404', async () => {
        const response = await request(app)
            .get(`/feed/post/1`)
            .set("authorization", `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(404);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 4.1, depends on TC 2.1
    it('PUT /feed/post/{postId} --> 200', async () => {
        const response = await request(app)
            .put(`/feed/post/${postId}`)
            .set("authorization", `Bearer ${authToken}`)
            .field("title", "tmp title jest updated")
            .field("content", "tmp content jest updated")
            .attach('image', path.resolve(__dirname, `sample_image_updated.png`))
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String),
                post: expect.objectContaining({
                    _id: `${postId}`,
                    title: "tmp title jest updated",
                    imageUrl: expect.stringMatching(/sample_image_updated.png$/),
                    content: "tmp content jest updated",
                    creator: `${userId}`,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(Number)
                })
            })
        )
    })

    //TC 4.2, depends on TC 2.1
    it('PUT /feed/post/{postId} --> unauthenticated --> 401', async () => {
        const response = await request(app)
            .put(`/feed/post/${postId}`)
            .field("title", "tmp title jest updated")
            .field("content", "tmp content jest updated")
            .attach('image', path.resolve(__dirname, `sample_image_updated.png`))
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 4.3
    it('PUT /feed/post/{postId} --> not found --> 404', async () => {
        const response = await request(app)
            .put(`/feed/post/1`)
            .set("authorization", `Bearer ${authToken}`)
            .field("title", "tmp title jest updated")
            .field("content", "tmp content jest updated")
            .attach('image', path.resolve(__dirname, `sample_image_updated.png`))
            .expect('Content-Type', /json/)
            .expect(404);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })
    //TC 4.4, depends on TC 2.1
    it('PUT /feed/post/{postId} --> validation failure --> 422', async () => {
        const response = await request(app)
            .put(`/feed/post/${postId}`)
            .set("authorization", `Bearer ${authToken}`)
            .field("title", "upd")
            .field("content", "upd")
            .attach('image', path.resolve(__dirname, `sample_image_updated.png`))
            .expect('Content-Type', /json/)
            .expect(422);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 5.1 , depends on TC 2
    it('DELETE /feed/post/{postId} --> 200', async () => {
        const response = await request(app)
            .delete(`/feed/post/${postId}`)
            .set("authorization", `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })
    //TC 5.2, depends on TC 2
    it('DELETE /feed/post/{postId} --> unauthenticated --> 401', async () => {
        const response = await request(app)
            .delete(`/feed/post/${postId}`)
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })

    //TC 5.3
    it('DELETE /feed/post/{postId} --> not found --> 404', async () => {
        const response = await request(app)
            .delete(`/feed/post/1`)
            .set("authorization", `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(404);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        )
    })
})

