const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.get('/people', async (req, res) => {
	let arrayPeople = [];
	let nextPage = 'https://swapi.dev/api/people/';

	while (nextPage) {
		const people = await fetch(nextPage);
		const peopleJson = await people.json();

		arrayPeople.push(...peopleJson.results);

		nextPage = peopleJson.next;
	}

	switch (req.query.sortBy) {
		case 'name':
			arrayPeople.sort((a, b) => {
				if (a.name > b.name) {
					return 1;
				}
				if (a.name < b.name) {
					return -1;
				}
				return 0;
			});
			break;

		case 'height':
			arrayPeople.sort((a, b) => {
				if (a.height > b.height) {
					return 1;
				}
				if (a.height < b.height) {
					return -1;
				}
				return 0;
			});
			break;

		case 'mass':
			arrayPeople.sort((a, b) => {
				if (a.mass > b.mass) {
					return 1;
				}
				if (a.mass < b.mass) {
					return -1;
				}
				return 0;
			});
			break;

		default:
			break;
	}
	return res.json(arrayPeople);
});

app.get('/planets', async (_req, res) => {
	let arrayPlanets = [];
	let nextPage = 'https://swapi.dev/api/planets/';

	while (nextPage) {
		const planets = await fetch(nextPage);
		const planetsJson = await planets.json();

		const planetsResults = await Promise.all(
			planetsJson.results.map(async (planet) => {
				planet.residents = await Promise.all(
					planet.residents.map(async (residentUrl) => {
						const resident = await fetch(residentUrl);
						const residentJson = await resident.json();
						return residentJson.name;
					})
				);
				return planet;
			})
		);

		arrayPlanets.push(...planetsResults);

		nextPage = planetsJson.next;
	}

	return res.json(arrayPlanets);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
