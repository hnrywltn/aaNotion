
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@notionhq/client');
// require('dotenv').config();

const NOTION_API_KEY = `secret_epKqKTPseSaBhuHhVqep6g0KWiE8JHvJAU2vDfGuu5y`;

const notion = new Client({ auth: NOTION_API_KEY });

// const PORT = process.env.PORT;
const app = express();

// create application/json parser
const jsonParser = bodyParser.json();




app.listen(5001, () => {
// app.listen(PORT, () => {
    // console.log(`Server listening at http://localhost:${PORT}`);
    console.log(`Server listening at http://localhost:${5001}`);
});




//ROUTES
app.get('/', async (req, res) =>{
    try {
        const databaseId = '06e20b7ef966467aab236e9a765e2f51';
        const response = await notion.databases.query({
          database_id: databaseId,
        });

        const cohorts = {};
        response.results.forEach(student => {
            const cohortName = student.properties.Cohort.rich_text[0].text.content;
            const studentInfo = {
                name: student.properties.Name.title[0].plain_text,
                id: student.id,
                cohort: cohortName,
                url: student.url,
            };
            cohorts[cohortName] ? cohorts[cohortName].push(studentInfo) : cohorts[cohortName] = [studentInfo];
        });

        const shuffleArray = array => {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        for(let list in cohorts){
            cohorts[list] = shuffleArray(cohorts[list]);
            const BORooms = Math.floor(cohorts[list].length / 2);
            cohorts[list][0].breakoutRoom = BORooms;
            for(let i = 1; i < cohorts[list].length; i++){
                let room = i > BORooms ? Math.abs(BORooms - i) : i;
                cohorts[list][i].breakoutRoom = room;

                const response = await notion.pages.update({
                    page_id: cohorts[list][i].id,
                    properties: {
                    ['Breakout Room']: {
                        number: cohorts[list][i].breakoutRoom,
                    },
                    },
                });
            }
        }
/////////////////////
// console.log(cohorts)
/////////////////////

        res.json(cohorts);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        }
});

app.post('/', async (req, res) =>{

});
