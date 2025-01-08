/**
 * @module MainRoutes
 * @description Handles main application routes via POST method only
 * @version 1.0.0
 * @author nullptr
 */

const CaptchaController = require('../controllers/CaptchaController');

async function MainRoutes(Fastify, Options) {
    const _RouteOptions = {
        schema: {
            response: {
                405: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }

    Fastify.route({
        method: ['POST'],
        url: '/',
        ..._RouteOptions,
        handler: async (Request, Reply) => {

            let _Output;
            await CaptchaController.PredictImage(Request.body.image)
            .then(Result => {
                _Output = Result;
            })
            .catch(Error => {
                _Output = Error;
            });
            
            return _Output;

        }
    });
}

module.exports = MainRoutes;