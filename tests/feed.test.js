const request = require("supertest");
const app = require("../app");


describe("Feed APIs", () => {
    it('GET /posts --> array posts', async () => {
        const response = await request(app).get('/feed/posts')
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
})
it('GET /post/{postId} --> fetches post by id', async () => {
    const response = await request(app)
        .get('/feed/post/6423dc98ff94778f30d75a8d')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body).toEqual(
        expect.objectContaining({
            message: expect.any(String),
            post: expect.objectContaining({
                _id: expect.any(String),
                title: expect.any(String),
                imageUrl: expect.any(String),
                content: expect.any(String),
                creator: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                __v: expect.any(Number)
            })
        })
    )
})

it('GET /post/{postId} --> 404', async () => {
    await request(app)
        .get('/feed/post/1')
        .expect(404)
})

it('POST /addpost --> 201', async () => {
    const response = await request(app)
        .post('/feed/addpost')
        .send({
            title: "tmp title",
            content: "Tmp content",
            image: ""
        })
        .expect('Content-Type', /json/)
        .expect(201);
    expect(response.body).toEqual(
        expect.objectContaining({
            message: expect.any(String),
            post: expect.objectContaining({
                _id: expect.any(String),
                title: expect.any(String),
                imageUrl: expect.any(String),
                content: expect.any(String),
                creator: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                __v: expect.any(Number)
            }),
            creator: expect.objectContaining({
                _id: expect.any(String),
                name: expect.any(String)
            })
        })
    )
})

it('PUT /post/{postId} --> 200', async () => {
    const response = await request(app)
        .put('/feed/post/648708cf34c4cacee3fe2442')
        .expect('Content-Type', /json/)
        .expect(200)
    expect(response.body).toEqual(
        expect.objectContaining({
            message: expect.any(String),
            post: expect.objectContaining({
                _id: expect.any(String),
                title: expect.any(String),
                imageUrl: expect.any(String),
                content: expect.any(String),
                creator: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                __v: expect.any(Number)
            })
        })
    )
})

it('DELETE /post/{postId} --> 201', async () => {
    const response = await request(app)
        .delete('/feed/addpost/6423dc98ff94778f30d75a8d')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(response.body).toEqual(
        expect.objectContaining({
            message: expect.any(String)
        })
    )
})

it('TMP /post/{postId} --> 201', () => {

})
