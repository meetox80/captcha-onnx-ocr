/**
 * @module CaptchaController
 * @description Handles captcha prediction logic
 * @version 1.0.0
 * @author nullptr
 */

const ORT = require('onnxruntime-node');
const Sharp = require('sharp');
const { Tokenizer } = require('../tokenizer/tokenizer_base');

const _ModelData = {
    Size: [32, 128],
    Charset: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
};

const TransformImage = async (_Buffer) => {
    const ImageData = await Sharp(_Buffer)
        .resize(_ModelData.Size[1], _ModelData.Size[0], { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const TensorArray = new Float32Array(3 * _ModelData.Size[0] * _ModelData.Size[1]);
    const PixelLength = _ModelData.Size[0] * _ModelData.Size[1];
    
    Array.from({ length: ImageData.data.length / 3 }, (_, Index) => {
        const PixelX = Index % _ModelData.Size[1];
        const PixelY = Math.floor(Index / _ModelData.Size[1]);
        const Position = PixelY * _ModelData.Size[1] + PixelX;
        const RawIndex = Index * 3;

        TensorArray[Position] = (ImageData.data[RawIndex] / 255 - 0.5) / 0.5;
        TensorArray[PixelLength + Position] = (ImageData.data[RawIndex + 1] / 255 - 0.5) / 0.5;
        TensorArray[2 * PixelLength + Position] = (ImageData.data[RawIndex + 2] / 255 - 0.5) / 0.5;
    });

    return new ORT.Tensor(
        'float32',
        TensorArray,
        [1, 3, _ModelData.Size[0], _ModelData.Size[1]]
    );
};

const SoftMax = InputArray => {
    const Max = Math.max(...InputArray);
    const Exp = InputArray.map(Value => Math.exp(Value - Max));
    const Sum = Exp.reduce((A, B) => A + B);
    return Exp.map(Value => Value / Sum);
};

const CreateModel = async ModelPath => {
    const Model = await ORT.InferenceSession.create(ModelPath);
    return { Model, InputName: Model.inputNames[0] };
};

const PredictImage = async Base64Input => {
    const { Model, InputName } = await CreateModel(
        require('path').join(__dirname, "../../models/captcha.onnx")
    );

    if (!Base64Input?.match(/^data:image\/\w+;base64,/)) {
        throw new Error('Invalid image format');
    }

    try {
        const ImageBuffer = Buffer.from(
            Base64Input.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
        );

        const InputTensor = await TransformImage(ImageBuffer);
        const ModelOutput = await Model.run({ [InputName]: InputTensor });
        const ProcessedOutput = ModelOutput[Model.outputNames[0]];

        if (!ProcessedOutput?.data) {
            throw new Error("Invalid model output");
        }

        const SequenceLength = ProcessedOutput.dims[1];
        const CharacterLength = ProcessedOutput.dims[2];
        const Reshaped = [];

        for (let Idx = 0; Idx < SequenceLength; Idx++) {
            const Slice = Array.from(ProcessedOutput.data.slice(
                Idx * CharacterLength,
                (Idx + 1) * CharacterLength
            ));
            Reshaped.push(SoftMax(Slice));
        }

        const [Predictions] = new Tokenizer(_ModelData.Charset).decode([Reshaped]);

        return {
            Prediction: Predictions[0],
            Confidence: Math.max(...ProcessedOutput.data),
            Status: "SUCCESS"
        };
    } catch (Error) {
        return {
            Message: Error.message,
            Status: "ERROR",
            Timestamp: new Date().toISOString()
        };
    }
};

module.exports = {
    PredictImage
};