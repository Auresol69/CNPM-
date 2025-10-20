/**
 * Creates a controller function from a factory function.
 * The factory function (e.g., selectAll, createOne) expects a Mongoose Model.
 * This middleware takes the factory, gets the Model from `req.Model` (set by `getModel` middleware),
 * and then executes the resulting handler.
 * @param {Function} factoryFn - The factory function from handlerFactory (e.g., selectAll, createOne).
 * @returns {import("express").RequestHandler} An Express request handler.
 */
const createController = (factoryFn) => (req, res, next) => {
    return factoryFn(req.Model)(req,res,next);
}

module.exports = { createController }