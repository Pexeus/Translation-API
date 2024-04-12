import express from "express"

export class Api {
    constructor(translator) {
        this.translator = translator
        this.app = express();

        this.createRoutes()
    }

    createRoutes() {
        // Assuming you have a translationQueue array to store translation requests
        const translationQueue = [];

        // Middleware to handle translations sequentially
        const translationMiddleware = async (req, res, next) => {
            try {
                // Add translation request to the queue
                translationQueue.push({ req, res, next });

                // If this is the only translation request in the queue, execute it
                if (translationQueue.length === 1) {
                    await translateNext();
                }
            } catch (error) {
                next(error);
            }
        };

        // Function to translate the next request in the queue
        const translateNext = async () => {
            const { req, res, next } = translationQueue[0]; // Get the first item in the queue
            const { from, to, text } = req.params;

            await this.translator.setLanguages(from, to);
            const translation = await this.translator.translate(text);

            res.end(translation);

            // Remove the completed request from the queue
            translationQueue.shift();

            // If there are more translation requests in the queue, translate the next one
            if (translationQueue.length > 0) {
                await translateNext();
            }
        };

        // Route handler with translation middleware
        this.app.get("/translate/:from/:to/:text", translationMiddleware);
    }

    start(port) {
        this.app.listen(port, () => {
            console.log(`API is running on port ${port}`);
        });
    }
}