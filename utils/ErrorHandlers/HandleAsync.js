
const handleAsync = (fnc) => {
    return (req, res, next) => {
        fnc(req, res, next).catch(e => next(e));
    }
}
module.exports = handleAsync;