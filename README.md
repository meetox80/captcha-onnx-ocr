# captcha-onnx-ocr
AI-powered CAPTCHA recognition system leveraging ONNX for accurate and efficient verification, integrated with a Node.js web API.


## Installation
```sh
pnpm install
```

## Usage
```
pnpm run start
```
> POST Request body:
```
{
    "image": "data:image/jpeg;base64,<...>"
}
```

## Running Tests
> Remember to **launch the server seperately**
```sh
pnpm run start # Server
```
```sh
pnpm run test  # Tests client
```

## Tech Stack (Libraries)

| Library                                                                                                                                                                                                                                                                  | Usage                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| - [Assert](https://www.npmjs.com/package/assert)<br>- [Axios](https://www.npmjs.com/package/axios)<br>- [Canvas](https://www.npmjs.com/package/canvas)<br>- [CLI-Progress](https://www.npmjs.com/package/cli-progress)<br>- [Mocha](https://www.npmjs.com/package/mocha) | <br><p align="center">Testing Functionality</p>   |
| - [Fastify](https://www.npmjs.com/package/fastify)<br>- [Pino-Pretty](https://www.npmjs.com/package/pino-pretty)                                                                                                                                                         | <p align="center">**API**</p>                     |
| - [OnnxRuntime-Node](https://www.npmjs.com/package/onnxruntime-node)<br>- [Sharp](https://www.npmjs.com/package/sharp)                                                                                                                                                   | <p align="center">**ONNX Recognition System**</p> |
| - [Dotenv](https://www.npmjs.com/package/dotenv)                                                                                                                                                                                                                         | <p align="center">**Envireonment variables**</p>  |
| - [Nodemon](https://www.npmjs.com/package/nodemon)                                                                                                                                                                                                                       | <p align="center">Development reload mode</p>     |
