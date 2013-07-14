#!/usr/bin/env node
sys = require('util');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";
var CHECKSFILE_DEFAULT = "checks.json";
var html_result = [];

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist.Exiting.", instr);
        process.exit(1);  
    }
    
    return instr;  
};

var cheerioHtmlFile = function (html) {
    return cheerio.load(html);
};

var loadChecks = function (checkfile) {
    return JSON.parse(fs.readFileSync(checkfile));
};

var checkHtmlFile = function (url, checksfile) {
    
    var result = rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
            sys.puts('Error: ' + result.message);
            this.retry(5000); // try again after 5 sec
        } else {
            $ = cheerioHtmlFile(result.toString());
            var checks = loadChecks(checksfile).sort();
            var out = {};
                        
            for (var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;    
            }

            outJson = JSON.stringify(out, null, 4);
            console.log(outJson);
        }
    });;
};


var clone = function(fn) {
    return fn.bind({});    
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url-path>', 'url to index.html', undefined , HTMLFILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;    
}
