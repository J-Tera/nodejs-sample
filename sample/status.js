'use strict';

const router = require('express').Router();

const statusSymbols = ['○', '×', '△'];

const genNewStatus = (name, date, status) => {
	return { name: name, [date]: statusSymbols[status] };
}

const genNewStatusList = (stlist, name, date, status) => {
	if (! stlist) return genNewStatus(name, date, status);
	
	const updStatus = i => {
		if (! stlist[i]) {
			stlist[i] = genNewStatus(name, date, status);
			return stlist;
		} else if ( stlist[i].name === name ) {
			stlist[i][date] = statusSymbols[status];
			return stlist;
		}
		return updStatus( i + 1 );
	}

	return updStatus(0);
}

const storeNewStatusList = (e, name, date, status) => {
	e.statuslist = genNewStatusList(e.statuslist, name, date, status);
	return e;
}

module.exports = (fetchEventByKey, storeEvent) =>{
	router.get('/api', (req, res) => {
		const r = req.query;
		fetchEventByKey(r.id)
		.then( e => storeNewStatusList(e, r.name, r.date, r.status) )
		.then( e => {res.send(e); return e} )
		.then( e => storeEvent(e) )
	});
	return router;
};

