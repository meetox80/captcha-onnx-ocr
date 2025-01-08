/**
 * @module app
 * @description Main application entry point
 * @version 1.0.0
 * @author nullptr
 */

require('dotenv').config();

const Fastify = require('fastify');

const MainRoutes = require('./routes/MainRoutes');
const CaptchaController = require('./controllers/CaptchaController');

const NODE_ENV = process.env.NODE_ENV || 'development';

const App = Fastify({
    logger: {
        level: NODE_ENV === 'production' ? 'info' : 'debug',
        transport: {
            target: 'pino-pretty',
        }
    }
});

App.register(MainRoutes);

const _Shutdown = async (Signal) => {
    App.log.info(`Recieved ${Signal}, shutting down.`);
    await App.close();

    process.exit(0);
}

const _MainThread = async () => {
    try {
        await CaptchaController.InitModel();

        await App.listen({
            port: process.env.PORT || 1337,
            host: '0.0.0.0'
        });
    } catch (Error) {
        App.log.error(Error);
    }
};

process.on('SIGTERM', () => _Shutdown('SIGTERM'));
process.on('SIGINT', () => _Shutdown('SIGINT'));

_MainThread();