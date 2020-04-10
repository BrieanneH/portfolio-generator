const fs = require("fs");
const path = require("path");
const open = require("open");
const inquirer = require('inquirer');
const convertFactory = require('electron-html-to');
const api = require("./api")
const generateHTML = require("./generateHTML");
//requiring 


//creating generated questions
const questions = [
    {
        type: "input",
        name: "github",
        message: "What's your GitHub username?"
    },
    {
        type: "list",
        name: "color",
        message: "What's your desired color scheme?",
        choices: ["blue", "red", "green", "pink"]
    }
];

function writeToFile(fileName, data) {
    return fs.writeFileSync(path.join(process.cwd(), fileName), data)
};

//creating a function that walks through the template
function init() {
    //start quesions with inquirer
    inquirer.prompt(questions).then(({github, color}) => {
        console.log("Searching...");

        api 
            .getUser(github)//retrieve github acct
            .then(response =>
                api.getTotalStars(github).then(stars => { //calling to api.js to get github stars
                    return generateHTML ({
                        stars,
                        color,
                        //spread syntax used
                        ...response.data
                        //allows for expansion (when there are no aruguments used)
                    });
                })
            )
            .then(html => { //from electon-html-to package--lets us conver our webpage using electron
                const conversion = convertFactory({
                    converterPath: convertFactory.converters.PDF
                });

            conversion({html}, function(err, result) {
                if (err) {
                    return console.error(err);
                };
                let num = 0;
                
                while (fs.existsSync(path.join(__dirname, `resume_${color}_${num}.pdf`))) {
                    num++
                };
                //https://nodejs.org/en/knowledge/advanced/streams/how-to-use-stream-pipe/
                result.stream.pipe(//stream to stem
               
                    fs.createWriteStream(path.join(__dirname, `resume_${color}_${num}.pdf`))
                    ); //craete stream to an open file desciptor
                    //terminates convertPDF process
                    conversion.kill();

                    open(path.join(process.cwd(), `resume_${color}_${num}.pdf`));
                });

        });
    });
};

init();