exports.getErrorPage = (error, req, res, next) => {
    console.log(error)
    res.render('errorpage', { pageTitle: 'Something went wrong'})
};
