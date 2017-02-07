'use strict';

const router = require('express').Router();

module.exports = (fetchEventByKey) =>{
	router.get('/hotspot', (req, res) => {
		const id = req.query.id;
		fetchEventByKey(id).then(
			e => res.render('hotspot.ect',
							{ event: e,
							  scheme: req.protocol,
							  host: req.headers.host,
							  id: id
							} )
		)
	});
	return router;
};
