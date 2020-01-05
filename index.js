const fs = require("fs");
const path = require("path");
const open = require("open");
const inquirer = require('inquirer');
const convertFactory = require('electron-html-to');
const api = require("./api")
const generateHTML = require("./generateHTML");


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
//process.cwd used to resolve relative paths from callback containing two arguments
function writeToFile(fileName, data) {
    return fs.writeFileSync(path.join(process.cwd(), fileName), data)
};

function init() {
    inquirer.prompt(questions).then(({github, color}) => {
        console.log("Searching...");

        api 
            .getUser(github)
            .then(response =>
                api.getTotalStars(github).then(stars => {
                    return generateHTML ({
                        stars,
                        color,
                        //spread syntax used
                        ...response.data
                    });
                })
            )
            .then(html => {
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
                result.stream.pipe(
                    fs.createWriteStream(path.join(__dirname, `resume_${color}_${num}.pdf`))
                    );
                    //terminates convertPDF process
                    conversion.kill();

                    open(path.join(process.cwd(), `resume_${color}_${num}.pdf`));
                });

        });
    });
};

init();