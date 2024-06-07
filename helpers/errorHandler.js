export function sendError(res, error) {
	res.status(error.status || 500)
	res.send({
		error: {
			status: error.status || 500,
			message: error.message,
		},
	});
}

export function mySQLErrorHandler(error) {
	console.error('Error querying MySQL:', error.code);
	error.message = "There is an error while handling your request, please try again later.";
}