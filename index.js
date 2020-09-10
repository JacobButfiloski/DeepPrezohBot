const needle = require('needle');
const tokenFile = require('./tokens');
const token = tokenFile.clienttoken;
const deepai = require('deepai');
deepai.setApiKey(tokenFile.deepaitoken);

var endpointUrl;
var tweetData = "";
pullTweet();
//Function to initiate getting twit data
async function pullTweet() {
    endpointUrl = 'https://api.twitter.com/2/tweets/search/recent'
    getRequest();
    retreive();
}

//Set params / entry point
async function getRequest() {

    // Edit query parameters below
    const params = {
        'query': 'from:prezoh -is:retweet', 
        'tweet.fields': 'author_id',
        'max_results': 100
    } 

    const res = await needle('get', endpointUrl, params, { headers: {
        "authorization": `Bearer ${token}`
    }})

    if(res.body) {
        return res.body;
    } else {
        throw new Error ('Unsuccessful request')
    }
}

//Retreive data
async function retreive() {

    try {
        // Make request
        const response = await getRequest();
        console.log(response);
        for(var i = 0; i < response.data.length; i++)
        {
            var temp = response.data[i].text.replace('@',''); //remove user tags
            temp = temp.replace(/<a\b[^>]*>(.*?)<\/a>/i,""); //remove links
            temp = temp.replace(/[^\x20-\x7E]+/g, ""); //remove unprintable ascii
            temp = temp.replace('  ', ' '); //remove double space
            temp = temp.replace('.', ''); //remove periods
            tweetData += " " + temp;
        }
        console.log(tweetData); //returns last tweets
        generateTweet(tweetData);

    } catch(e) {
        console.log(e);
        process.exit(-1);
    }
  };

async function generateTweet(data) {
    try {
        var resp = await deepai.callStandardApi("text-generator", {
            text: data,
        });
        var result = JSON.stringify(resp);
        result = result.replace(data, '');
        result = result.replace(/(\r\n|\n|\r)/gm, " ");
        console.log(result);
    } catch (error){
        console.error(error);
    }
}