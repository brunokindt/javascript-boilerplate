import config from 'config';
import jwt from 'jsonwebtoken';
import faker from 'faker';
import uuid from 'uuid';

import data from '../fixtures/demo_fixtures.json';
import productFactory from '../../src/api/products/productModel';
import userFactory from '../../src/api/users/userModel';

export default function(client) {
    const productQueries = productFactory(client);
    const userQueries = userFactory(client);

    function* loadDefaultFixtures() {
        yield productQueries.batchInsert(data.products);
        yield userQueries.batchInsert(data.users);
    }

    function* removeAllFixtures() {
        yield client.query_('DELETE FROM product');
        yield client.query_('DELETE FROM user_order');
        yield client.query_('DELETE FROM user_account');
    }

    function* getTokenFor(email) {
        // const causes an error! don't know why
        let user = yield userQueries.findByEmail(email);
        delete user.id;

        return jwt.sign(user, config.apps.api.security.jwt.privateKey);
    }

    function* addProduct(productData) {
        // const causes an error! don't know why
        let defaultProductData = {
            reference: uuid.v1(),
            width: 60,
            height: 40,
            price: faker.random.number(),
            thumbnail: faker.image.imageUrl(60, 60),
            image: faker.image.imageUrl(400, 400),
            description: faker.lorem.sentence(),
            stock: faker.random.number(),
        };

        // ES7, in Babel it is experimental stage 2 and enabled by default
        return yield productQueries.insertOne({ ...defaultProductData, ...productData });
    }

    return {
        loadDefaultFixtures,
        removeAllFixtures,
        getTokenFor,
        addProduct,
    };
}