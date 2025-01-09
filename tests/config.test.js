/**
 * @module config.test
 * @description Testing endpoint with utilizing config.js
 * @version 1.0.0
 * @author nullptr
 */

require('dotenv').config();

const CLIProgress = require('cli-progress');
const { createCanvas } = require('canvas');
const Config = require('./config');
const Assert = require('assert');
const Axios = require('axios');
const Mocha = require('mocha');

const { describe, it, before, after } = Mocha;

const GenerateCaptcha = () => {
    const _Canvas = createCanvas(Config.IMAGE_CONFIG.width, Config.IMAGE_CONFIG.height);
    const _Ctx = _Canvas.getContext('2d');
    
    const Text = [...Array(Config.IMAGE_CONFIG.length)]
    .map(() => 
        Config.IMAGE_CONFIG.charset.charAt(Math.floor(Math.random() * Config.IMAGE_CONFIG.charset.length))
    )
    .join('');
    
    const Gradient = _Ctx.createLinearGradient(0, 0, _Canvas.width, 0);
    Gradient.addColorStop(0, '#ffffff');
    Gradient.addColorStop(1, '#f0f0f0');
    
    _Ctx.fillStyle = Gradient;
    _Ctx.fillRect(0, 0, _Canvas.width, _Canvas.height);

    for (let i = 0; i < (Config.IMAGE_CONFIG.length * Config.IMAGE_CONFIG.difficulty); i++) {
        _Ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 1})`;
        _Ctx.beginPath();
        _Ctx.moveTo(Math.random() * _Canvas.width, Math.random() * _Canvas.height);
        _Ctx.bezierCurveTo(
            Math.random() * _Canvas.width, Math.random() * _Canvas.height,
            Math.random() * _Canvas.width, Math.random() * _Canvas.height,
            Math.random() * _Canvas.width, Math.random() * _Canvas.height
        );
        _Ctx.stroke();
    }
    
    Text.split('').forEach((Char, Index) => {
        const FontSize = Math.floor(_Canvas.height * 0.6);
        _Ctx.font = `bold ${FontSize}px Arial`;
        _Ctx.fillStyle = `rgb(${Math.random() * 80}, ${Math.random() * 80}, ${Math.random() * 80})`;
        _Ctx.translate(
            (_Canvas.width / Config.IMAGE_CONFIG.length) * Index + (_Canvas.width / Config.IMAGE_CONFIG.length * 0.3),
            _Canvas.height * 0.6
        );
        _Ctx.rotate((Math.random() - 0.5) * 0.3);
        _Ctx.fillText(Char, 0, 0);
        _Ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    
    return {
        Text,
        Image: _Canvas.toDataURL('image/jpeg', 0.9)
    };
};

describe('Captcha Recognition Tests', function() {
    const _TestCount = parseInt(Config.TEST_COUNT) || 100;
    const _ProgressBar = new CLIProgress.SingleBar({
        format: 'Test Progress |{bar}| {percentage}% || {value}/{total} Tests || Accuracy: {accuracy}%',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591'
    });

    let SuccessCount = 0;

    before(() => {
        _ProgressBar.start(_TestCount, 0, { accuracy: 0 });
    });

    after(() => {
        _ProgressBar.stop();
    });

    it(`Should recognize ${_TestCount} captchas with high accuracy`, async function() {
        this.timeout(_TestCount * 5000);
        for(let I = 0; I < _TestCount; I++) {
            const Captcha = GenerateCaptcha();

            try {
                const Response = await Axios.post(`http://${process.env.HOST}:${process.env.PORT}/`, {
                    image: Captcha.Image
                });
                if(Response.data.Prediction === Captcha.Text) {
                    SuccessCount++;
                }
                _ProgressBar.update(I + 1, {
                    accuracy: ((SuccessCount / (I + 1)) * 100).toFixed(2)
                });
            } catch(Error) {
                throw Error;
            }
        }
        const FinalAccuracy = (SuccessCount / _TestCount) * 100;
        Assert(FinalAccuracy > 75, `Accuracy ${FinalAccuracy}% is below required (75%)`);
    });
});